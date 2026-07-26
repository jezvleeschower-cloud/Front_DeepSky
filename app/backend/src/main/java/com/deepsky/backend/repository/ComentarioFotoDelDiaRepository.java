package com.deepsky.backend.repository;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.model.ComentarioFotoDelDia;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ComentarioFotoDelDiaRepository {

    // 1. Guardar un nuevo comentario
    public void save(ComentarioFotoDelDia comentario) throws SQLException {
        String sql = "INSERT INTO COMENTARIO_IMAGEN_DIA (IMAGEN_DIA_ID, USUARIO_ID, PADRE_ID, CONTENIDO) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, comentario.getImagenDiaId());
            stmt.setInt(2, comentario.getUsuarioId());
            
            if (comentario.getPadreId() != null) {
                stmt.setInt(3, comentario.getPadreId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            
            stmt.setString(4, comentario.getContenido());
            stmt.executeUpdate();
        }
    }

    // 2. Obtener todos los comentarios de una foto específica
    public List<ComentarioFotoDelDia> findByImagenDiaId(int imagenDiaId) throws SQLException {
        List<ComentarioFotoDelDia> lista = new ArrayList<>();
        String sql = "SELECT c.*, u.NOMBRE as USUARIO_NOMBRE " +
                     "FROM COMENTARIO_IMAGEN_DIA c " +
                     "INNER JOIN USUARIO u ON c.USUARIO_ID = u.ID_USUARIO " +
                     "WHERE c.IMAGEN_DIA_ID = ? ORDER BY c.FECHA_COMENTARIO ASC";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, imagenDiaId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ComentarioFotoDelDia c = new ComentarioFotoDelDia();
                    c.setIdComentario(rs.getInt("ID_COMENTARIO"));
                    c.setImagenDiaId(rs.getInt("IMAGEN_DIA_ID"));
                    c.setUsuarioId(rs.getInt("USUARIO_ID"));
                    c.setUsuarioNombre(rs.getString("USUARIO_NOMBRE"));
                    c.setPadreId(rs.getObject("PADRE_ID") != null ? rs.getInt("PADRE_ID") : null);
                    c.setContenido(rs.getString("CONTENIDO"));
                    c.setFechaComentario(rs.getTimestamp("FECHA_COMENTARIO").toLocalDateTime());
                    lista.add(c);
                }
            }
        }
        return lista;
    }
    // 3. Eliminar un comentario por su id
    public boolean deleteById(int idComentario) throws SQLException {
        String sql = "DELETE FROM COMENTARIO_IMAGEN_DIA WHERE ID_COMENTARIO = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idComentario);
            return stmt.executeUpdate() > 0;
        }
    }

    public Optional<Integer> findIdByFecha(String fecha) throws SQLException {
    String sql = "SELECT ID_IMAGEN_DIA FROM IMAGEN_DIA WHERE FECHA_PUBLICACION = ? LIMIT 1";
    try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setString(1, fecha);
        try (ResultSet rs = stmt.executeQuery()) {
            return rs.next() ? Optional.of(rs.getInt("ID_IMAGEN_DIA")) : Optional.empty();
        }
    }
}
}