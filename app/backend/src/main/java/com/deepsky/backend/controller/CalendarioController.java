package com.deepsky.backend.controller;

import java.sql.SQLException;
import java.util.Map;

import com.deepsky.backend.model.EventoAstronomico;
import com.deepsky.backend.model.FavoritoEvento;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.CalendarioService;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class CalendarioController {

    private final CalendarioService calendarioService;
    private final JwtService jwtService;

    public CalendarioController(JwtService jwtService) {
        this.calendarioService = new CalendarioService();
        this.jwtService = jwtService;
    }

    /**
     * Endpoint de prueba de conectividad y salud
     */
    public void test(Context ctx) {
        ctx.status(HttpStatus.OK).json(Map.of(
            "status", "UP",
            "modulo", "Calendario",
            "message", "Conexión exitosa entre las rutas, el controlador y la base de datos."
        ));
    }

    /**
     * Obtener eventos astronómicos filtrados por año y mes (Público)
     */
    public void getEventosPorMes(Context ctx) {
        try {
            String yearParam = ctx.queryParam("year");
            String monthParam = ctx.queryParam("month");

            if (yearParam == null || monthParam == null) {
                ctx.status(HttpStatus.BAD_REQUEST).json(Map.of(
                    "error", "Los parámetros de consulta 'year' y 'month' son obligatorios."
                ));
                return;
            }

            int year = Integer.parseInt(yearParam);
            int month = Integer.parseInt(monthParam);

            var eventos = calendarioService.obtenerEventosPorMes(year, month);
            ctx.status(HttpStatus.OK).json(eventos);

        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of(
                "error", "Los parámetros 'year' y 'month' deben ser números enteros válidos."
            ));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of(
                "error", "Error en la base de datos al recuperar los eventos: " + e.getMessage()
            ));
        }
    }

    /**
     * Crear un nuevo evento astronómico (Solo DIVULGADOR)
     */
    public void crearEvento(Context ctx) {
    try {
        // Tomar usuarioId del JWT en lugar del body
        int usuarioId = obtenerUsuarioIdDesdeToken(ctx);
        String usuarioRol = ctx.header("X-User-Rol");
        
        if (usuarioRol == null || usuarioRol.trim().isEmpty()) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of(
                "error", "Falta el encabezado obligatorio 'X-User-Rol' para validar los permisos."
            ));
            return;
        }

        EventoAstronomico nuevoEvento = ctx.bodyAsClass(EventoAstronomico.class);
        nuevoEvento.setUsuarioId(usuarioId); // sobreescribir con el del token
        EventoAstronomico eventoCreado = calendarioService.crearEventoAstronomico(nuevoEvento, usuarioRol);
        ctx.status(HttpStatus.CREATED).json(eventoCreado);

    } catch (UnauthorizedAccessException e) {
        ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
    } catch (IllegalArgumentException e) {
        ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
    } catch (SQLException e) {
        ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of(
            "error", "Error en la base de datos al registrar el evento: " + e.getMessage()
        ));
    }
}

    /**
     * Modificar un evento astronómico existente (Solo el DIVULGADOR que lo creó)
     */
    public void actualizarEvento(Context ctx) {
        try {
            int usuarioId = obtenerUsuarioIdDesdeToken(ctx);
            String usuarioRol = ctx.header("X-User-Rol");

            if (usuarioRol == null || usuarioRol.trim().isEmpty()) {
                ctx.status(HttpStatus.BAD_REQUEST).json(Map.of(
                    "error", "Falta el encabezado obligatorio 'X-User-Rol' para validar los permisos."
                ));
                return;
            }

            int eventoId = Integer.parseInt(ctx.pathParam("id"));
            EventoAstronomico datosActualizados = ctx.bodyAsClass(EventoAstronomico.class);

            EventoAstronomico eventoActualizado = calendarioService.actualizarEventoAstronomico(eventoId, datosActualizados, usuarioId, usuarioRol);
            if (eventoActualizado == null) {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "El evento no existe."));
                return;
            }
            ctx.status(HttpStatus.OK).json(eventoActualizado);

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del evento debe ser un entero válido."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of(
                "error", "Error en la base de datos al actualizar el evento: " + e.getMessage()
            ));
        }
    }

    /**
     * Eliminar un evento astronómico (Solo el DIVULGADOR que lo creó)
     */
    public void eliminarEvento(Context ctx) {
        try {
            int usuarioId = obtenerUsuarioIdDesdeToken(ctx);
            String usuarioRol = ctx.header("X-User-Rol");

            if (usuarioRol == null || usuarioRol.trim().isEmpty()) {
                ctx.status(HttpStatus.BAD_REQUEST).json(Map.of(
                    "error", "Falta el encabezado obligatorio 'X-User-Rol' para validar los permisos."
                ));
                return;
            }

            int eventoId = Integer.parseInt(ctx.pathParam("id"));
            boolean eliminado = calendarioService.eliminarEventoAstronomico(eventoId, usuarioId, usuarioRol);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Evento eliminado correctamente."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "El evento no existe."));
            }

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del evento debe ser un entero válido."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of(
                "error", "Error al eliminar el evento: " + e.getMessage()
            ));
        }
    }

    /**
     * Guardar evento en Favoritos (REQUERIDO: Usuario autenticado vía JWT)
     */
    public void fijarFavorito(Context ctx) {
        try {
            int usuarioId = obtenerUsuarioIdDesdeToken(ctx);
            int eventoId = Integer.parseInt(ctx.pathParam("id"));

            FavoritoEvento favorito = calendarioService.fijarEventoParaUsuario(usuarioId, eventoId);
            ctx.status(HttpStatus.CREATED).json(Map.of(
                "message", "Evento guardado en favoritos correctamente.",
                "favorito", favorito
            ));

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del evento debe ser un entero válido."));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of(
                "error", "Error al guardar el favorito o ya está registrado: " + e.getMessage()
            ));
        }
    }

    /**
     * Quitar evento de Favoritos (REQUERIDO: Usuario autenticado vía JWT)
     */
    public void desfijarFavorito(Context ctx) {
        try {
            int usuarioId = obtenerUsuarioIdDesdeToken(ctx);
            int eventoId = Integer.parseInt(ctx.pathParam("id"));

            boolean eliminado = calendarioService.desfijarEventoParaUsuario(usuarioId, eventoId);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Evento eliminado de favoritos."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "El evento no estaba en tus favoritos."));
            }

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del evento debe ser un entero válido."));
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error al eliminar favorito: " + e.getMessage()));
        }
    }

    /**
     * Helper para extraer y validar el idUsuario desde el Bearer Token JWT
     */
    private int obtenerUsuarioIdDesdeToken(Context ctx) throws UnauthorizedAccessException {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedAccessException("Se requiere un token de sesión válido en el encabezado 'Authorization: Bearer <token>'.");
        }

        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            throw new UnauthorizedAccessException("Token de autenticación inválido o expirado. Inicia sesión nuevamente.");
        }

        return jwtService.obtenerUsuarioIdDesdeToken(token);
    }

    private static class UnauthorizedAccessException extends Exception {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
    }
}