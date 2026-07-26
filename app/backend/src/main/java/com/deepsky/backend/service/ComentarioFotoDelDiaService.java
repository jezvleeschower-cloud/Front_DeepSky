package com.deepsky.backend.service;

import com.deepsky.backend.model.ComentarioFotoDelDia;
import com.deepsky.backend.repository.ComentarioFotoDelDiaRepository;
import com.deepsky.backend.repository.FotoDelDiaRepository;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

public class ComentarioFotoDelDiaService {
    
    private final ComentarioFotoDelDiaRepository comentarioRepository;
    private final FotoDelDiaRepository fotoDelDiaRepository;
    private final ModeracionTextoService moderacionTextoService;
    private static final Logger LOGGER = Logger.getLogger(ComentarioFotoDelDiaService.class.getName());

    public ComentarioFotoDelDiaService(ComentarioFotoDelDiaRepository comentarioRepository,
                                        FotoDelDiaRepository fotoDelDiaRepository,
                                        ModeracionTextoService moderacionTextoService) {
        this.comentarioRepository = comentarioRepository;
        this.fotoDelDiaRepository = fotoDelDiaRepository;
        this.moderacionTextoService = moderacionTextoService;
    }

    public boolean publicarComentarioConFecha(String fecha, int usuarioId, String contenido) {
        if (contenido == null || contenido.trim().isEmpty()) {
            System.err.println("Intento de publicar contenido vacío bloqueado.");
            return false;
        }

        // Moderación de contenido: bloquea lenguaje altisonante antes de tocar la BD.
        // Se propaga como excepción (ContenidoInapropiadoException) para que el controller
        // pueda distinguirlo de un simple "no se pudo guardar" y responder claro al usuario.
        moderacionTextoService.validar(contenido);

        try {
            Optional<Integer> idFoto = fotoDelDiaRepository.findIdByFecha(fecha);

            if (idFoto.isPresent()) {
                ComentarioFotoDelDia comentario = new ComentarioFotoDelDia();
                comentario.setImagenDiaId(idFoto.get());
                comentario.setUsuarioId(usuarioId);
                comentario.setContenido(contenido);
                
                comentarioRepository.save(comentario);
                return true;
            }
        } catch (SQLException e) {
            LOGGER.warning("Error al publicar comentario: " + e.getMessage());
        }
        return false;
    }

    public List<ComentarioFotoDelDia> obtenerComentariosDeFoto(int imagenDiaId) {
        try {
            return comentarioRepository.findByImagenDiaId(imagenDiaId);
        } catch (SQLException e) {
            System.err.println("Error al recuperar comentarios: " + e.getMessage());
            return List.of(); 
        }
    }

    // Método principal para obtener comentarios por fecha
    public List<ComentarioFotoDelDia> obtenerComentariosPorFecha(String fecha) throws SQLException {
        Optional<Integer> idFoto = fotoDelDiaRepository.findIdByFecha(fecha);
        return idFoto.map(this::obtenerComentariosSeguro).orElse(List.of());
    }

    /**
     * Elimina un comentario. Solo los usuarios con rol DIVULGADOR pueden
     * moderar (eliminar) comentarios de la Foto del Día.
     */
    public boolean eliminarComentario(int idComentario, String usuarioRol) {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: solo los usuarios con rol DIVULGADOR pueden eliminar comentarios.");
        }
        try {
            return comentarioRepository.deleteById(idComentario);
        } catch (SQLException e) {
            LOGGER.warning("Error al eliminar comentario: " + e.getMessage());
            return false;
        }
    }

    // Método auxiliar que maneja la excepción de SQL de forma segura
    private List<ComentarioFotoDelDia> obtenerComentariosSeguro(int id) {
        try {
            return comentarioRepository.findByImagenDiaId(id);
        } catch (SQLException e) {
            System.err.println("Error al buscar comentarios: " + e.getMessage());
            return List.of();
        }
    }
}