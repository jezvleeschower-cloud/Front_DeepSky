package com.deepsky.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import com.deepsky.backend.exception.RateLimitException;
import com.deepsky.backend.model.Categoria;
import com.deepsky.backend.model.ComentarioForo;
import com.deepsky.backend.model.Foro;
import com.deepsky.backend.repository.CategoriaRepository;
import com.deepsky.backend.repository.ComentarioForoRepository;
import com.deepsky.backend.repository.ForoRepository;

public class ForoService {
    private static final Duration COOLDOWN_ELIMINAR_HILO = Duration.ofHours(2);

    // En memoria: usuarioId (DIVULGADOR) -> momento de su última eliminación de hilo exitosa.
    // Es intencional que sea en memoria y no en BD: es solo un límite de frecuencia de uso,
    // no un dato de negocio que deba persistir entre reinicios del servidor.
    private final Map<Integer, LocalDateTime> ultimaEliminacionHiloPorUsuario = new ConcurrentHashMap<>();

    private final ForoRepository foroRepository;
    private final CategoriaRepository categoriaRepository;
    private final ComentarioForoRepository comentarioForoRepository;
    private final ModeracionTextoService moderacionTextoService;

    public ForoService(ForoRepository foroRepository, 
                          CategoriaRepository categoriaRepository,
                          ComentarioForoRepository comentarioForoRepository,
                          ModeracionTextoService moderacionTextoService) {
        this.foroRepository = foroRepository;
        this.categoriaRepository = categoriaRepository;
        this.comentarioForoRepository = comentarioForoRepository;
        this.moderacionTextoService = moderacionTextoService;
    }

    public List<Foro> obtenerTodosLosHilos() {
        return foroRepository.findAll();
    }

    // Crear Hilo (solo DIVULGADOR) con soporte para URL de imagen opcional
    public Foro crearHilo(int usuarioId, String usuarioRol, String titulo, String contenido, String nombreCategoria, String urlImagen) {
        // 1. Validar permiso de rol (Sólo DIVULGADOR)
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo los usuarios con rol DIVULGADOR pueden crear nuevos hilos.");
        }

        // 2. Validar campos obligatorios
        if (titulo == null || titulo.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre/título del hilo es obligatorio.");
        }
        if (contenido == null || contenido.trim().isEmpty()) {
            throw new IllegalArgumentException("La descripción/contenido del hilo no puede estar vacía.");
        }
        if (nombreCategoria == null || nombreCategoria.trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es obligatoria.");
        }

        // 2.1 Moderación de contenido: bloquea lenguaje altisonante antes de tocar la BD
        moderacionTextoService.validar(titulo);
        moderacionTextoService.validar(contenido);

        // 3. Validar / Crear Categoría dinámicamente
        String catNombreLimpio = nombreCategoria.trim();
        Optional<Categoria> optCat = categoriaRepository.findByNombre(catNombreLimpio);
        
        Categoria categoriaTarget;
        if (optCat.isPresent()) {
            categoriaTarget = optCat.get();
        } else {
            Categoria nuevaCategoria = new Categoria();
            nuevaCategoria.setNombre(catNombreLimpio);
            nuevaCategoria.setDescripcion("Categoría creada dinámicamente al publicar hilo.");
            categoriaTarget = categoriaRepository.save(nuevaCategoria);
        }

        // 4. Instanciar y guardar el nuevo hilo
        Foro nuevoHilo = new Foro();
        nuevoHilo.setUsuarioId(usuarioId);
        nuevoHilo.setCategoriaId(categoriaTarget.getIdCategoria());
        nuevoHilo.setCategoriaNombre(categoriaTarget.getNombre());
        nuevoHilo.setTitulo(titulo.trim());
        nuevoHilo.setContenido(contenido.trim());
        nuevoHilo.setUrlImagen(urlImagen); // Guarda la URL de Cloudinary (o null si no llevó imagen)

        return foroRepository.save(nuevoHilo);
    }

    // Comentar en Hilo (Permitido para DIVULGADOR y PARTICIPANTE)
    public ComentarioForo agregarComentario(int foroId, int usuarioId, String usuarioRol, String contenido, String urlImagen) {
        // 1. Validar que el rol sea uno de los autorizados.
        //    Los roles reales del sistema son DIVULGADOR y PARTICIPANTE (ver USUARIO.ROL en la BD);
        //    "USUARIO" nunca existió como rol, por eso todo comentario de un usuario normal fallaba.
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol) && !"PARTICIPANTE".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Tu rol no tiene permisos para comentar.");
        }

        // 2. Validar contenido
        if (contenido == null || contenido.trim().isEmpty()) {
            throw new IllegalArgumentException("El comentario no puede estar vacío.");
        }

        // 2.1 Moderación de contenido: bloquea lenguaje altisonante antes de tocar la BD
        moderacionTextoService.validar(contenido);

        // 3. Crear y guardar comentario
        ComentarioForo comentario = new ComentarioForo();
        comentario.setForoId(foroId);
        comentario.setUsuarioId(usuarioId);
        comentario.setContenido(contenido.trim());
        comentario.setUrlImagen(urlImagen); // Guarda la URL de Cloudinary (o null)

        return comentarioForoRepository.save(comentario);
    }

    // Obtener comentarios de un hilo
    public List<ComentarioForo> obtenerComentariosPorHilo(int foroId) {
        return comentarioForoRepository.findByForoId(foroId);
    }

    // Eliminar comentario con validación de permisos
    public boolean eliminarComentario(int foroId, int comentarioId, int usuarioId, String usuarioRol) {
        ComentarioForo comentario = comentarioForoRepository.findById(comentarioId);
        if (comentario == null || comentario.getForoId() != foroId) {
            return false;
        }

        // Solo los usuarios con rol DIVULGADOR pueden eliminar comentarios (moderación).
        if ("DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            return comentarioForoRepository.deleteById(comentarioId);
        }

        // No autorizado para otros roles
        throw new IllegalArgumentException("Acceso denegado: solo los usuarios con rol DIVULGADOR pueden eliminar comentarios.");
    }

    /**
     * Elimina un hilo del foro. Cualquier usuario con rol DIVULGADOR puede
     * eliminar el hilo de otro usuario (moderación), pero como máximo puede
     * eliminar un hilo cada 2 horas, sin importar cuál hilo sea.
     */
    public boolean eliminarHilo(int foroId, int usuarioId, String usuarioRol) {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo DIVULGADOR puede eliminar hilos.");
        }

        LocalDateTime ultimaVez = ultimaEliminacionHiloPorUsuario.get(usuarioId);
        if (ultimaVez != null) {
            LocalDateTime disponibleDesde = ultimaVez.plus(COOLDOWN_ELIMINAR_HILO);
            if (LocalDateTime.now().isBefore(disponibleDesde)) {
                long minutosRestantes = Duration.between(LocalDateTime.now(), disponibleDesde).toMinutes() + 1;
                throw new RateLimitException(
                    "Solo puedes eliminar un hilo cada 2 horas. Podrás eliminar otro en aproximadamente "
                        + minutosRestantes + " minuto(s)."
                );
            }
        }

        Foro hilo = foroRepository.findById(foroId);
        if (hilo == null) {
            return false;
        }

        boolean eliminado = foroRepository.deleteById(foroId);
        if (eliminado) {
            // Solo se "consume" el límite cuando la eliminación realmente ocurrió.
            ultimaEliminacionHiloPorUsuario.put(usuarioId, LocalDateTime.now());
        }
        return eliminado;
    }
}