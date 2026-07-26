package com.deepsky.backend.model;

import java.time.LocalDateTime;

public class ComentarioForo {
    private int idComentario;
    private int foroId;
    private int usuarioId;
    private String usuarioNombre; // Nombre real del autor (USUARIO.NOMBRE)
    private String contenido;
    private String urlImagen;
    private LocalDateTime fechaCreacion;

    public ComentarioForo() {}

    public int getIdComentario() {
        return idComentario;
    }

    public void setIdComentario(int idComentario) {
        this.idComentario = idComentario;
    }

    public int getForoId() {
        return foroId;
    }

    public void setForoId(int foroId) {
        this.foroId = foroId;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public String getUrlImagen() {
        return urlImagen;
    }

    public void setUrlImagen(String urlImagen) {
        this.urlImagen = urlImagen;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}