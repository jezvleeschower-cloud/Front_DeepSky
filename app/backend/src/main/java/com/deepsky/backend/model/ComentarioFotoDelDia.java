package com.deepsky.backend.model;

import java.time.LocalDateTime;

public class ComentarioFotoDelDia {
    private int idComentario;
    private Integer usuarioId;
    private String usuarioNombre; // Nombre real del autor (USUARIO.NOMBRE)
    private Integer imagenDiaId;
    private Integer padreId;
    private String contenido;
    private LocalDateTime fechaComentario;

    public ComentarioFotoDelDia() {}

    // Getters y Setters para idComentario
    public int getIdComentario() {
        return idComentario;
    }

    public void setIdComentario(int idComentario) {
        this.idComentario = idComentario;
    }

    // Métodos alias por si alguna otra parte de la app usa getId() / setId()
    public int getId() {
        return idComentario;
    }

    public void setId(int id) {
        this.idComentario = id;
    }

    // Getters y Setters para usuarioId e imagenDiaId
    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public Integer getImagenDiaId() {
        return imagenDiaId;
    }

    public void setImagenDiaId(Integer imagenDiaId) {
        this.imagenDiaId = imagenDiaId;
    }

    // Getters y Setters para padreId
    public Integer getPadreId() {
        return padreId;
    }

    public void setPadreId(Integer padreId) {
        this.padreId = padreId;
    }

    // Getters y Setters para contenido
    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    // Getters y Setters para fechaComentario
    public LocalDateTime getFechaComentario() {
        return fechaComentario;
    }

    public void setFechaComentario(LocalDateTime fechaComentario) {
        this.fechaComentario = fechaComentario;
    }

    // Método alias por si en el controller o servicio usas getFecha()
    public LocalDateTime getFecha() {
        return fechaComentario;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fechaComentario = fecha;
    }
}