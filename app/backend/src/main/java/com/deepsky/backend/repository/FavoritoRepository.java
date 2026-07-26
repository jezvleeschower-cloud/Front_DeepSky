package com.deepsky.backend.repository;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.dto.response.ImagenResponse;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class FavoritoRepository {

    /**
     * Busca el ID interno (IMAGEN_NASA.ID_IMAGEN) a partir del nasa_id
     * devuelto por la NASA Image Library.
     */
    public Optional<Integer> findImagenIdByNasaId(String nasaId) throws SQLException {
        String sql = "SELECT ID_IMAGEN FROM IMAGEN_NASA WHERE NASA_ID = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, nasaId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(resultSet.getInt("ID_IMAGEN"));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Inserta la imagen en el caché IMAGEN_NASA y devuelve el ID generado.
     */
    public int insertarImagen(ImagenResponse imagen) throws SQLException {
        String sql = "INSERT INTO IMAGEN_NASA (NASA_ID, URL_IMAGEN, TITULO, DESCRIPCION, FECHA_CREACION, KEYWORDS) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, imagen.getNasaId());
            statement.setString(2, imagen.getUrl());
            statement.setString(3, imagen.getTitle());
            statement.setString(4, imagen.getDescription());
            statement.setString(5, extraerFecha(imagen.getDateCreated()));
            statement.setString(6, imagen.getKeywords() == null ? null : String.join(",", imagen.getKeywords()));
            statement.executeUpdate();

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1);
                }
            }
        }
        throw new SQLException("No fue posible obtener el ID generado para la imagen " + imagen.getNasaId());
    }

    /**
     * Devuelve el ID interno de la imagen, insertándola en el caché
     * IMAGEN_NASA si todavía no existía.
     */
    public int obtenerOcrearImagen(ImagenResponse imagen) throws SQLException {
        return findImagenIdByNasaId(imagen.getNasaId())
                .orElseGet(() -> {
                    try {
                        return insertarImagen(imagen);
                    } catch (SQLException exception) {
                        throw new RuntimeException(exception);
                    }
                });
    }

    public boolean existeFavorito(int usuarioId, int imagenId) throws SQLException {
        String sql = "SELECT 1 FROM FAVORITO_IMAGEN WHERE USUARIO_ID = ? AND IMAGEN_ID = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, usuarioId);
            statement.setInt(2, imagenId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next();
            }
        }
    }

    public void agregarFavorito(int usuarioId, int imagenId) throws SQLException {
        String sql = "INSERT INTO FAVORITO_IMAGEN (USUARIO_ID, IMAGEN_ID) VALUES (?, ?)";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, usuarioId);
            statement.setInt(2, imagenId);
            statement.executeUpdate();
        }
    }

    public void eliminarFavorito(int usuarioId, int imagenId) throws SQLException {
        String sql = "DELETE FROM FAVORITO_IMAGEN WHERE USUARIO_ID = ? AND IMAGEN_ID = ?";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, usuarioId);
            statement.setInt(2, imagenId);
            statement.executeUpdate();
        }
    }

    /**
     * Lista los favoritos de un usuario, trayendo los datos de la imagen
     * desde el caché IMAGEN_NASA.
     */
    public List<ImagenResponse> listarFavoritosPorUsuario(int usuarioId) throws SQLException {
        String sql = "SELECT n.NASA_ID, n.URL_IMAGEN, n.TITULO, n.DESCRIPCION, n.FECHA_CREACION, n.KEYWORDS " +
                "FROM FAVORITO_IMAGEN f " +
                "JOIN IMAGEN_NASA n ON n.ID_IMAGEN = f.IMAGEN_ID " +
                "WHERE f.USUARIO_ID = ? " +
                "ORDER BY f.FECHA_GUARDADO DESC";

        List<ImagenResponse> resultados = new ArrayList<>();
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, usuarioId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    ImagenResponse imagen = new ImagenResponse();
                    imagen.setNasaId(resultSet.getString("NASA_ID"));
                    imagen.setUrl(resultSet.getString("URL_IMAGEN"));
                    imagen.setTitle(resultSet.getString("TITULO"));
                    imagen.setDescription(resultSet.getString("DESCRIPCION"));
                    imagen.setDateCreated(resultSet.getString("FECHA_CREACION"));
                    imagen.setMediaType("image");
                    String keywords = resultSet.getString("KEYWORDS");
                    imagen.setKeywords(keywords == null || keywords.isBlank()
                            ? List.of()
                            : List.of(keywords.split(",")));
                    resultados.add(imagen);
                }
            }
        }
        return resultados;
    }

    private String extraerFecha(String dateCreated) {
        if (dateCreated == null || dateCreated.isBlank()) {
            return null;
        }
        // La NASA Image API devuelve algo como "2016-07-01T00:00:00Z";
        // IMAGEN_NASA.FECHA_CREACION es tipo DATE, así que nos quedamos
        // solo con la parte de la fecha.
        return dateCreated.length() >= 10 ? dateCreated.substring(0, 10) : dateCreated;
    }
}