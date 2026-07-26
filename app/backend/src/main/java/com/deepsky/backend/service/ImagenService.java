package com.deepsky.backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import com.deepsky.backend.client.nasa.NasaImageSearchClient;
import com.deepsky.backend.client.nasa.traslate.MyMemoryTranslationClient;
import com.deepsky.backend.dto.response.ImagenResponse;

public class ImagenService {
    private final NasaImageSearchClient nasaImageSearchClient;
    private final MyMemoryTranslationClient translationClient;

    public ImagenService(NasaImageSearchClient nasaImageSearchClient, MyMemoryTranslationClient translationClient) {
        this.nasaImageSearchClient = nasaImageSearchClient;
        this.translationClient = translationClient;
    }

    public List<ImagenResponse> buscarImagenes(String query, String category) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("El parámetro de búsqueda 'q' es obligatorio");
        }
        // Si el cliente indicó una categoría explícita, la anexamos a la consulta
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("Todo") && !category.equalsIgnoreCase("Todos")) {
            query = query.trim() + " " + category.trim();
        }

        // No se traduce aquí a propósito: el grid puede traer 10-20+ resultados
        // y traducir todos de golpe dispararía demasiadas peticiones al servicio
        // gratuito de traducción. Solo se traduce la imagen que el usuario abre
        // (ver obtenerPorId), que además ya queda cacheada en MyMemoryTranslationClient.
        List<ImagenResponse> resultados = nasaImageSearchClient.search(query.trim());
        return resultados;
    }

    public ImagenResponse obtenerPorId(String nasaId) {
        if (nasaId == null || nasaId.isBlank()) {
            throw new IllegalArgumentException("El id de la imagen es obligatorio");
        }
        ImagenResponse ir = nasaImageSearchClient.buscarPorId(nasaId.trim())
                .orElseThrow(() -> new NoSuchElementException("No se encontró la imagen con id " + nasaId));

        // Se traduce solo esta imagen (la que el usuario está viendo en detalle).
        // translationClient ya cachea en memoria, así que reabrir la misma imagen
        // no vuelve a llamar al servicio externo.
        if (ir.getTitle() != null && !ir.getTitle().isBlank()) {
            ir.setTitle(translationClient.translateToSpanish(ir.getTitle()));
        }
        if (ir.getDescription() != null && !ir.getDescription().isBlank()) {
            ir.setDescription(translationClient.translateToSpanish(ir.getDescription()));
        }
        return ir;
    }
}