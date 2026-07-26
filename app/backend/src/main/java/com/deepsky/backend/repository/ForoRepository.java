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
import com.deepsky.backend.model.Foro;

public class ForoRepository {

    public Foro save(Foro foro) {
        String sql = "INSERT INTO FORO (CATEGORIA_ID, USUARIO_ID, TITULO, CONTENIDO, FECHA_CREACION) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime ahora = LocalDateTime.now();
            stmt.setInt(1, foro.getCategoriaId());
            stmt.setInt(2, foro.getUsuarioId());
            stmt.setString(3, foro.getTitulo());
            stmt.setString(4, foro.getContenido());
            stmt.setTimestamp(5, Timestamp.valueOf(ahora));

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    foro.setIdForo(rs.getInt(1));
                }
            }
            foro.setFechaCreacion(ahora);
            return foro;

        } catch (SQLException e) {
            throw new RuntimeException("Error al guardar el hilo en el foro: " + e.getMessage(), e);
        }
    }

    public List<Foro> findAll() {
        List<Foro> hilos = new ArrayList<>();
        String sql = "SELECT f.*, c.NOMBRE as CATEGORIA_NOMBRE, u.NOMBRE as USUARIO_NOMBRE " +
                     "FROM FORO f " +
                     "INNER JOIN CATEGORIA c ON f.CATEGORIA_ID = c.ID_CATEGORIA " +
                     "INNER JOIN USUARIO u ON f.USUARIO_ID = u.ID_USUARIO " +
                     "ORDER BY f.FECHA_CREACION DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Foro f = new Foro();
                f.setIdForo(rs.getInt("ID_FORO"));
                f.setCategoriaId(rs.getInt("CATEGORIA_ID"));
                f.setCategoriaNombre(rs.getString("CATEGORIA_NOMBRE"));
                f.setUsuarioId(rs.getInt("USUARIO_ID"));
                f.setUsuarioNombre(rs.getString("USUARIO_NOMBRE"));
                f.setTitulo(rs.getString("TITULO"));
                f.setContenido(rs.getString("CONTENIDO"));
                f.setFechaCreacion(rs.getTimestamp("FECHA_CREACION").toLocalDateTime());
                hilos.add(f);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al listar los hilos del foro", e);
        }
        return hilos;
    }

    public boolean deleteById(int foroId) {
    // Primero eliminar comentarios del hilo (FK)
    String sqlComentarios = "DELETE FROM COMENTARIO_FORO WHERE FORO_ID = ?";
    String sqlForo = "DELETE FROM FORO WHERE ID_FORO = ?";
    try (Connection conn = DatabaseConnection.getConnection()) {
        try (PreparedStatement stmt = conn.prepareStatement(sqlComentarios)) {
            stmt.setInt(1, foroId);
            stmt.executeUpdate();
        }
        try (PreparedStatement stmt = conn.prepareStatement(sqlForo)) {
            stmt.setInt(1, foroId);
            return stmt.executeUpdate() > 0;
        }
    } catch (SQLException e) {
        throw new RuntimeException("Error al eliminar el hilo: " + e.getMessage(), e);
    }
}

public Foro findById(int foroId) {
    String sql = "SELECT f.*, c.NOMBRE as CATEGORIA_NOMBRE, u.NOMBRE as USUARIO_NOMBRE " +
                 "FROM FORO f " +
                 "INNER JOIN CATEGORIA c ON f.CATEGORIA_ID = c.ID_CATEGORIA " +
                 "INNER JOIN USUARIO u ON f.USUARIO_ID = u.ID_USUARIO " +
                 "WHERE f.ID_FORO = ?";
    try (Connection conn = DatabaseConnection.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setInt(1, foroId);
        try (ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                Foro f = new Foro();
                f.setIdForo(rs.getInt("ID_FORO"));
                f.setCategoriaId(rs.getInt("CATEGORIA_ID"));
                f.setCategoriaNombre(rs.getString("CATEGORIA_NOMBRE"));
                f.setUsuarioId(rs.getInt("USUARIO_ID"));
                f.setUsuarioNombre(rs.getString("USUARIO_NOMBRE"));
                f.setTitulo(rs.getString("TITULO"));
                f.setContenido(rs.getString("CONTENIDO"));
                f.setFechaCreacion(rs.getTimestamp("FECHA_CREACION").toLocalDateTime());
                return f;
            }
        }
    } catch (SQLException e) {
        throw new RuntimeException("Error al buscar el hilo: " + e.getMessage(), e);
    }
    return null;
}
}