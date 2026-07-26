package com.deepsky.backend.service;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.logging.Logger;

import com.deepsky.backend.config.AppConfig;
import com.deepsky.backend.exception.ContenidoInapropiadoException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Valida imágenes subidas por el usuario (foro, retos de astrofotografía)
 * ANTES de que se suban a Cloudinary y de que su URL se guarde en la base
 * de datos, usando la API de moderación de imágenes de Sightengine
 * (https://sightengine.com), que ofrece un plan gratuito.
 *
 * Configuración necesaria en application.properties (o variables de
 * entorno SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET):
 *
 *   sightengine.api.user=
 *   sightengine.api.secret=
 *   moderacion.imagenes.enabled=true
 *   moderacion.imagenes.estricta=false
 *
 * Si no hay credenciales configuradas, el servicio queda deshabilitado
 * (se registra un warning) y las imágenes NO se analizan; esto evita que
 * el entorno de desarrollo se rompa por falta de credenciales, pero debe
 * configurarse en producción para que la validación sea efectiva.
 *
 * "moderacion.imagenes.estricta=true" hace que, si la llamada a Sightengine
 * falla (red, timeout, credenciales inválidas...), la imagen se RECHACE en
 * vez de dejarse pasar. Por defecto se deja pasar (fail-open) para no tumbar
 * la funcionalidad completa por una caída del servicio externo.
 */
public class ModeracionImagenService {

    private static final Logger LOGGER = Logger.getLogger(ModeracionImagenService.class.getName());
    private static final String SIGHTENGINE_URL = "https://api.sightengine.com/1.0/check.json";
    private static final double UMBRAL_DESNUDEZ = 0.5;
    private static final double UMBRAL_OFENSIVO = 0.5;
    private static final double UMBRAL_GORE = 0.5;

    private final HttpClient httpClient;
    private final boolean habilitado;
    private final boolean estricta;
    private final String apiUser;
    private final String apiSecret;

    public ModeracionImagenService() {
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.apiUser = AppConfig.get("sightengine.api.user");
        this.apiSecret = AppConfig.get("sightengine.api.secret");
        this.estricta = "true".equalsIgnoreCase(AppConfig.get("moderacion.imagenes.estricta", "false"));
        this.habilitado = "true".equalsIgnoreCase(AppConfig.get("moderacion.imagenes.enabled", "true"))
                && apiUser != null && !apiUser.isBlank()
                && apiSecret != null && !apiSecret.isBlank();

        if (!habilitado) {
            LOGGER.warning("Moderación de imágenes deshabilitada: faltan credenciales de Sightengine "
                    + "(sightengine.api.user / sightengine.api.secret). Las imágenes NO serán analizadas.");
        }
    }

    /**
     * Analiza la imagen. Lanza ContenidoInapropiadoException si se detecta
     * desnudez/contenido sexual, gestos ofensivos o contenido violento/gore
     * por encima del umbral configurado.
     */
    public void validar(byte[] imagen, String nombreArchivo) {
        if (!habilitado || imagen == null || imagen.length == 0) {
            return;
        }

        try {
            String boundary = "----DeepSkyModeracion" + System.currentTimeMillis();
            byte[] cuerpo = construirMultipart(boundary, imagen, nombreArchivo);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(SIGHTENGINE_URL))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .timeout(Duration.ofSeconds(15))
                    .POST(BodyPublishers.ofByteArray(cuerpo))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            evaluarRespuesta(response.body());

        } catch (ContenidoInapropiadoException e) {
            throw e;
        } catch (Exception e) {
            LOGGER.warning("No fue posible validar la imagen con el servicio de moderación: " + e.getMessage());
            if (estricta) {
                throw new ContenidoInapropiadoException(
                        "No fue posible verificar la imagen en este momento. Inténtalo de nuevo más tarde.");
            }
            // fail-open: se deja pasar la imagen y se registra el incidente para revisión manual
        }
    }

    private void evaluarRespuesta(String jsonBody) {
        JsonObject json = JsonParser.parseString(jsonBody).getAsJsonObject();

        if (json.has("error")) {
            LOGGER.warning("Sightengine devolvió un error: " + json.get("error"));
            if (estricta) {
                throw new ContenidoInapropiadoException(
                        "No fue posible verificar la imagen en este momento. Inténtalo de nuevo más tarde.");
            }
            return;
        }

        if (json.has("nudity")) {
            JsonObject nudity = json.getAsJsonObject("nudity");
            double sexualActivity = obtenerDouble(nudity, "sexual_activity");
            double sexualDisplay = obtenerDouble(nudity, "sexual_display");
            double erotica = obtenerDouble(nudity, "erotica");
            if (sexualActivity >= UMBRAL_DESNUDEZ || sexualDisplay >= UMBRAL_DESNUDEZ || erotica >= UMBRAL_DESNUDEZ) {
                throw new ContenidoInapropiadoException(
                        "La imagen fue rechazada por contener contenido sexual explícito.");
            }
        }

        if (json.has("offensive") && obtenerDouble(json.getAsJsonObject("offensive"), "prob") >= UMBRAL_OFENSIVO) {
            throw new ContenidoInapropiadoException(
                    "La imagen fue rechazada por contener símbolos o gestos ofensivos.");
        }

        if (json.has("gore") && obtenerDouble(json.getAsJsonObject("gore"), "prob") >= UMBRAL_GORE) {
            throw new ContenidoInapropiadoException(
                    "La imagen fue rechazada por contener contenido violento o gráfico.");
        }
    }

    private double obtenerDouble(JsonObject obj, String campo) {
        return obj.has(campo) ? obj.get(campo).getAsDouble() : 0.0;
    }

    private byte[] construirMultipart(String boundary, byte[] imagen, String nombreArchivo) throws Exception {
        String inicio =
                "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"models\"\r\n\r\n" +
                "nudity-2.1,offensive,gore\r\n" +
                "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"api_user\"\r\n\r\n" + apiUser + "\r\n" +
                "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"api_secret\"\r\n\r\n" + apiSecret + "\r\n" +
                "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"media\"; filename=\"" +
                (nombreArchivo == null || nombreArchivo.isBlank() ? "imagen.jpg" : nombreArchivo) + "\"\r\n" +
                "Content-Type: application/octet-stream\r\n\r\n";

        String fin = "\r\n--" + boundary + "--\r\n";

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(inicio.getBytes(StandardCharsets.UTF_8));
        baos.write(imagen);
        baos.write(fin.getBytes(StandardCharsets.UTF_8));
        return baos.toByteArray();
    }
}
