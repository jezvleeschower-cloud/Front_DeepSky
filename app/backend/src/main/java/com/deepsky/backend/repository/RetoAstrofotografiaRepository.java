package com.deepsky.backend.repository;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.dto.response.RetoAstrofotografiaResponse;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RetoAstrofotografiaRepository {

    public int crear(int usuarioId, String titulo, String descripcion, String fechaLimite, String urlImagen) throws SQLException {
        String sql = "INSERT INTO RETO_ASTROFOTOGRAFIA (USUARIO_ID, TITULO, DESCRIPCION, FECHA_LIMITE, URL_IMAGEN) " +
                "VALUES (?, ?, ?, ?, ?)";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setInt(1, usuarioId);
            statement.setString(2, titulo);
            statement.setString(3, descripcion);
            statement.setString(4, fechaLimite);
            statement.setString(5, urlImagen);
            statement.executeUpdate();

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1);
                }
            }
        }
        throw new SQLException("No fue posible obtener el ID generado para el reto");
    }

    public List<RetoAstrofotografiaResponse> listarTodos() throws SQLException {
        String sql = "SELECT r.ID_RETO, r.USUARIO_ID, u.NOMBRE AS CREADOR, r.TITULO, r.DESCRIPCION, " +
                "r.FECHA_LIMITE, r.FECHA_CREACION, r.FINALIZADO, r.FECHA_FINALIZACION, r.URL_IMAGEN " +
                "FROM RETO_ASTROFOTOGRAFIA r " +
                "JOIN USUARIO u ON u.ID_USUARIO = r.USUARIO_ID " +
                "ORDER BY r.FECHA_CREACION DESC";

        List<RetoAstrofotografiaResponse> resultados = new ArrayList<>();
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                resultados.add(mapRow(resultSet));
            }
        }
        return resultados;
    }

    public Optional<RetoAstrofotografiaResponse> obtenerPorId(int idReto) throws SQLException {
        String sql = "SELECT r.ID_RETO, r.USUARIO_ID, u.NOMBRE AS CREADOR, r.TITULO, r.DESCRIPCION, " +
                "r.FECHA_LIMITE, r.FECHA_CREACION, r.FINALIZADO, r.FECHA_FINALIZACION, r.URL_IMAGEN " +
                "FROM RETO_ASTROFOTOGRAFIA r " +
                "JOIN USUARIO u ON u.ID_USUARIO = r.USUARIO_ID " +
                "WHERE r.ID_RETO = ?";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idReto);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapRow(resultSet));
                }
            }
        }
        return Optional.empty();
    }

    public boolean existeReto(int idReto) throws SQLException {
        String sql = "SELECT 1 FROM RETO_ASTROFOTOGRAFIA WHERE ID_RETO = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idReto);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next();
            }
        }
    }

    public boolean finalizar(int idReto, int usuarioId) throws SQLException {
        String sql = "UPDATE RETO_ASTROFOTOGRAFIA SET FINALIZADO = 1, FECHA_FINALIZACION = NOW() " +
                     "WHERE ID_RETO = ? AND USUARIO_ID = ?";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idReto);
            statement.setInt(2, usuarioId);
            return statement.executeUpdate() > 0;
        }
    }

    public boolean eliminarReto(int idReto) throws SQLException {
        String sqlParticipaciones = "DELETE FROM PARTICIPACION_RETO WHERE RETO_ID = ?";
        String sqlReto = "DELETE FROM RETO_ASTROFOTOGRAFIA WHERE ID_RETO = ?";
        try (Connection connection = DatabaseConfig.getConnection()) {
            try (PreparedStatement stmt = connection.prepareStatement(sqlParticipaciones)) {
                stmt.setInt(1, idReto);
                stmt.executeUpdate();
            }
            try (PreparedStatement stmt = connection.prepareStatement(sqlReto)) {
                stmt.setInt(1, idReto);
                return stmt.executeUpdate() > 0;
            }
        }
    }

    private RetoAstrofotografiaResponse mapRow(ResultSet resultSet) throws SQLException {
        RetoAstrofotografiaResponse reto = new RetoAstrofotografiaResponse();
        reto.setId(resultSet.getInt("ID_RETO"));
        reto.setUsuarioId(resultSet.getInt("USUARIO_ID"));
        reto.setCreador(resultSet.getString("CREADOR"));
        reto.setTitulo(resultSet.getString("TITULO"));
        reto.setDescripcion(resultSet.getString("DESCRIPCION"));
        reto.setFechaLimite(resultSet.getString("FECHA_LIMITE"));
        Timestamp fechaCreacion = resultSet.getTimestamp("FECHA_CREACION");
        reto.setFechaCreacion(fechaCreacion == null ? null : fechaCreacion.toString());
        reto.setFinalizado(resultSet.getBoolean("FINALIZADO"));
        Timestamp fechaFin = resultSet.getTimestamp("FECHA_FINALIZACION");
        reto.setFechaFinalizacion(fechaFin == null ? null : fechaFin.toString());
        reto.setUrlImagen(resultSet.getString("URL_IMAGEN"));
        return reto;
    }
}