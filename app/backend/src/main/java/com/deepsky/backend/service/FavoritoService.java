package com.deepsky.backend.service;

import com.deepsky.backend.dto.response.ImagenResponse;
import com.deepsky.backend.repository.FavoritoRepository;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class FavoritoService {
    private final FavoritoRepository favoritoRepository;

    public FavoritoService(FavoritoRepository favoritoRepository) {
        this.favoritoRepository = favoritoRepository;
    }

    /**
     * Marca una imagen como favorita para un usuario. Si la imagen todavía
     * no existe en el caché IMAGEN_NASA, la crea primero.
     * Es idempotente: si ya era favorita, no hace nada.
     */
    public void agregarFavorito(int usuarioId, ImagenResponse imagen) throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }
        if (imagen == null || imagen.getNasaId() == null || imagen.getNasaId().isBlank()) {
            throw new IllegalArgumentException("La imagen a marcar como favorita es obligatoria");
        }

        int imagenId = favoritoRepository.obtenerOcrearImagen(imagen);

        if (!favoritoRepository.existeFavorito(usuarioId, imagenId)) {
            favoritoRepository.agregarFavorito(usuarioId, imagenId);
        }
    }

    public void eliminarFavorito(int usuarioId, String nasaId) throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }
        if (nasaId == null || nasaId.isBlank()) {
            throw new IllegalArgumentException("El id de la imagen es obligatorio");
        }

        Optional<Integer> imagenId = favoritoRepository.findImagenIdByNasaId(nasaId);
        if (imagenId.isPresent()) {
            favoritoRepository.eliminarFavorito(usuarioId, imagenId.get());
        }
    }

    public List<ImagenResponse> listarFavoritos(int usuarioId) throws SQLException {
        if (usuarioId <= 0) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }
        return favoritoRepository.listarFavoritosPorUsuario(usuarioId);
    }
}