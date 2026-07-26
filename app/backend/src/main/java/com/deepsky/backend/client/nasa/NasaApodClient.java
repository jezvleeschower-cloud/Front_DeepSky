package com.deepsky.backend.client.nasa;

import com.deepsky.backend.config.AppConfig;
import com.deepsky.backend.model.FotoDelDia;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;

public class NasaApodClient {
    private final HttpClient httpClient;
    private final String apiKey;

    public NasaApodClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = AppConfig.get("nasa.api.key");
    }

    public FotoDelDia fetchLatest() {
        return fetchByDate(null);
    }

    public FotoDelDia fetchByDate(LocalDate date) {
        StringBuilder urlBuilder = new StringBuilder("https://api.nasa.gov/planetary/apod?api_key=")
                .append(apiKey);

        if (date != null) {
            urlBuilder.append("&date=").append(date);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlBuilder.toString()))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalStateException("La API APOD devolvió el estado " + response.statusCode());
            }

            return parseResponse(response.body());
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("No fue posible consumir la API APOD", exception);
        }
    }

    private FotoDelDia parseResponse(String body) {
        JsonObject jsonObject = JsonParser.parseString(body).getAsJsonObject();

        FotoDelDia fotoDelDia = new FotoDelDia();
        fotoDelDia.setTitulo(getStringValue(jsonObject, "title"));
        fotoDelDia.setDescripcion(getStringValue(jsonObject, "explanation"));
        fotoDelDia.setUrlImagen(getStringValue(jsonObject, "hdurl"));
        fotoDelDia.setFecha(getStringValue(jsonObject, "date"));
        fotoDelDia.setCopyright(getStringValue(jsonObject, "copyright"));
        fotoDelDia.setMediaType(getStringValue(jsonObject, "media_type"));

        if (fotoDelDia.getUrlImagen() == null || fotoDelDia.getUrlImagen().isBlank()) {
            fotoDelDia.setUrlImagen(getStringValue(jsonObject, "url"));
        }

        return fotoDelDia;
    }

    private String getStringValue(JsonObject jsonObject, String fieldName) {
        if (jsonObject.has(fieldName) && !jsonObject.get(fieldName).isJsonNull()) {
            return jsonObject.get(fieldName).getAsString();
        }
        return null;
    }
}
