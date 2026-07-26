package com.deepsky.backend.controller;

import java.util.List;
import java.util.Map;

import com.deepsky.backend.client.nasa.cloudinary.CloudinaryUploadResult;
import com.deepsky.backend.client.nasa.cloudinary.CloudinaryUploader;
import com.deepsky.backend.exception.RateLimitException;
import com.deepsky.backend.model.ComentarioForo;
import com.deepsky.backend.model.Foro;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.ForoService;
import com.deepsky.backend.service.ModeracionImagenService;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.UploadedFile;
import io.jsonwebtoken.Claims;

public class ForoController {
    private final ForoService foroService;
    private final JwtService jwtService;
    private final CloudinaryUploader cloudinaryUploader;
    private final ModeracionImagenService moderacionImagenService;

    public ForoController(ForoService foroService, JwtService jwtService, CloudinaryUploader cloudinaryUploader,
                           ModeracionImagenService moderacionImagenService) {
        this.foroService = foroService;
        this.jwtService = jwtService;
        this.cloudinaryUploader = cloudinaryUploader;
        this.moderacionImagenService = moderacionImagenService;
    }

    public void listarHilos(Context ctx) {
        List<Foro> hilos = foroService.obtenerTodosLosHilos();
        ctx.status(HttpStatus.OK).json(hilos);
    }

    // POST /api/foro (crear hilo)
    public void crearHilo(Context ctx) {
        try {
            Claims claims = extraerClaimsDesdeToken(ctx);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);

            // Obtener datos del form-data o multipart
            String titulo = ctx.formParam("titulo");
            String contenido = ctx.formParam("contenido");
            String categoria = ctx.formParam("categoria");

            // Subir imagen a Cloudinary si existe en el request
            String urlImagen = procesarImagenSubida(ctx);

            Foro hiloCreado = foroService.crearHilo(usuarioId, usuarioRol, titulo, contenido, categoria, urlImagen);

            ctx.status(HttpStatus.CREATED).json(Map.of(
                "message", "Hilo creado exitosamente.",
                "hilo", hiloCreado
            ));

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al crear el hilo: " + e.getMessage()));
        }
    }

    // POST /api/foro/{id}/comentarios (comentar en hilo)
    public void comentarHilo(Context ctx) {
        try {
            Claims claims = extraerClaimsDesdeToken(ctx);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);

            int foroId = Integer.parseInt(ctx.pathParam("id"));
            String contenido = ctx.formParam("contenido");

            // Subir imagen opcional a Cloudinary
            String urlImagen = procesarImagenSubida(ctx);

            ComentarioForo comentario = foroService.agregarComentario(foroId, usuarioId, usuarioRol, contenido, urlImagen);

            ctx.status(HttpStatus.CREATED).json(Map.of(
                "message", "Comentario publicado exitosamente.",
                "comentario", comentario
            ));

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al publicar comentario: " + e.getMessage()));
        }
    }

    // GET /api/foro/{id}/comentarios
    public void obtenerComentarios(Context ctx) {
        try {
            int foroId = Integer.parseInt(ctx.pathParam("id"));
            var comentarios = foroService.obtenerComentariosPorHilo(foroId);
            ctx.status(HttpStatus.OK).json(comentarios);
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del foro debe ser un entero válido."));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al obtener comentarios: " + e.getMessage()));
        }
    }

    // DELETE /api/foro/{foroId}/comentarios/{id}
    public void eliminarComentario(Context ctx) {
        try {
            Claims claims = extraerClaimsDesdeToken(ctx);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);

            int foroId = Integer.parseInt(ctx.pathParam("foroId"));
            int comentarioId = Integer.parseInt(ctx.pathParam("id"));

            boolean eliminado = foroService.eliminarComentario(foroId, comentarioId, usuarioId, usuarioRol);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Comentario eliminado."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "Comentario no encontrado."));
            }

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "IDs inválidos."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al eliminar comentario: " + e.getMessage()));
        }
    }

    private String procesarImagenSubida(Context ctx) throws Exception {
        UploadedFile archivo = ctx.uploadedFile("imagen");
        if (archivo != null && archivo.size() > 0) {
            byte[] bytes = archivo.content().readAllBytes();

            // Moderación de imagen ANTES de subirla a Cloudinary y de guardar su URL en la BD
            moderacionImagenService.validar(bytes, archivo.filename());

            CloudinaryUploadResult result = cloudinaryUploader.subirImagenForo(bytes, archivo.filename());
            return result.getUrl();
        }
        return null;
    }

    private Claims extraerClaimsDesdeToken(Context ctx) throws UnauthorizedAccessException {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedAccessException("Se requiere un token JWT válido en 'Authorization: Bearer <token>'.");
        }

        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            throw new UnauthorizedAccessException("Token inválido o expirado.");
        }

        return jwtService.obtenerClaims(token);
    }

    private static class UnauthorizedAccessException extends Exception {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
    }

    // DELETE /api/foro/{id}
public void eliminarHilo(Context ctx) {
    try {
        Claims claims = extraerClaimsDesdeToken(ctx);
        int usuarioId = Integer.parseInt(claims.getSubject());
        String usuarioRol = claims.get("rol", String.class);
        int foroId = Integer.parseInt(ctx.pathParam("id"));

        boolean eliminado = foroService.eliminarHilo(foroId, usuarioId, usuarioRol);
        if (eliminado) {
            ctx.status(HttpStatus.OK).json(Map.of("message", "Hilo eliminado."));
        } else {
            ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "Hilo no encontrado."));
        }
    } catch (UnauthorizedAccessException e) {
        ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
    } catch (RateLimitException e) {
        ctx.status(HttpStatus.TOO_MANY_REQUESTS).json(Map.of("error", e.getMessage()));
    } catch (IllegalArgumentException e) {
        ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al eliminar hilo: " + e.getMessage()));
    }
}
}