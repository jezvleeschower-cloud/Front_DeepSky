package com.deepsky.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.deepsky.backend.dto.response.ImagenResponse;
import com.deepsky.backend.service.ImagenService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ImagenController {
    private final ImagenService imagenService;
    private final ObjectMapper objectMapper;

    public ImagenController(ImagenService imagenService) {
        this.imagenService = imagenService;
        this.objectMapper = new ObjectMapper();
    }

    public void buscar(Context context) {
        String query = context.queryParam("q");
        String category = context.queryParam("category");

        try {
            List<ImagenResponse> resultados = imagenService.buscarImagenes(query, category);
            // Incluir información sobre la API utilizada
            var apiInfo = Map.of(
                "name", "NASA Image and Video Library API",
                "description", "API pública de la NASA para buscar y recuperar imágenes, videos y metadatos relacionados con misiones y observaciones. Permite búsquedas por término, filtrado por año, centro y otros metadatos, y ofrece endpoints como /search, /asset y /metadata.",
                "url", "https://images-api.nasa.gov"
            );
            escribirJson(context, HttpStatus.OK, Map.of("api", apiInfo, "results", resultados));
        } catch (IllegalArgumentException exception) {
            escribirJson(context, HttpStatus.BAD_REQUEST, Map.of("message", exception.getMessage()));
        } catch (Exception exception) {
            escribirJson(context, HttpStatus.INTERNAL_SERVER_ERROR, Map.of("message", exception.getMessage()));
        }
    }

    public void obtenerPorId(Context context) {
        String nasaId = context.pathParam("id");

        try {
            ImagenResponse imagen = imagenService.obtenerPorId(nasaId);
            escribirJson(context, HttpStatus.OK, imagen);
        } catch (NoSuchElementException exception) {
            escribirJson(context, HttpStatus.NOT_FOUND, Map.of("message", exception.getMessage()));
        } catch (IllegalArgumentException exception) {
            escribirJson(context, HttpStatus.BAD_REQUEST, Map.of("message", exception.getMessage()));
        } catch (Exception exception) {
            escribirJson(context, HttpStatus.INTERNAL_SERVER_ERROR, Map.of("message", exception.getMessage()));
        }
    }

    private void escribirJson(Context context, HttpStatus status, Object payload) {
        try {
            context.status(status);
            context.contentType("application/json");
            context.result(objectMapper.writeValueAsString(payload));
        } catch (JsonProcessingException exception) {
            context.status(HttpStatus.INTERNAL_SERVER_ERROR);
            context.result("{\"message\":\"No fue posible serializar la respuesta\"}");
        }
    }
}