package com.deepsky.backend.dto.response;

public class RetoAstrofotografiaResponse {
    private int id;
    private int usuarioId;
    private String creador;
    private String titulo;
    private String descripcion;
    private String fechaLimite;
    private String fechaCreacion;
    private boolean finalizado;
    private String fechaFinalizacion;
    private String urlImagen;

    public String getUrlImagen() { return urlImagen; }
    public void setUrlImagen(String urlImagen) { this.urlImagen = urlImagen; }

// getters y setters
public boolean isFinalizado() { return finalizado; }
public void setFinalizado(boolean finalizado) { this.finalizado = finalizado; }
public String getFechaFinalizacion() { return fechaFinalizacion; }
public void setFechaFinalizacion(String fechaFinalizacion) { this.fechaFinalizacion = fechaFinalizacion; }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getCreador() {
        return creador;
    }

    public void setCreador(String creador) {
        this.creador = creador;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(String fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}