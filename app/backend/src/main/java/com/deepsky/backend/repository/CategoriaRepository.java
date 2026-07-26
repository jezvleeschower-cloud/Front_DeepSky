package com.deepsky.backend.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

import com.deepsky.backend.db.DatabaseConnection;
import com.deepsky.backend.model.Categoria;

public class CategoriaRepository {

    public Optional<Categoria> findByNombre(String nombre) {
        String sql = "SELECT * FROM CATEGORIA WHERE LOWER(NOMBRE) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, nombre.trim());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Categoria c = new Categoria();
                    c.setIdCategoria(rs.getInt("ID_CATEGORIA"));
                    c.setNombre(rs.getString("NOMBRE"));
                    c.setDescripcion(rs.getString("DESCRIPCION"));
                    return Optional.of(c);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al consultar categoría por nombre: " + nombre, e);
        }
        return Optional.empty();
    }

    public Categoria save(Categoria categoria) {
        String sql = "INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES (?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, categoria.getNombre().trim());
            stmt.setString(2, categoria.getDescripcion() != null ? categoria.getDescripcion() : "Categoría creada automáticamente.");

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    categoria.setIdCategoria(rs.getInt(1));
                }
            }
            return categoria;

        } catch (SQLException e) {
            throw new RuntimeException("Error al guardar la nueva categoría: " + e.getMessage(), e);
        }
    }
}