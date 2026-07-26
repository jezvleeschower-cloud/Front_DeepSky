package com.deepsky.backend.dto.request;

import com.deepsky.backend.dto.response.ImagenResponse;

/**
 * Cuerpo esperado en POST /api/favoritos.
 * Trae el usuario que marca el favorito y los datos de la imagen de la NASA
 * (tal como los devuelve el módulo de búsqueda), para poder cachearla en
 * IMAGEN_NASA si todavía no existe.
 */
public class FavoritoRequest {
    private int usuarioId;
    private ImagenResponse imagen;

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public ImagenResponse getImagen() {
        return imagen;
    }

    public void setImagen(ImagenResponse imagen) {
        this.imagen = imagen;
    }
}