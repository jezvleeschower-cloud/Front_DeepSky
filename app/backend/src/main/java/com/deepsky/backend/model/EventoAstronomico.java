package com.deepsky.backend.model;

import java.time.LocalDateTime;

public class EventoAstronomico {
    private Integer idEvento;
    private Integer usuarioId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaHora;

    // Constructor vacío
    public EventoAstronomico() {}

    // Constructor completo
    public EventoAstronomico(Integer usuarioId, String titulo, String descripcion, LocalDateTime fechaHora) {
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
    }

    // Getters y Setters (Encapsulamiento POO)
    public Integer getIdEvento() { return idEvento; }
    public void setIdEvento(Integer idEvento) { this.idEvento = idEvento; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}