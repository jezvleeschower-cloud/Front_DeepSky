package com.deepsky.backend.repository;

import com.deepsky.backend.model.FavoritoEvento;
import com.deepsky.backend.db.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FavoritoEventoRepository {

    // Guardar Evento Fijado/Favorito
    public FavoritoEvento addFavorito(FavoritoEvento favorito) throws SQLException {
        String sql = "INSERT INTO FAVORITO_EVENTO (USUARIO_ID, EVENTO_ID) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, favorito.getUsuarioId());
            ps.setInt(2, favorito.getEventoId());
            ps.executeUpdate();
            
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    favorito.setIdFavoritoEvento(rs.getInt(1));
                }
            }
        }
        return favorito;
    }

    // Eliminar Evento Fijado
    public boolean removeFavorito(int usuarioId, int eventoId) throws SQLException {
        String sql = "DELETE FROM FAVORITO_EVENTO WHERE USUARIO_ID = ? AND EVENTO_ID = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            ps.setInt(2, eventoId);
            return ps.executeUpdate() > 0;
        }
    }

    // Obtener la lista de usuarios que fijaron un evento específico (usado para recordatorios por correo)
    public List<FavoritoEvento> findByEventoId(int eventoId) throws SQLException {
        String sql = "SELECT * FROM FAVORITO_EVENTO WHERE EVENTO_ID = ?";
        List<FavoritoEvento> favoritos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventoId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    FavoritoEvento fav = new FavoritoEvento();
                    fav.setIdFavoritoEvento(rs.getInt("ID_FAVORITO_EVENTO"));
                    fav.setUsuarioId(rs.getInt("USUARIO_ID"));
                    fav.setEventoId(rs.getInt("EVENTO_ID"));
                    fav.setFechaGuardado(rs.getTimestamp("FECHA_GUARDADO").toLocalDateTime());
                    favoritos.add(fav);
                }
            }
        }
        return favoritos;
    }

    // Obtener la lista de favoritos de un usuario específico
    public List<FavoritoEvento> findByUsuarioId(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM FAVORITO_EVENTO WHERE USUARIO_ID = ?";
        List<FavoritoEvento> favoritos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    FavoritoEvento fav = new FavoritoEvento();
                    fav.setIdFavoritoEvento(rs.getInt("ID_FAVORITO_EVENTO"));
                    fav.setUsuarioId(rs.getInt("USUARIO_ID"));
                    fav.setEventoId(rs.getInt("EVENTO_ID"));
                    fav.setFechaGuardado(rs.getTimestamp("FECHA_GUARDADO").toLocalDateTime());
                    favoritos.add(fav);
                }
            }
        }
        return favoritos;
    }
}