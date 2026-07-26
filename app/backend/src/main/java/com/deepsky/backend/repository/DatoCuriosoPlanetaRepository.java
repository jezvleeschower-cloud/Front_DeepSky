package com.deepsky.backend.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.deepsky.backend.db.DatabaseConnection;
import com.deepsky.backend.model.DatoCuriosoPlaneta;

public class DatoCuriosoPlanetaRepository {

    public List<DatoCuriosoPlaneta> findByPlanetaId(int planetaId) {
        List<DatoCuriosoPlaneta> datos = new ArrayList<>();
        String sql = "SELECT * FROM DATO_CURIOSO_PLANETA WHERE PLANETA_ID = ? ORDER BY FECHA_PUBLICACION DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, planetaId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    DatoCuriosoPlaneta dato = new DatoCuriosoPlaneta();
                    dato.setIdDato(rs.getInt("ID_DATO"));
                    dato.setPlanetaId(rs.getInt("PLANETA_ID"));
                    dato.setUsuarioId(rs.getInt("USUARIO_ID"));
                    dato.setDato(rs.getString("DATO"));
                    dato.setFechaPublicacion(rs.getTimestamp("FECHA_PUBLICACION").toLocalDateTime());
                    datos.add(dato);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al consultar los datos curiosos del planeta ID: " + planetaId, e);
        }
        return datos;
    }

    public DatoCuriosoPlaneta save(DatoCuriosoPlaneta datoCurioso) {
        String sql = "INSERT INTO DATO_CURIOSO_PLANETA (PLANETA_ID, USUARIO_ID, DATO, FECHA_PUBLICACION) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime ahora = LocalDateTime.now();
            stmt.setInt(1, datoCurioso.getPlanetaId());
            stmt.setInt(2, datoCurioso.getUsuarioId());
            stmt.setString(3, datoCurioso.getDato());
            stmt.setTimestamp(4, Timestamp.valueOf(ahora));

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    datoCurioso.setIdDato(rs.getInt(1));
                }
            }
            datoCurioso.setFechaPublicacion(ahora);
            return datoCurioso;

        } catch (SQLException e) {
            throw new RuntimeException("Error al guardar la curiosidad del planeta: " + e.getMessage(), e);
        }
    }

    public boolean deleteById(int idDato) {
        String sql = "DELETE FROM DATO_CURIOSO_PLANETA WHERE ID_DATO = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idDato);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Error al eliminar la curiosidad del planeta: " + e.getMessage(), e);
        }
    }
}