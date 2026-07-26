package com.deepsky.backend.model;

import java.math.BigDecimal;

public class Asteroide {
    private String id;
    private String nombre;
    private BigDecimal diametroMinimoKm;
    private BigDecimal diametroMaximoKm;
    private boolean esPeligroso;
    private String velocidadKmh;
    private String distanciaTierraKm;
    private String distanciaLunar;
    private String fechaAproximacion;
    private BigDecimal magnitudAbsoluta;

    public Asteroide() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getDiametroMinimoKm() { return diametroMinimoKm; }
    public void setDiametroMinimoKm(BigDecimal diametroMinimoKm) { this.diametroMinimoKm = diametroMinimoKm; }

    public BigDecimal getDiametroMaximoKm() { return diametroMaximoKm; }
    public void setDiametroMaximoKm(BigDecimal diametroMaximoKm) { this.diametroMaximoKm = diametroMaximoKm; }

    public boolean isEsPeligroso() { return esPeligroso; }
    public void setEsPeligroso(boolean esPeligroso) { this.esPeligroso = esPeligroso; }

    public String getVelocidadKmh() { return velocidadKmh; }
    public void setVelocidadKmh(String velocidadKmh) { this.velocidadKmh = velocidadKmh; }

    public String getDistanciaTierraKm() { return distanciaTierraKm; }
    public void setDistanciaTierraKm(String distanciaTierraKm) { this.distanciaTierraKm = distanciaTierraKm; }

    public String getDistanciaLunar() { return distanciaLunar; }
    public void setDistanciaLunar(String distanciaLunar) { this.distanciaLunar = distanciaLunar; }

    public String getFechaAproximacion() { return fechaAproximacion; }
    public void setFechaAproximacion(String fechaAproximacion) { this.fechaAproximacion = fechaAproximacion; }

    public BigDecimal getMagnitudAbsoluta() { return magnitudAbsoluta; }
    public void setMagnitudAbsoluta(BigDecimal magnitudAbsoluta) { this.magnitudAbsoluta = magnitudAbsoluta; }
}