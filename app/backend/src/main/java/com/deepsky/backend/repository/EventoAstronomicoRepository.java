package com.deepsky.backend.repository;

import com.deepsky.backend.model.EventoAstronomico;
import com.deepsky.backend.db.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EventoAstronomicoRepository {

    // CREATE (Insertar Evento)
    public EventoAstronomico create(EventoAstronomico evento) throws SQLException {
        String sql = "INSERT INTO EVENTO_ASTRONOMICO (USUARIO_ID, TITULO, DESCRIPCION, FECHA_HORA) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setInt(1, evento.getUsuarioId());
            ps.setString(2, evento.getTitulo());
            ps.setString(3, evento.getDescripcion());
            ps.setTimestamp(4, Timestamp.valueOf(evento.getFechaHora()));
            
            ps.executeUpdate();
            
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    evento.setIdEvento(rs.getInt(1));
                }
            }
        }
        return evento;
    }

    // READ por ID (Buscar un Evento)
    public EventoAstronomico findById(int id) throws SQLException {
        String sql = "SELECT * FROM EVENTO_ASTRONOMICO WHERE ID_EVENTO = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEvento(rs);
                }
            }
        }
        return null;
    }

    // READ por fecha exacta (usado para recordatorios: eventos que ocurren "mañana")
    public List<EventoAstronomico> findByFecha(java.time.LocalDate fecha) throws SQLException {
        String sql = "SELECT * FROM EVENTO_ASTRONOMICO WHERE DATE(FECHA_HORA) = ? ORDER BY FECHA_HORA ASC";
        List<EventoAstronomico> eventos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(fecha));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    eventos.add(mapResultSetToEvento(rs));
                }
            }
        }
        return eventos;
    }

    // READ por Año y Mes (Requerido para la vista mensual del Calendario)
    public List<EventoAstronomico> findByMonth(int year, int month) throws SQLException {
        String sql = "SELECT * FROM EVENTO_ASTRONOMICO WHERE YEAR(FECHA_HORA) = ? AND MONTH(FECHA_HORA) = ? ORDER BY FECHA_HORA ASC";
        List<EventoAstronomico> eventos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, year);
            ps.setInt(2, month);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    eventos.add(mapResultSetToEvento(rs));
                }
            }
        }
        return eventos;
    }

    // UPDATE (Modificar Evento)
    public boolean update(EventoAstronomico evento) throws SQLException {
        String sql = "UPDATE EVENTO_ASTRONOMICO SET TITULO = ?, DESCRIPCION = ?, FECHA_HORA = ? WHERE ID_EVENTO = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, evento.getTitulo());
            ps.setString(2, evento.getDescripcion());
            ps.setTimestamp(3, Timestamp.valueOf(evento.getFechaHora()));
            ps.setInt(4, evento.getIdEvento());
            return ps.executeUpdate() > 0;
        }
    }

    // DELETE (Eliminar Evento)
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM EVENTO_ASTRONOMICO WHERE ID_EVENTO = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // Mapeador helper de la entidad
    private EventoAstronomico mapResultSetToEvento(ResultSet rs) throws SQLException {
        EventoAstronomico evento = new EventoAstronomico();
        evento.setIdEvento(rs.getInt("ID_EVENTO"));
        evento.setUsuarioId(rs.getInt("USUARIO_ID"));
        evento.setTitulo(rs.getString("TITULO"));
        evento.setDescripcion(rs.getString("DESCRIPCION"));
        evento.setFechaHora(rs.getTimestamp("FECHA_HORA").toLocalDateTime());
        return evento;
    }
}