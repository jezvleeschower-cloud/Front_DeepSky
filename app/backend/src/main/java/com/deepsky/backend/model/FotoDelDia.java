package com.deepsky.backend.model;

public class FotoDelDia {
    private String titulo;
    private String descripcion;
    private String urlImagen;
    private String fecha;
    private String copyright;
    private String mediaType;

    public FotoDelDia() {
    }

    public FotoDelDia(String titulo, String descripcion, String urlImagen, String fecha, String copyright, String mediaType) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.urlImagen = urlImagen;
        this.fecha = fecha;
        this.copyright = copyright;
        this.mediaType = mediaType;
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

    public String getUrlImagen() {
        return urlImagen;
    }

    public void setUrlImagen(String urlImagen) {
        this.urlImagen = urlImagen;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getCopyright() {
        return copyright;
    }

    public void setCopyright(String copyright) {
        this.copyright = copyright;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
}
