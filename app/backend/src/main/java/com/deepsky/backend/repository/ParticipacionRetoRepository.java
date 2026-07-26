package com.deepsky.backend.repository;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.dto.response.ParticipacionRetoResponse;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class ParticipacionRetoRepository {

    public int crear(int retoId, int usuarioId, String titulo,
                     String urlImagen, String cloudinaryPublicId) throws SQLException {

        String sql = "INSERT INTO PARTICIPACION_RETO "
                + "(RETO_ID, USUARIO_ID, TITULO, URL_IMAGEN, CLOUDINARY_PUBLIC_ID) "
                + "VALUES (?, ?, ?, ?, ?)";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement =
                     connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            statement.setInt(1, retoId);
            statement.setInt(2, usuarioId);
            statement.setString(3, titulo);
            statement.setString(4, urlImagen);
            statement.setString(5, cloudinaryPublicId);
            statement.executeUpdate();

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1);
                }
            }
        }
        throw new SQLException("No fue posible obtener el ID generado para la participación");
    }

    public List<ParticipacionRetoResponse> listarPorReto(int retoId) throws SQLException {
        String sql = "SELECT p.ID_PARTICIPACION, p.RETO_ID, p.USUARIO_ID, "
                + "u.NOMBRE AS AUTOR, p.TITULO, p.URL_IMAGEN, p.LIKES, p.FECHA_SUBIDA "
                + "FROM PARTICIPACION_RETO p "
                + "JOIN USUARIO u ON u.ID_USUARIO = p.USUARIO_ID "
                + "WHERE p.RETO_ID = ? "
                + "ORDER BY p.LIKES DESC, p.FECHA_SUBIDA DESC";

        List<ParticipacionRetoResponse> resultados = new ArrayList<>();
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, retoId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    resultados.add(mapRow(resultSet));
                }
            }
        }
        return resultados;
    }

    /**
     * Toggle like: si el usuario ya votó, quita el like; si no, lo agrega.
     * @return true si quedó con like, false si se quitó el like
     */
    public boolean toggleLike(int idParticipacion, int usuarioId) throws SQLException {
        if (!existeParticipacion(idParticipacion)) {
            throw new IllegalArgumentException("La participación solicitada no existe");
        }

        if (yaVotoCheck(idParticipacion, usuarioId)) {
            // Ya votó → quitar like
            String sqlDelete = "DELETE FROM VOTO_RETO WHERE PARTICIPACION_ID = ? AND USUARIO_ID = ?";
            try (Connection connection = DatabaseConfig.getConnection();
                 PreparedStatement statement = connection.prepareStatement(sqlDelete)) {
                statement.setInt(1, idParticipacion);
                statement.setInt(2, usuarioId);
                statement.executeUpdate();
            }
            String sqlUpdate = "UPDATE PARTICIPACION_RETO SET LIKES = GREATEST(LIKES - 1, 0) WHERE ID_PARTICIPACION = ?";
            try (Connection connection = DatabaseConfig.getConnection();
                 PreparedStatement statement = connection.prepareStatement(sqlUpdate)) {
                statement.setInt(1, idParticipacion);
                statement.executeUpdate();
            }
            return false; // liked = false
        } else {
            // No había votado → dar like
            registrarVoto(idParticipacion, usuarioId);
            String sqlUpdate = "UPDATE PARTICIPACION_RETO SET LIKES = LIKES + 1 WHERE ID_PARTICIPACION = ?";
            try (Connection connection = DatabaseConfig.getConnection();
                 PreparedStatement statement = connection.prepareStatement(sqlUpdate)) {
                statement.setInt(1, idParticipacion);
                statement.executeUpdate();
            }
            return true; // liked = true
        }
    }

    public boolean deleteById(int idParticipacion) throws SQLException {
        String sql = "DELETE FROM PARTICIPACION_RETO WHERE ID_PARTICIPACION = ?";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idParticipacion);
            return statement.executeUpdate() > 0;
        }
    }

    // ---------------------------------------------------------------
    // Helpers privados
    // ---------------------------------------------------------------

    private boolean existeParticipacion(int idParticipacion) throws SQLException {
        String sql = "SELECT 1 FROM PARTICIPACION_RETO WHERE ID_PARTICIPACION = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idParticipacion);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    private boolean yaVotoCheck(int idParticipacion, int usuarioId) throws SQLException {
        String sql = "SELECT 1 FROM VOTO_RETO "
                + "WHERE PARTICIPACION_ID = ? AND USUARIO_ID = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idParticipacion);
            statement.setInt(2, usuarioId);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    private void registrarVoto(int idParticipacion, int usuarioId) throws SQLException {
        String sql = "INSERT IGNORE INTO VOTO_RETO (PARTICIPACION_ID, USUARIO_ID, PUNTUACION) "
                + "VALUES (?, ?, 1)";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idParticipacion);
            statement.setInt(2, usuarioId);
            statement.executeUpdate();
        }
    }

    private ParticipacionRetoResponse mapRow(ResultSet resultSet) throws SQLException {
        ParticipacionRetoResponse participacion = new ParticipacionRetoResponse();
        participacion.setId(resultSet.getInt("ID_PARTICIPACION"));
        participacion.setRetoId(resultSet.getInt("RETO_ID"));
        participacion.setUsuarioId(resultSet.getInt("USUARIO_ID"));
        participacion.setAutor(resultSet.getString("AUTOR"));
        participacion.setTitulo(resultSet.getString("TITULO"));
        participacion.setUrlImagen(resultSet.getString("URL_IMAGEN"));
        participacion.setLikes(resultSet.getInt("LIKES"));
        Timestamp fechaSubida = resultSet.getTimestamp("FECHA_SUBIDA");
        participacion.setFechaSubida(fechaSubida == null ? null : fechaSubida.toString());
        return participacion;
    }

}