package com.deepsky.backend.client.nasa;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.deepsky.backend.config.AppConfig;

public class NasaNeoWsClient {
    private final HttpClient httpClient;

    public NasaNeoWsClient() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public String obtenerAsteroidesDelDia() {
        String apiKey = AppConfig.get("nasa.api.key", "DEMO_KEY");
        String url = "https://api.nasa.gov/neo/rest/v1/feed?api_key=" + apiKey;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Error al llamar a NeoWs API de la NASA. Status code: " + response.statusCode());
            }

            return response.body();
        } catch (IOException | InterruptedException e) {
            // Aplicamos Multi-Catch específico eliminando la advertencia de VSCode
            Thread.currentThread().interrupt(); // Buena práctica al atrapar InterruptedException
            throw new RuntimeException("Fallo en la comunicación u operación I/O con la API NeoWs", e);
        }
    }
}