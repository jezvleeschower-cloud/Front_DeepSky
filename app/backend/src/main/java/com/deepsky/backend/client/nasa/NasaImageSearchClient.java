package com.deepsky.backend.client.nasa;

import com.deepsky.backend.dto.response.ImagenResponse;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Cliente para la NASA Image and Video Library (https://images-api.nasa.gov).
 * No requiere API key.
 */
public class NasaImageSearchClient {
    private static final String BASE_URL = "https://images-api.nasa.gov/search";

    private final HttpClient httpClient;

    public NasaImageSearchClient() {
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Busca imágenes por palabra clave. Solo devuelve resultados cuyo media_type sea "image".
     */
    public List<ImagenResponse> search(String query) {
        String url = BASE_URL + "?q=" + encode(query) + "&media_type=image";
        return parseResponse(fetch(url));
    }

    /**
     * Busca el detalle de una imagen específica por su nasa_id.
     */
    public Optional<ImagenResponse> buscarPorId(String nasaId) {
        String url = BASE_URL + "?nasa_id=" + encode(nasaId) + "&media_type=image";
        List<ImagenResponse> resultados = parseResponse(fetch(url));

        return resultados.stream()
                .filter(imagen -> nasaId.equals(imagen.getNasaId()))
                .findFirst()
                .or(() -> resultados.stream().findFirst());
    }

    private String fetch(String url) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalStateException("La API de imágenes de la NASA devolvió el estado " + response.statusCode());
            }

            return response.body();
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("No fue posible consumir la API de imágenes de la NASA", exception);
        }
    }

    /**
     * Convierte el payload crudo de la NASA Image API en una lista de ImagenResponse.
     * Paquete-visible/pública a propósito: la usa NasaImageSearchClientTest directamente.
     */
    public List<ImagenResponse> parseResponse(String body) {
        List<ImagenResponse> resultados = new ArrayList<>();

        JsonObject root = JsonParser.parseString(body).getAsJsonObject();
        if (!root.has("collection")) {
            return resultados;
        }

        JsonObject collection = root.getAsJsonObject("collection");
        JsonArray items = collection.getAsJsonArray("items");
        if (items == null) {
            return resultados;
        }

        for (JsonElement itemElement : items) {
            JsonObject item = itemElement.getAsJsonObject();
            JsonArray dataArray = item.getAsJsonArray("data");
            if (dataArray == null || dataArray.isEmpty()) {
                continue;
            }

            JsonObject data = dataArray.get(0).getAsJsonObject();

            ImagenResponse imagen = new ImagenResponse();
            imagen.setNasaId(getStringValue(data, "nasa_id"));
            imagen.setTitle(getStringValue(data, "title"));
            imagen.setDescription(getStringValue(data, "description"));
            imagen.setDateCreated(getStringValue(data, "date_created"));
            imagen.setCenter(getStringValue(data, "center"));
            imagen.setMediaType(getStringValue(data, "media_type"));
            imagen.setKeywords(getStringList(data, "keywords"));
            imagen.setUrl(extraerPrimerEnlace(item));

            resultados.add(imagen);
        }

        return resultados;
    }

    private String extraerPrimerEnlace(JsonObject item) {
        JsonArray links = item.getAsJsonArray("links");
        if (links == null || links.isEmpty()) {
            return null;
        }
        JsonObject primerLink = links.get(0).getAsJsonObject();
        return getStringValue(primerLink, "href");
    }

    private List<String> getStringList(JsonObject jsonObject, String fieldName) {
        if (!jsonObject.has(fieldName) || jsonObject.get(fieldName).isJsonNull()) {
            return List.of();
        }
        List<String> valores = new ArrayList<>();
        for (JsonElement element : jsonObject.getAsJsonArray(fieldName)) {
            valores.add(element.getAsString());
        }
        return valores;
    }

    private String getStringValue(JsonObject jsonObject, String fieldName) {
        if (jsonObject.has(fieldName) && !jsonObject.get(fieldName).isJsonNull()) {
            return jsonObject.get(fieldName).getAsString();
        }
        return null;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}