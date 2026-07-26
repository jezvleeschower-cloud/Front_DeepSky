package com.deepsky.backend.controller;

import java.util.List;
import java.util.Map;

import com.deepsky.backend.model.DatoCuriosoPlaneta;
import com.deepsky.backend.model.Planeta;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.SistemaSolarService;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.jsonwebtoken.Claims;

public class SistemaSolarController {
    private final SistemaSolarService sistemaSolarService;
    private final JwtService jwtService;

    public SistemaSolarController(SistemaSolarService sistemaSolarService, JwtService jwtService) {
        this.sistemaSolarService = sistemaSolarService;
        this.jwtService = jwtService;
    }

    public void listarPlanetas(Context ctx) {
        List<Planeta> planetas = sistemaSolarService.obtenerTodosLosPlanetas();
        ctx.status(HttpStatus.OK).json(planetas);
    }

    public void obtenerPlaneta(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Planeta planeta = sistemaSolarService.obtenerPlanetaPorId(id);
        ctx.status(HttpStatus.OK).json(planeta);
    }

    /**
     * Obtener curiosidades de un planeta (Lectura pública / todos los usuarios)
     */
    public void obtenerCuriosidades(Context ctx) {
        try {
            int planetaId = Integer.parseInt(ctx.pathParam("id"));
            List<DatoCuriosoPlaneta> curiosidades = sistemaSolarService.obtenerCuriosidadesPorPlaneta(planetaId);
            ctx.status(HttpStatus.OK).json(curiosidades);
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID del planeta debe ser un número entero."));
        } catch (RuntimeException e) {
            ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Agregar una nueva curiosidad (requiere sesión iniciada; cualquier usuario registrado)
     */
    public void agregarCuriosidad(Context ctx) {
        try {
            // Extracción y validación del token JWT
            Claims claims = extraerClaimsDesdeToken(ctx);
            int usuarioId = Integer.parseInt(claims.getSubject());
            String usuarioRol = claims.get("rol", String.class);

            int planetaId = Integer.parseInt(ctx.pathParam("id"));
            
            Map<?, ?> body = ctx.bodyAsClass(Map.class);
            String textoDato = (String) body.get("dato");

            DatoCuriosoPlaneta nuevoDato = sistemaSolarService.agregarCuriosidad(planetaId, usuarioId, usuarioRol, textoDato);

            ctx.status(HttpStatus.CREATED).json(Map.of(
                "message", "Curiosidad registrada exitosamente.",
                "curiosidad", nuevoDato
            ));

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error interno al registrar la curiosidad: " + e.getMessage()));
        }
    }

    /**
     * Eliminar una curiosidad (requiere sesión iniciada con rol DIVULGADOR)
     */
    public void eliminarCuriosidad(Context ctx) {
        try {
            Claims claims = extraerClaimsDesdeToken(ctx);
            String usuarioRol = claims.get("rol", String.class);

            int idDato = Integer.parseInt(ctx.pathParam("idDato"));

            boolean eliminado = sistemaSolarService.eliminarCuriosidad(idDato, usuarioRol);
            if (eliminado) {
                ctx.status(HttpStatus.OK).json(Map.of("message", "Curiosidad eliminada correctamente."));
            } else {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "La curiosidad indicada no existe."));
            }

        } catch (UnauthorizedAccessException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
        } catch (NumberFormatException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "El ID de la curiosidad debe ser un número entero."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.FORBIDDEN).json(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Error interno al eliminar la curiosidad: " + e.getMessage()));
        }
    }

    private Claims extraerClaimsDesdeToken(Context ctx) throws UnauthorizedAccessException {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedAccessException("Se requiere un token JWT válido en el encabezado 'Authorization: Bearer <token>'.");
        }

        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            throw new UnauthorizedAccessException("Token inválido o expirado. Inicia sesión nuevamente.");
        }

        return jwtService.obtenerClaims(token);
    }

    private static class UnauthorizedAccessException extends Exception {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
    }
}