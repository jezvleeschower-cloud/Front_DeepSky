package com.deepsky.backend.service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

import com.deepsky.backend.client.nasa.NasaApodClient;
import com.deepsky.backend.client.nasa.traslate.MyMemoryTranslationClient;
import com.deepsky.backend.dto.response.FotoDelDiaResponse;
import com.deepsky.backend.model.FotoDelDia;
import com.deepsky.backend.repository.FotoDelDiaRepository;

public class FotoDelDiaService {
    private static final Logger LOGGER = Logger.getLogger(FotoDelDiaService.class.getName());

    private final NasaApodClient nasaApodClient;
    private final MyMemoryTranslationClient translationClient;
    private final FotoDelDiaRepository fotoDelDiaRepository;

    // Hilo en segundo plano exclusivo para guardar en BD sin bloquear la respuesta
    private final ExecutorService guardadoAsync = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "foto-dia-save");
        t.setDaemon(true);
        return t;
    });

    public FotoDelDiaService(NasaApodClient nasaApodClient,
                              MyMemoryTranslationClient translationClient,
                              FotoDelDiaRepository fotoDelDiaRepository) {
        this.nasaApodClient = nasaApodClient;
        this.translationClient = translationClient;
        this.fotoDelDiaRepository = fotoDelDiaRepository;
    }

    public FotoDelDiaResponse obtenerFotoDelDiaActual() {
        String hoy = LocalDate.now().toString();

        try {
            // 1. Si ya existe en BD → devolver directo, sin retraduccir
            Optional<FotoDelDia> fotoEnDb = fotoDelDiaRepository.findByFecha(hoy);
            if (fotoEnDb.isPresent()) {
                LOGGER.info(() -> "Foto del día encontrada en BD: " + hoy);
                return mapToResponse(fotoEnDb.get(), true);
            }

            // 2. No existe → traer de NASA, traducir y responder
            LOGGER.info("Foto no encontrada en BD. Consultando NASA APOD...");
            FotoDelDia foto = nasaApodClient.fetchLatest();
            traducir(foto);

            // 3. Guardar en BD en segundo plano (no bloquea la respuesta)
            guardarAsync(foto);

            return mapToResponse(foto, false);

        } catch (SQLException e) {
            LOGGER.warning(() -> "Error de BD, usando fallback de NASA: " + e.getMessage());
            FotoDelDia fallback = nasaApodClient.fetchLatest();
            traducir(fallback);
            return mapToResponse(fallback, false);
        }
    }

    public FotoDelDiaResponse obtenerFotoDelDiaPorFecha(LocalDate fecha) {
        String fechaStr = fecha.toString();

        try {
            // 1. Si ya existe en BD → devolver directo
            Optional<FotoDelDia> fotoEnDb = fotoDelDiaRepository.findByFecha(fechaStr);
            if (fotoEnDb.isPresent()) {
                LOGGER.info(() -> "Foto encontrada en BD para fecha: " + fechaStr);
                return mapToResponse(fotoEnDb.get(), true);
            }

            // 2. No existe → traer de NASA, traducir y responder
            LOGGER.info(() -> "Foto no encontrada en BD para " + fechaStr + ". Consultando NASA APOD...");
            FotoDelDia foto = nasaApodClient.fetchByDate(fecha);
            traducir(foto);

            // 3. Guardar en BD en segundo plano
            guardarAsync(foto);

            return mapToResponse(foto, false);

        } catch (SQLException e) {
            LOGGER.warning(() -> "Error de BD para fecha " + fechaStr + ": " + e.getMessage());
            FotoDelDia fallback = nasaApodClient.fetchByDate(fecha);
            traducir(fallback);
            return mapToResponse(fallback, false);
        }
    }

    // Traduce título y descripción al español (modifica el objeto in-place)
    private void traducir(FotoDelDia foto) {
        try {
            if (foto.getTitulo() != null && !foto.getTitulo().isBlank()) {
                foto.setTitulo(translationClient.translateToSpanish(foto.getTitulo()));
            }
            if (foto.getDescripcion() != null && !foto.getDescripcion().isBlank()) {
                foto.setDescripcion(translationClient.translateToSpanish(foto.getDescripcion()));
            }
        } catch (RuntimeException e) {
            LOGGER.warning(() -> "No fue posible traducir la foto: " + e.getMessage());
        }
    }

    // Guarda en BD de forma asíncrona para no bloquear la respuesta HTTP
    private void guardarAsync(FotoDelDia foto) {
        guardadoAsync.submit(() -> {
            try {
                fotoDelDiaRepository.save(foto);
                LOGGER.info(() -> "Foto guardada en BD (async): " + foto.getFecha());
            } catch (Exception e) {
                LOGGER.warning(() -> "No fue posible guardar la foto en BD (async): " + e.getMessage());
            }
        });
    }

    private FotoDelDiaResponse mapToResponse(FotoDelDia foto, boolean cached) {
        FotoDelDiaResponse response = new FotoDelDiaResponse();
        response.setTitulo(foto.getTitulo());
        response.setDescripcion(foto.getDescripcion());
        response.setUrlImagen(foto.getUrlImagen());
        response.setFecha(foto.getFecha());
        response.setCopyright(foto.getCopyright());
        response.setMediaType(foto.getMediaType());
        response.setCached(cached);
        return response;
    }
}