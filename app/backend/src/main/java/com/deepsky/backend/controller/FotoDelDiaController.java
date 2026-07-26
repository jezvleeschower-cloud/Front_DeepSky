package com.deepsky.backend.controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;

import com.deepsky.backend.dto.response.FotoDelDiaResponse;
import com.deepsky.backend.service.FotoDelDiaService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class FotoDelDiaController {
    private final FotoDelDiaService fotoDelDiaService;
    private final ObjectMapper objectMapper;

    public FotoDelDiaController(FotoDelDiaService fotoDelDiaService) {
        this.fotoDelDiaService = fotoDelDiaService;
        this.objectMapper = new ObjectMapper();
    }

    public void obtenerActual(Context context) {
        try {
            FotoDelDiaResponse response = fotoDelDiaService.obtenerFotoDelDiaActual();
            escribirJson(context, HttpStatus.OK, response);
        } catch (Exception exception) {
            escribirJson(context, HttpStatus.INTERNAL_SERVER_ERROR, Map.of("message", exception.getMessage()));
        }
    }

    public void obtenerPorFecha(Context context) {
        String fecha = context.queryParam("fecha");

        if (fecha == null || fecha.isBlank()) {
            escribirJson(context, HttpStatus.BAD_REQUEST, Map.of("message", "Falta el parámetro 'fecha'"));
            return;
        }

        try {
            LocalDate fechaLocal = LocalDate.parse(fecha);
            FotoDelDiaResponse response = fotoDelDiaService.obtenerFotoDelDiaPorFecha(fechaLocal);
            escribirJson(context, HttpStatus.OK, response);
        } catch (DateTimeParseException exception) {
            escribirJson(context, HttpStatus.BAD_REQUEST, Map.of("message", "Formato de fecha inválido. Usa yyyy-MM-dd"));
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