package com.deepsky.backend.controller;

import com.deepsky.backend.dto.response.ParticipacionRetoResponse;
import com.deepsky.backend.dto.response.RetoAstrofotografiaResponse;
import com.deepsky.backend.exception.RateLimitException;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.RetoAstrofotografiaService;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.UploadedFile;
import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class RetoAstrofotografiaController {
    private final RetoAstrofotografiaService retoService;
    private final JwtService jwtService;

    public RetoAstrofotografiaController(RetoAstrofotografiaService retoService, JwtService jwtService) {
        this.retoService = retoService;
        this.jwtService = jwtService;
    }

    /** POST /api/retos (multipart: titulo, descripcion, fechaLimite, usuarioId, imagen) */
    public void crear(Context ctx) {
        try {
            int usuarioId = Integer.parseInt(ctx.formParam("usuarioId"));
            String titulo = ctx.formParam("titulo");
            String descripcion = ctx.formParam("descripcion");
            String fechaLimite = ctx.formParam("fechaLimite");

            UploadedFile archivo = ctx.uploadedFile("imagen");
            if (archivo == null) {
                ctx.status(HttpStatus.BAD_REQUEST)
                   .json(Map.of("message", "Debes adjuntar una imagen de referencia/portada (campo 'imagen')"));
                return;
            }
            byte[] bytes = archivo.content().readAllBytes();

            RetoAstrofotografiaResponse reto = retoService.crearReto(
                    usuarioId, titulo, descripcion, fechaLimite, bytes, archivo.filename());
            ctx.status(HttpStatus.CREATED).json(reto);
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "El usuarioId es obligatorio y debe ser numérico"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", exception.getMessage()));
        } catch (IOException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No fue posible leer la imagen enviada"));
        } catch (IllegalStateException exception) {
            ctx.status(HttpStatus.BAD_GATEWAY).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al crear el reto"));
        }
    }

    /** GET /api/retos */
    public void listar(Context ctx) {
        try {
            List<RetoAstrofotografiaResponse> retos = retoService.listarRetos();
            ctx.status(HttpStatus.OK).json(retos);
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al listar los retos"));
        }
    }

    /** GET /api/retos/{id} */
    public void obtener(Context ctx) {
        try {
            int idReto = Integer.parseInt(ctx.pathParam("id"));
            ctx.status(HttpStatus.OK).json(retoService.obtenerReto(idReto));
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("message", "El id del reto no es válido"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.NOT_FOUND).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al obtener el reto"));
        }
    }

    /** PUT /api/retos/{id}/finalizar */
    public void finalizar(Context ctx) {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token requerido."));
            return;
        }
        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token inválido o expirado."));
            return;
        }
        try {
            Claims claims = jwtService.obtenerClaims(token);
            int usuarioId = Integer.parseInt(claims.getSubject());
            int retoId = Integer.parseInt(ctx.pathParam("id"));

            boolean ok = retoService.finalizar(retoId, usuarioId);
            if (ok) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Reto finalizado correctamente."));
            } else {
                ctx.status(HttpStatus.FORBIDDEN).json(Map.of("message", "No tienes permiso o el reto no existe."));
            }
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "ID inválido."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("message", e.getMessage()));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "Error al finalizar el reto."));
        }
    }

    /** DELETE /api/retos/{id} */
    public void eliminarReto(Context ctx) {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token requerido."));
            return;
        }
        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token inválido o expirado."));
            return;
        }
        try {
            Claims claims = jwtService.obtenerClaims(token);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);
            int retoId = Integer.parseInt(ctx.pathParam("id"));

            boolean eliminado = retoService.eliminarReto(retoId, usuarioId, usuarioRol);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Reto eliminado correctamente."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("message", "El reto indicado no existe."));
            }
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "ID inválido."));
        } catch (RateLimitException e) {
            ctx.status(HttpStatus.TOO_MANY_REQUESTS).json(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("message", e.getMessage()));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "Error al eliminar el reto."));
        }
    }

    /** POST /api/retos/{id}/participaciones */
    public void participar(Context ctx) {
        try {
            int retoId    = Integer.parseInt(ctx.pathParam("id"));
            int usuarioId = Integer.parseInt(ctx.formParam("usuarioId"));
            String titulo = ctx.formParam("titulo");

            UploadedFile archivo = ctx.uploadedFile("imagen");
            if (archivo == null) {
                ctx.status(HttpStatus.BAD_REQUEST)
                   .json(Map.of("message", "Debes adjuntar una imagen (campo 'imagen')"));
                return;
            }

            byte[] bytes = archivo.content().readAllBytes();
            ParticipacionRetoResponse participacion =
                    retoService.participar(retoId, usuarioId, titulo, bytes, archivo.filename());
            ctx.status(HttpStatus.CREATED).json(participacion);

        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("message", "El id del reto y el usuarioId son obligatorios y deben ser numéricos"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", exception.getMessage()));
        } catch (IOException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "No fue posible leer la imagen enviada"));
        } catch (IllegalStateException exception) {
            ctx.status(HttpStatus.BAD_GATEWAY).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al guardar la participación"));
        }
    }

    /** GET /api/retos/{id}/participaciones */
    public void listarParticipaciones(Context ctx) {
        try {
            int retoId = Integer.parseInt(ctx.pathParam("id"));
            ctx.status(HttpStatus.OK).json(retoService.listarParticipaciones(retoId));
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("message", "El id del reto no es válido"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.NOT_FOUND).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al listar las participaciones"));
        }
    }

    /** POST /api/participaciones/{participacionId}/like?usuarioId={id} */
    public void darLike(Context ctx) {
        try {
            int idParticipacion = Integer.parseInt(ctx.pathParam("participacionId"));

            String usuarioIdParam = ctx.queryParam("usuarioId");
            if (usuarioIdParam == null || usuarioIdParam.isBlank()) {
                ctx.status(HttpStatus.BAD_REQUEST)
                   .json(Map.of("message", "El parámetro 'usuarioId' es obligatorio"));
                return;
            }
            int usuarioId = Integer.parseInt(usuarioIdParam);

            boolean liked = retoService.darLike(idParticipacion, usuarioId);
            ctx.status(HttpStatus.OK)
               .json(Map.of("message", liked ? "Voto registrado" : "Voto eliminado", "liked", liked));

        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("message", "Los ids deben ser numéricos"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.CONFLICT).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al registrar el voto"));
        }
    }

    /** DELETE /api/retos/{id}/participaciones/{participacionId} */
    public void eliminarParticipacion(Context ctx) {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(HttpStatus.UNAUTHORIZED)
               .json(Map.of("message", "Se requiere un token JWT válido en 'Authorization: Bearer <token>'."));
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token inválido o expirado."));
            return;
        }

        try {
            Claims claims = jwtService.obtenerClaims(token);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);

            int retoId = Integer.parseInt(ctx.pathParam("id"));
            int participacionId = Integer.parseInt(ctx.pathParam("participacionId"));

            boolean eliminado = retoService.eliminarParticipacion(retoId, participacionId, usuarioId, usuarioRol);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Participación eliminada correctamente."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("message", "La participación indicada no existe."));
            }
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "Los ids deben ser numéricos."));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error al eliminar la participación."));
        }
    }
}