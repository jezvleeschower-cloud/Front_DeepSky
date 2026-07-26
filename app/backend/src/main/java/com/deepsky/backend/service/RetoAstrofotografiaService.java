package com.deepsky.backend.service;

import java.sql.SQLException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.deepsky.backend.client.nasa.cloudinary.CloudinaryUploadResult;
import com.deepsky.backend.client.nasa.cloudinary.CloudinaryUploader;
import com.deepsky.backend.dto.response.ParticipacionRetoResponse;
import com.deepsky.backend.dto.response.RetoAstrofotografiaResponse;
import com.deepsky.backend.exception.RateLimitException;
import com.deepsky.backend.repository.ParticipacionRetoRepository;
import com.deepsky.backend.repository.RetoAstrofotografiaRepository;

public class RetoAstrofotografiaService {
    private static final long TAMANO_MAXIMO_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Duration COOLDOWN_ELIMINAR_RETO = Duration.ofHours(2);

    // En memoria: usuarioId (DIVULGADOR) -> momento de su última eliminación de reto exitosa.
    // Igual que en ForoService: es solo un límite de frecuencia de uso, no un dato de
    // negocio que deba persistir entre reinicios del servidor.
    private final Map<Integer, LocalDateTime> ultimaEliminacionRetoPorUsuario = new ConcurrentHashMap<>();

    private final RetoAstrofotografiaRepository retoRepository;
    private final ParticipacionRetoRepository participacionRepository;
    private final CloudinaryUploader cloudinaryUploader;
    private final ModeracionTextoService moderacionTextoService;
    private final ModeracionImagenService moderacionImagenService;

    public RetoAstrofotografiaService(RetoAstrofotografiaRepository retoRepository,
                                      ParticipacionRetoRepository participacionRepository,
                                      CloudinaryUploader cloudinaryUploader,
                                      ModeracionTextoService moderacionTextoService,
                                      ModeracionImagenService moderacionImagenService) {
        this.retoRepository = retoRepository;
        this.participacionRepository = participacionRepository;
        this.cloudinaryUploader = cloudinaryUploader;
        this.moderacionTextoService = moderacionTextoService;
        this.moderacionImagenService = moderacionImagenService;
    }

    public RetoAstrofotografiaResponse crearReto(int usuarioId, String titulo,
                                                  String descripcion, String fechaLimite,
                                                  byte[] archivoImagen, String nombreArchivoImagen)
            throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario creador es obligatorio");
        }
        if (titulo == null || titulo.isBlank()) {
            throw new IllegalArgumentException("El título del reto es obligatorio");
        }
        if (fechaLimite == null || fechaLimite.isBlank()) {
            throw new IllegalArgumentException("La fecha límite es obligatoria");
        }
        if (archivoImagen == null || archivoImagen.length == 0) {
            throw new IllegalArgumentException("Debes adjuntar una imagen de referencia/portada para el reto");
        }
        if (archivoImagen.length > TAMANO_MAXIMO_BYTES) {
            throw new IllegalArgumentException("La imagen no debe superar los 10 MB");
        }

        moderacionTextoService.validar(titulo);
        moderacionTextoService.validar(descripcion);
        moderacionImagenService.validar(archivoImagen, nombreArchivoImagen);

        CloudinaryUploadResult subida = cloudinaryUploader.subirImagenPortadaReto(archivoImagen, nombreArchivoImagen);

        int idReto = retoRepository.crear(usuarioId, titulo.trim(), descripcion, fechaLimite.trim(), subida.getUrl());
        return retoRepository.obtenerPorId(idReto)
                .orElseThrow(() -> new IllegalStateException("El reto se creó pero no pudo recuperarse"));
    }

    public List<RetoAstrofotografiaResponse> listarRetos() throws SQLException {
        return retoRepository.listarTodos();
    }

    public RetoAstrofotografiaResponse obtenerReto(int idReto) throws SQLException {
        return retoRepository.obtenerPorId(idReto)
                .orElseThrow(() -> new IllegalArgumentException("El reto solicitado no existe"));
    }

    public boolean finalizar(int idReto, int usuarioId) throws SQLException {
        RetoAstrofotografiaResponse reto = retoRepository.obtenerPorId(idReto)
                .orElseThrow(() -> new IllegalArgumentException("El reto solicitado no existe"));

        if (reto.getUsuarioId() != usuarioId) {
            throw new IllegalArgumentException("Solo el creador del reto puede finalizarlo.");
        }

        if (reto.isFinalizado()) {
            throw new IllegalArgumentException("El reto ya está finalizado.");
        }

        return retoRepository.finalizar(idReto, usuarioId);
    }

    /**
     * Elimina un reto de astrofotografía. Cualquier usuario con rol DIVULGADOR puede
     * eliminar el reto de otro usuario (moderación), pero como máximo puede
     * eliminar un reto cada 2 horas, sin importar cuál reto sea.
     */
    public boolean eliminarReto(int idReto, int usuarioId, String usuarioRol) throws SQLException {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo DIVULGADOR puede eliminar retos.");
        }

        LocalDateTime ultimaVez = ultimaEliminacionRetoPorUsuario.get(usuarioId);
        if (ultimaVez != null) {
            LocalDateTime disponibleDesde = ultimaVez.plus(COOLDOWN_ELIMINAR_RETO);
            if (LocalDateTime.now().isBefore(disponibleDesde)) {
                long minutosRestantes = Duration.between(LocalDateTime.now(), disponibleDesde).toMinutes() + 1;
                throw new RateLimitException(
                    "Solo puedes eliminar un reto cada 2 horas. Podrás eliminar otro en aproximadamente "
                        + minutosRestantes + " minuto(s)."
                );
            }
        }

        // Verifica que el reto exista (lanza si no) antes de "consumir" el límite.
        retoRepository.obtenerPorId(idReto)
                .orElseThrow(() -> new IllegalArgumentException("El reto solicitado no existe"));

        boolean eliminado = retoRepository.eliminarReto(idReto);
        if (eliminado) {
            // Solo se "consume" el límite cuando la eliminación realmente ocurrió.
            ultimaEliminacionRetoPorUsuario.put(usuarioId, LocalDateTime.now());
        }
        return eliminado;
    }

    public ParticipacionRetoResponse participar(int retoId, int usuarioId, String titulo,
                                                byte[] archivo, String nombreArchivo)
            throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }
        RetoAstrofotografiaResponse reto = retoRepository.obtenerPorId(retoId)
                .orElseThrow(() -> new IllegalArgumentException("El reto solicitado no existe"));

        if (reto.isFinalizado()) {
            throw new IllegalArgumentException("Este reto ya ha sido finalizado y no acepta más participaciones.");
        }

        if (archivo == null || archivo.length == 0) {
            throw new IllegalArgumentException("Debes adjuntar una imagen para participar");
        }
        if (archivo.length > TAMANO_MAXIMO_BYTES) {
            throw new IllegalArgumentException("La imagen no debe superar los 10 MB");
        }

        moderacionTextoService.validar(titulo);
        moderacionImagenService.validar(archivo, nombreArchivo);

        CloudinaryUploadResult subida = cloudinaryUploader.subirImagenReto(archivo, nombreArchivo);

        int idParticipacion;
        try {
            idParticipacion = participacionRepository.crear(
                    retoId, usuarioId,
                    titulo == null ? null : titulo.trim(),
                    subida.getUrl(),
                    subida.getPublicId());
        } catch (SQLException ex) {
            if (ex.getSQLState() != null && ex.getSQLState().startsWith("23")) {
                throw new IllegalArgumentException("Ya tienes una participación registrada en este reto");
            }
            throw ex;
        }

        return listarParticipaciones(retoId).stream()
                .filter(p -> p.getId() == idParticipacion)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "La participación se guardó pero no pudo recuperarse"));
    }

    public List<ParticipacionRetoResponse> listarParticipaciones(int retoId) throws SQLException {
        if (!retoRepository.existeReto(retoId)) {
            throw new IllegalArgumentException("El reto solicitado no existe");
        }
        return participacionRepository.listarPorReto(retoId);
    }

    public boolean darLike(int idParticipacion, int usuarioId) throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario es obligatorio para votar");
        }
        return participacionRepository.toggleLike(idParticipacion, usuarioId);
    }

    public boolean eliminarParticipacion(int retoId, int idParticipacion, int usuarioId, String usuarioRol)
            throws SQLException {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: solo un DIVULGADOR puede eliminar participaciones.");
        }

        RetoAstrofotografiaResponse reto = retoRepository.obtenerPorId(retoId)
                .orElseThrow(() -> new IllegalArgumentException("El reto solicitado no existe"));

        if (reto.getUsuarioId() != usuarioId) {
            throw new IllegalArgumentException("Solo el creador del reto puede eliminar participaciones de este evento.");
        }

        return participacionRepository.deleteById(idParticipacion);
    }
}