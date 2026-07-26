package com.deepsky.backend.dto.response;

/**
 * Lo que ve el frontend por cada participación: urlImagen es siempre la
 * URL que devolvió Cloudinary al subir la foto, nunca una ruta local.
 */
public class ParticipacionRetoResponse {
    private int id;
    private int retoId;
    private int usuarioId;
    private String autor;
    private String titulo;
    private String urlImagen;
    private int likes;
    private String fechaSubida;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getRetoId() {
        return retoId;
    }

    public void setRetoId(int retoId) {
        this.retoId = retoId;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getUrlImagen() {
        return urlImagen;
    }

    public void setUrlImagen(String urlImagen) {
        this.urlImagen = urlImagen;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public String getFechaSubida() {
        return fechaSubida;
    }

    public void setFechaSubida(String fechaSubida) {
        this.fechaSubida = fechaSubida;
    }
}