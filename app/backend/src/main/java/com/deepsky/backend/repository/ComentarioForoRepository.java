package com.deepsky.backend.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.model.ComentarioForo;

public class ComentarioForoRepository {

    public ComentarioForo save(ComentarioForo comentario) {
        String sql = "INSERT INTO COMENTARIO_FORO (FORO_ID, USUARIO_ID, CONTENIDO, URL_IMAGEN) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, comentario.getForoId());
            stmt.setInt(2, comentario.getUsuarioId());
            stmt.setString(3, comentario.getContenido());
            stmt.setString(4, comentario.getUrlImagen());

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    comentario.setIdComentario(rs.getInt(1));
                }
            }
            return comentario;
        } catch (SQLException e) {
            throw new RuntimeException("Error al guardar comentario del foro en la base de datos", e);
        }
    }

    public List<ComentarioForo> findByForoId(int foroId) {
        List<ComentarioForo> lista = new ArrayList<>();
        String sql = "SELECT cf.ID_COMENTARIO, cf.FORO_ID, cf.USUARIO_ID, cf.CONTENIDO, cf.URL_IMAGEN, cf.FECHA_CREACION, u.NOMBRE as USUARIO_NOMBRE " +
                     "FROM COMENTARIO_FORO cf " +
                     "INNER JOIN USUARIO u ON cf.USUARIO_ID = u.ID_USUARIO " +
                     "WHERE cf.FORO_ID = ? ORDER BY cf.ID_COMENTARIO ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, foroId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ComentarioForo c = new ComentarioForo();
                    c.setIdComentario(rs.getInt("ID_COMENTARIO"));
                    c.setForoId(rs.getInt("FORO_ID"));
                    c.setUsuarioId(rs.getInt("USUARIO_ID"));
                    c.setUsuarioNombre(rs.getString("USUARIO_NOMBRE"));
                    c.setContenido(rs.getString("CONTENIDO"));
                    c.setUrlImagen(rs.getString("URL_IMAGEN"));
                    
                    Timestamp ts = rs.getTimestamp("FECHA_CREACION");
                    if (ts != null) {
                        c.setFechaCreacion(ts.toLocalDateTime());
                    }

                    lista.add(c);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener comentarios del foro", e);
        }
        return lista;
    }

    public ComentarioForo findById(int id) {
        String sql = "SELECT ID_COMENTARIO, FORO_ID, USUARIO_ID, CONTENIDO, URL_IMAGEN, FECHA_CREACION FROM COMENTARIO_FORO WHERE ID_COMENTARIO = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    ComentarioForo c = new ComentarioForo();
                    c.setIdComentario(rs.getInt("ID_COMENTARIO"));
                    c.setForoId(rs.getInt("FORO_ID"));
                    c.setUsuarioId(rs.getInt("USUARIO_ID"));
                    c.setContenido(rs.getString("CONTENIDO"));
                    c.setUrlImagen(rs.getString("URL_IMAGEN"));
                    Timestamp ts = rs.getTimestamp("FECHA_CREACION");
                    if (ts != null) c.setFechaCreacion(ts.toLocalDateTime());
                    return c;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener comentario por id", e);
        }
        return null;
    }

    public boolean deleteById(int id) {
        String sql = "DELETE FROM COMENTARIO_FORO WHERE ID_COMENTARIO = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al eliminar comentario", e);
        }
    }
}