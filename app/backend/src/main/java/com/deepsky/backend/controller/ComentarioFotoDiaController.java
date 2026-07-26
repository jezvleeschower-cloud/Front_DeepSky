package com.deepsky.backend.controller;

import java.sql.SQLException;
import java.util.Map;

import com.deepsky.backend.model.ComentarioFotoDelDia;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.ComentarioFotoDelDiaService;

import io.javalin.http.Context;
import io.jsonwebtoken.Claims;

public class ComentarioFotoDiaController {
    private final ComentarioFotoDelDiaService service;
    private final JwtService jwtService;

    public ComentarioFotoDiaController(ComentarioFotoDelDiaService service, JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    public void publicar(Context ctx) {
        // 1. Convertimos el JSON que llega del Frontend a un objeto temporal
        ComentarioFotoDelDia datos = ctx.bodyAsClass(ComentarioFotoDelDia.class);

        // 2. Determinamos la fecha objetivo: preferimos la fecha enviada en el body,
        //    si no existe, comprobamos el query param `fecha` (formato yyyy-MM-dd).
        String fechaStr = null;
        try {
            if (datos.getFecha() != null) {
                fechaStr = datos.getFecha().toString();
            } else {
                String qp = ctx.queryParam("fecha");
                if (qp != null && !qp.isBlank()) fechaStr = qp;
            }
        } catch (Exception ignore) { /* fallback a null */ }

        // 3. Determinamos usuarioId: si no llega, usamos 0 (anónimo)
        Integer usuarioIdObj = datos.getUsuarioId();
        int usuarioId = usuarioIdObj != null ? usuarioIdObj : 0;

        // 4. Llamamos al servicio con los tipos correctos (String, int, String)
        try {
            boolean guardado = service.publicarComentarioConFecha(
                fechaStr,
                usuarioId,
                datos.getContenido()
            );

            // 3. Respondemos al cliente según el resultado
            if (guardado) {
                ctx.status(201).json(Map.of("message", "Comentario publicado"));
            } else {
                ctx.status(400).json(Map.of("error", "No se pudo publicar. Verifica los datos."));
            }
        } catch (IllegalArgumentException e) {
            // Incluye ContenidoInapropiadoException (lenguaje altisonante detectado)
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    public void obtenerPorFecha(Context ctx) {
        String fecha = ctx.queryParam("fecha");
        try {
            ctx.json(service.obtenerComentariosPorFecha(fecha));
        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", "Error al consultar la base de datos"));
        }
    }

    // DELETE /api/comentarios/foto-del-dia/{id} (requiere sesión iniciada con rol DIVULGADOR)
    public void eliminar(Context ctx) {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(401).json(Map.of("error", "Se requiere un token JWT válido en el encabezado 'Authorization: Bearer <token>'."));
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            ctx.status(401).json(Map.of("error", "Token inválido o expirado. Inicia sesión nuevamente."));
            return;
        }

        try {
            Claims claims = jwtService.obtenerClaims(token);
            String usuarioRol = claims.get("rol", String.class);
            int idComentario = Integer.parseInt(ctx.pathParam("id"));

            boolean eliminado = service.eliminarComentario(idComentario, usuarioRol);
            if (eliminado) {
                ctx.status(200).json(Map.of("message", "Comentario eliminado."));
            } else {
                ctx.status(404).json(Map.of("error", "Comentario no encontrado."));
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json(Map.of("error", "El ID del comentario debe ser un número entero."));
        } catch (IllegalArgumentException e) {
            ctx.status(403).json(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            ctx.status(500).json(Map.of("error", "Error interno al eliminar el comentario: " + e.getMessage()));
        }
    }
}