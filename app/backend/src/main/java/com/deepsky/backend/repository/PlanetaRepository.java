package com.deepsky.backend.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.deepsky.backend.db.DatabaseConnection; 
import com.deepsky.backend.model.Planeta;

public class PlanetaRepository {

    public List<Planeta> findAll() {
        List<Planeta> planetas = new ArrayList<>();
        String sql = "SELECT * FROM PLANETA ORDER BY ORDEN_VISUAL ASC";

        // Usamos DatabaseConnection en lugar de DatabaseConfig
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                planetas.add(mapResultSetToPlaneta(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al consultar la lista de planetas", e);
        }
        return planetas;
    }

    public Optional<Planeta> findById(int id) {
        String sql = "SELECT * FROM PLANETA WHERE ID_PLANETA = ?";
        // Usamos DatabaseConnection en lugar de DatabaseConfig
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPlaneta(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al buscar el planeta con ID: " + id, e);
        }
        return Optional.empty();
    }

    private Planeta mapResultSetToPlaneta(ResultSet rs) throws SQLException {
        Planeta planeta = new Planeta();
        planeta.setIdPlaneta(rs.getInt("ID_PLANETA"));
        planeta.setNombre(rs.getString("NOMBRE"));
        planeta.setMasaKg(rs.getBigDecimal("MASA_KG"));
        planeta.setRadioKm(rs.getBigDecimal("RADIO_KM"));
        planeta.setPeriodoOrbitalDias(rs.getBigDecimal("PERIODO_ORBITAL_DIAS"));
        planeta.setDistanciaSolUa(rs.getBigDecimal("DISTANCIA_SOL_UA"));
        planeta.setInclinacionAxial(rs.getBigDecimal("INCLINACION_AXIAL"));
        planeta.setTexturaUrl(rs.getString("TEXTURA_URL"));
        planeta.setModelo3dUrl(rs.getString("MODELO_3D_URL"));
        planeta.setDescripcion(rs.getString("DESCRIPCION"));
        planeta.setOrdenVisual(rs.getInt("ORDEN_VISUAL"));
        return planeta;
    }
}