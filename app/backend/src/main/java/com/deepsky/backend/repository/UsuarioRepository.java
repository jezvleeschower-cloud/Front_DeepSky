package com.deepsky.backend.repository;

import com.deepsky.backend.db.DatabaseConnection;
import com.deepsky.backend.model.RolUsuario;
import com.deepsky.backend.model.Usuario;

import java.sql.*;
import java.util.Optional;

public class UsuarioRepository {

    public Optional<Usuario> findByEmail(String email) {
        String sql = "SELECT ID_USUARIO, NOMBRE, EMAIL, PASSWORD_HASH, ROL, FECHA_REGISTRO FROM USUARIO WHERE EMAIL = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUsuario(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al buscar el usuario por email", e);
        }
        return Optional.empty();
    }

    public Optional<Usuario> findById(int idUsuario) {
        String sql = "SELECT ID_USUARIO, NOMBRE, EMAIL, PASSWORD_HASH, ROL, FECHA_REGISTRO FROM USUARIO WHERE ID_USUARIO = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToUsuario(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al buscar el usuario por id", e);
        }
        return Optional.empty();
    }

    public Usuario guardar(Usuario usuario) {
        String sql = "INSERT INTO USUARIO (NOMBRE, EMAIL, PASSWORD_HASH, ROL) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, usuario.getNombre());
            stmt.setString(2, usuario.getEmail());
            stmt.setString(3, usuario.getPasswordHash());
            stmt.setString(4, usuario.getRol().name());

            stmt.executeUpdate();
            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    usuario.setIdUsuario(keys.getInt(1));
                }
            }
            return usuario;
        } catch (SQLException e) {
            throw new RuntimeException("Error al guardar el usuario en la base de datos", e);
        }
    }

    public void actualizarPassword(String email, String nuevoPasswordHash) {
        String sql = "UPDATE USUARIO SET PASSWORD_HASH = ? WHERE EMAIL = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, nuevoPasswordHash);
            stmt.setString(2, email);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar la contraseña del usuario", e);
        }
    }

    private Usuario mapResultSetToUsuario(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setIdUsuario(rs.getInt("ID_USUARIO"));
        u.setNombre(rs.getString("NOMBRE"));
        u.setEmail(rs.getString("EMAIL"));
        u.setPasswordHash(rs.getString("PASSWORD_HASH"));
        u.setRol(RolUsuario.valueOf(rs.getString("ROL")));
        
        Timestamp timestamp = rs.getTimestamp("FECHA_REGISTRO");
        if (timestamp != null) {
            u.setFechaRegistro(timestamp.toLocalDateTime());
        }
        return u;
    }
}