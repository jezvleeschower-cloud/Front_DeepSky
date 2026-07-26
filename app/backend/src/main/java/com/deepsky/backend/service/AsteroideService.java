package com.deepsky.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.deepsky.backend.client.nasa.NasaNeoWsClient;
import com.deepsky.backend.model.Asteroide;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AsteroideService {
    private final NasaNeoWsClient nasaClient;
    private final ObjectMapper objectMapper;
    private List<Asteroide> cacheAsteroides;

    public AsteroideService(NasaNeoWsClient nasaClient) {
        this.nasaClient = nasaClient;
        this.objectMapper = new ObjectMapper();
    }

    public synchronized List<Asteroide> obtenerAsteroides() {
        if (cacheAsteroides != null && !cacheAsteroides.isEmpty()) {
            System.out.println("[CACHE] Retornando asteroides desde la caché local.");
            return cacheAsteroides;
        }

        System.out.println("[API] Caché vacía. Solicitando nuevos datos a NeoWs de la NASA...");
        List<Asteroide> listaMapeada = new ArrayList<>();

        try {
            String jsonCrudo = nasaClient.obtenerAsteroidesDelDia();
            JsonNode rootNode = objectMapper.readTree(jsonCrudo);
            JsonNode nearEarthObjects = rootNode.path("near_earth_objects");

            Iterator<String> fieldNames = nearEarthObjects.fieldNames();
            while (fieldNames.hasNext()) {
                String fecha = fieldNames.next();
                JsonNode asteroidesDeFecha = nearEarthObjects.get(fecha);

                for (JsonNode node : asteroidesDeFecha) {
                    Asteroide ast = new Asteroide();
                    ast.setId(node.path("id").asText());
                    ast.setNombre(node.path("name").asText());
                    ast.setEsPeligroso(node.path("is_potentially_hazardous_asteroid").asBoolean());
                    ast.setFechaAproximacion(fecha);
                    if (node.hasNonNull("absolute_magnitude_h")) {
                        ast.setMagnitudAbsoluta(new BigDecimal(node.path("absolute_magnitude_h").asText()));
                    }

                    // Diámetro mínimo Y máximo en km
                    JsonNode estDiameter = node.path("estimated_diameter").path("kilometers");
                    ast.setDiametroMinimoKm(new BigDecimal(estDiameter.path("estimated_diameter_min").asText()));
                    ast.setDiametroMaximoKm(new BigDecimal(estDiameter.path("estimated_diameter_max").asText()));

                    JsonNode closeApproach = node.path("close_approach_data").get(0);
                    if (closeApproach != null) {
                        ast.setVelocidadKmh(closeApproach.path("relative_velocity").path("kilometers_per_hour").asText());
                        ast.setDistanciaTierraKm(closeApproach.path("miss_distance").path("kilometers").asText());
                        // Distancia en unidades lunares (más intuitiva para el usuario)
                        ast.setDistanciaLunar(closeApproach.path("miss_distance").path("lunar").asText());
                    }

                    listaMapeada.add(ast);
                }
            }

            this.cacheAsteroides = listaMapeada;

        } catch (JsonProcessingException | RuntimeException e) {
            System.err.println("[FALLBACK] Error procesando los asteroides: " + e.getMessage() + ". Cargando datos de contingencia.");
            this.cacheAsteroides = obtenerDatosDeContingencia();
        }

        return cacheAsteroides;
    }

    private List<Asteroide> obtenerDatosDeContingencia() {
        List<Asteroide> mockList = new ArrayList<>();

        Asteroide a1 = new Asteroide();
        a1.setId("99942");
        a1.setNombre("(99942) Apophis - Contingencia");
        a1.setEsPeligroso(true);
        a1.setFechaAproximacion("2026-07-10");
        a1.setDiametroMinimoKm(new BigDecimal("0.310"));
        a1.setDiametroMaximoKm(new BigDecimal("0.370"));
        a1.setVelocidadKmh("44210.35");
        a1.setDistanciaTierraKm("31800.00");
        a1.setDistanciaLunar("0.08");
        a1.setMagnitudAbsoluta(new BigDecimal("19.7"));

        Asteroide a2 = new Asteroide();
        a2.setId("101955");
        a2.setNombre("(101955) Bennu - Contingencia");
        a2.setEsPeligroso(false);
        a2.setFechaAproximacion("2026-07-10");
        a2.setDiametroMinimoKm(new BigDecimal("0.430"));
        a2.setDiametroMaximoKm(new BigDecimal("0.490"));
        a2.setVelocidadKmh("22530.12");
        a2.setDistanciaTierraKm("4200000.50");
        a2.setDistanciaLunar("10.93");
        a2.setMagnitudAbsoluta(new BigDecimal("20.9"));

        mockList.add(a1);
        mockList.add(a2);
        return mockList;
    }

    public synchronized void limpiarCache() {
        this.cacheAsteroides = null;
    }
}