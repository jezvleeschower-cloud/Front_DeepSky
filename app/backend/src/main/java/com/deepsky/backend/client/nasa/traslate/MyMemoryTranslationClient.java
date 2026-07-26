package com.deepsky.backend.client.nasa.traslate;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Cliente para traducir texto usando la API gratuita MyMemory.
 * Textos largos se dividen en fragmentos de oraciones para respetar
 * el límite de ~500 caracteres por petición de la API gratuita.
 */
public class MyMemoryTranslationClient {
    private static final Logger LOGGER = Logger.getLogger(MyMemoryTranslationClient.class.getName());
    private static final String BASE_URL = "https://api.mymemory.translated.net/get";
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 500L;
    // MyMemory free tier: ~500 chars por petición de forma fiable
    private static final int CHUNK_SIZE = 480;

    private final Map<String, String> cache = new ConcurrentHashMap<>();
    private final HttpClient httpClient;

    public MyMemoryTranslationClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public String translateToEnglish(String text) {
        if (text == null || text.isBlank()) return text;
        return cachedOrTranslate(text, "es|en");
    }

    public String translateToSpanish(String text) {
        if (text == null || text.isBlank()) return text;
        return cachedOrTranslate(text, "en|es");
    }

    private String cachedOrTranslate(String text, String langpair) {
        String cacheKey = langpair + "::" + text;
        String cached = cache.get(cacheKey);
        if (cached != null) return cached;

        // Quitar URLs sueltas que confunden al traductor
        String cleaned = text.replaceAll("https?://\\S+", "").trim();

        String result;
        if (cleaned.length() <= CHUNK_SIZE) {
            // Texto corto: una sola petición
            result = translateWithRetries(cleaned, langpair);
        } else {
            // Texto largo: dividir por oraciones y traducir por fragmentos
            result = translateInChunks(cleaned, langpair);
        }

        if (result == null || result.isBlank()) {
            cache.put(cacheKey, text);
            return text;
        }
        cache.put(cacheKey, result);
        return result;
    }

    /**
     * Divide el texto en fragmentos respetando los límites de oración
     * (punto, signo de exclamación, interrogación) y traduce cada uno.
     */
    private String translateInChunks(String text, String langpair) {
        List<String> chunks = splitIntoChunks(text);
        StringBuilder translated = new StringBuilder();

        for (String chunk : chunks) {
            if (chunk.isBlank()) continue;
            String chunkResult = translateWithRetries(chunk.trim(), langpair);
            if (chunkResult == null || chunkResult.isBlank()) {
                // Si falla un fragmento, usar el original para no perder contenido
                translated.append(chunk.trim());
            } else {
                translated.append(chunkResult);
            }
            translated.append(" ");
        }

        return translated.toString().trim();
    }

    /**
     * Divide el texto en fragmentos de hasta CHUNK_SIZE caracteres,
     * cortando siempre en el final de una oración para no partir palabras.
     */
    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        // Separar por oraciones: ". ", "! ", "? "
        String[] sentences = text.split("(?<=[.!?])\\s+");

        StringBuilder current = new StringBuilder();
        for (String sentence : sentences) {
            if (current.length() + sentence.length() + 1 > CHUNK_SIZE) {
                if (current.length() > 0) {
                    chunks.add(current.toString().trim());
                    current = new StringBuilder();
                }
                // Si la oración sola supera el límite, cortarla por palabras
                if (sentence.length() > CHUNK_SIZE) {
                    String[] words = sentence.split("\\s+");
                    for (String word : words) {
                        if (current.length() + word.length() + 1 > CHUNK_SIZE) {
                            if (current.length() > 0) {
                                chunks.add(current.toString().trim());
                                current = new StringBuilder();
                            }
                        }
                        current.append(word).append(" ");
                    }
                } else {
                    current.append(sentence).append(" ");
                }
            } else {
                current.append(sentence).append(" ");
            }
        }
        if (current.length() > 0) {
            chunks.add(current.toString().trim());
        }
        return chunks;
    }

    private String translateWithRetries(String text, String langpair) {
        long backoff = INITIAL_BACKOFF_MS;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                String url = BASE_URL + "?q=" + encode(text) + "&langpair=" + encode(langpair);
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(8))
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    String traducido = extraerTraduccion(response.body());
                    return (traducido == null || traducido.isBlank()) ? null : traducido;
                } else {
                    LOGGER.log(Level.WARNING, "Traducción devolvió estado {0} (intento {1})",
                            new Object[]{response.statusCode(), attempt});
                    if (response.statusCode() == 429) {
                        sleepQuietly(backoff);
                        backoff *= 2;
                        continue;
                    }
                    return null;
                }
            } catch (IOException | InterruptedException | RuntimeException e) {
                if (e instanceof InterruptedException) Thread.currentThread().interrupt();
                LOGGER.log(Level.WARNING, "Error en traducción (intento " + attempt + ")", e);
                sleepQuietly(backoff);
                backoff *= 2;
            }
        }
        LOGGER.log(Level.WARNING, "Traducción agotó reintentos, se usará texto original");
        return null;
    }

    private void sleepQuietly(long ms) {
        try { Thread.sleep(ms); }
        catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
    }

    private String extraerTraduccion(String body) {
        JsonObject root = JsonParser.parseString(body).getAsJsonObject();
        if (!root.has("responseData")) return null;
        JsonObject responseData = root.getAsJsonObject("responseData");
        if (!responseData.has("translatedText") || responseData.get("translatedText").isJsonNull()) return null;
        return responseData.get("translatedText").getAsString();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}