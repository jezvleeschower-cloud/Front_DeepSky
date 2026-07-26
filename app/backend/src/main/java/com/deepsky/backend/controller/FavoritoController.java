package com.deepsky.backend.controller;

import com.deepsky.backend.dto.request.FavoritoRequest;
import com.deepsky.backend.dto.response.ImagenResponse;
import com.deepsky.backend.service.FavoritoService;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class FavoritoController {
    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    public void agregar(Context ctx) {
        try {
            FavoritoRequest request = ctx.bodyAsClass(FavoritoRequest.class);
            favoritoService.agregarFavorito(request.getUsuarioId(), request.getImagen());
            ctx.status(HttpStatus.CREATED).json(Map.of("message", "Favorito guardado"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "Error al guardar el favorito"));
        }
    }

    public void eliminar(Context ctx) {
        try {
            String nasaId = ctx.pathParam("nasaId");
            int usuarioId = Integer.parseInt(ctx.queryParam("usuarioId"));
            favoritoService.eliminarFavorito(usuarioId, nasaId);
            ctx.status(HttpStatus.OK).json(Map.of("message", "Favorito eliminado"));
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "El parámetro 'usuarioId' es obligatorio"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "Error al eliminar el favorito"));
        }
    }

    public void listar(Context ctx) {
        try {
            int usuarioId = Integer.parseInt(ctx.queryParam("usuarioId"));
            List<ImagenResponse> favoritos = favoritoService.listarFavoritos(usuarioId);
            ctx.status(HttpStatus.OK).json(favoritos);
        } catch (NumberFormatException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", "El parámetro 'usuarioId' es obligatorio"));
        } catch (IllegalArgumentException exception) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", exception.getMessage()));
        } catch (SQLException exception) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "Error al listar los favoritos"));
        }
    }
}