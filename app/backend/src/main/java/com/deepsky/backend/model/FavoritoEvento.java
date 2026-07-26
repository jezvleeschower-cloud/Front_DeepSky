package com.deepsky.backend.model;

import java.time.LocalDateTime;

public class FavoritoEvento {
    private Integer idFavoritoEvento;
    private Integer usuarioId;
    private Integer eventoId;
    private LocalDateTime fechaGuardado;

    public FavoritoEvento() {}

    public FavoritoEvento(Integer usuarioId, Integer eventoId) {
        this.usuarioId = usuarioId;
        this.eventoId = eventoId;
    }

    // Getters y Setters
    public Integer getIdFavoritoEvento() { return idFavoritoEvento; }
    public void setIdFavoritoEvento(Integer idFavoritoEvento) { this.idFavoritoEvento = idFavoritoEvento; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getEventoId() { return eventoId; }
    public void setEventoId(Integer eventoId) { this.eventoId = eventoId; }

    public LocalDateTime getFechaGuardado() { return fechaGuardado; }
    public void setFechaGuardado(LocalDateTime fechaGuardado) { this.fechaGuardado = fechaGuardado; }
}