package com.deepsky.backend.model;

import java.math.BigDecimal;
import java.util.List;

public class Planeta {
    private int idPlaneta;
    private String nombre;
    private BigDecimal masaKg;
    private BigDecimal radioKm;
    private BigDecimal periodoOrbitalDias;
    private BigDecimal distanciaSolUa;
    private BigDecimal inclinacionAxial;
    private String texturaUrl;
    private String modelo3dUrl;
    private String descripcion;
    private int ordenVisual;
    private List<DatoCuriosoPlaneta> datosCuriosos; // Relación con sus datos curiosos

    public Planeta() {}

    // Getters y Setters
    public int getIdPlaneta() { return idPlaneta; }
    public void setIdPlaneta(int idPlaneta) { this.idPlaneta = idPlaneta; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getMasaKg() { return masaKg; }
    public void setMasaKg(BigDecimal masaKg) { this.masaKg = masaKg; }

    public BigDecimal getRadioKm() { return radioKm; }
    public void setRadioKm(BigDecimal radioKm) { this.radioKm = radioKm; }

    public BigDecimal getPeriodoOrbitalDias() { return periodoOrbitalDias; }
    public void setPeriodoOrbitalDias(BigDecimal periodoOrbitalDias) { this.periodoOrbitalDias = periodoOrbitalDias; }

    public BigDecimal getDistanciaSolUa() { return distanciaSolUa; }
    public void setDistanciaSolUa(BigDecimal distanciaSolUa) { this.distanciaSolUa = distanciaSolUa; }

    public BigDecimal getInclinacionAxial() { return inclinacionAxial; }
    public void setInclinacionAxial(BigDecimal inclinacionAxial) { this.inclinacionAxial = inclinacionAxial; }

    public String getTexturaUrl() { return texturaUrl; }
    public void setTexturaUrl(String texturaUrl) { this.texturaUrl = texturaUrl; }

    public String getModelo3dUrl() { return modelo3dUrl; }
    public void setModelo3dUrl(String modelo3dUrl) { this.modelo3dUrl = modelo3dUrl; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public int getOrdenVisual() { return ordenVisual; }
    public void setOrdenVisual(int ordenVisual) { this.ordenVisual = ordenVisual; }

    public List<DatoCuriosoPlaneta> getDatosCuriosos() { return datosCuriosos; }
    public void setDatosCuriosos(List<DatoCuriosoPlaneta> datosCuriosos) { this.datosCuriosos = datosCuriosos; }
}