package com.deepsky.backend.dto.request;

/**
 * Campos de texto de POST /api/retos/{id}/participaciones. Esa ruta recibe
 * multipart/form-data (usuarioId, titulo e imagen), así que Javalin no
 * puede mapear el body completo con bodyAsClass; el controlador arma este
 * DTO leyendo ctx.formParam(...) y procesa el archivo aparte con
 * ctx.uploadedFile("imagen").
 */
public class ParticipacionRetoRequest {
    private int usuarioId;
    private String titulo;

    public ParticipacionRetoRequest() {
    }

    public ParticipacionRetoRequest(int usuarioId, String titulo) {
        this.usuarioId = usuarioId;
        this.titulo = titulo;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
}