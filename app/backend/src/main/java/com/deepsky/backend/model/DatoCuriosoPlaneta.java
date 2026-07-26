package com.deepsky.backend.model;

import java.time.LocalDateTime;

public class DatoCuriosoPlaneta {
    private int idDato;
    private int planetaId;
    private int usuarioId;
    private String dato;
    private LocalDateTime fechaPublicacion;

    public DatoCuriosoPlaneta() {}

    public int getIdDato() { return idDato; }
    public void setIdDato(int idDato) { this.idDato = idDato; }

    public int getPlanetaId() { return planetaId; }
    public void setPlanetaId(int planetaId) { this.planetaId = planetaId; }

    public int getUsuarioId() { return usuarioId; }
    public void setUsuarioId(int usuarioId) { this.usuarioId = usuarioId; }

    public String getDato() { return dato; }
    public void setDato(String dato) { this.dato = dato; }

    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
}