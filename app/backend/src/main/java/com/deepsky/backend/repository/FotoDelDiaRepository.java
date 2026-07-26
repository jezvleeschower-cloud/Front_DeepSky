package com.deepsky.backend.repository;

import com.deepsky.backend.config.DatabaseConfig;
import com.deepsky.backend.model.FotoDelDia;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class FotoDelDiaRepository {

    // 1. Método para buscar por fecha específica
    public Optional<FotoDelDia> findByFecha(String fecha) throws SQLException {
        String sql = "SELECT ID_IMAGEN_DIA, URL_IMAGEN, TITULO, DESCRIPCION, FECHA_PUBLICACION FROM IMAGEN_DIA WHERE FECHA_PUBLICACION = ? LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, fecha);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    FotoDelDia fotoDelDia = new FotoDelDia();
                    fotoDelDia.setUrlImagen(resultSet.getString("URL_IMAGEN"));
                    fotoDelDia.setTitulo(resultSet.getString("TITULO"));
                    fotoDelDia.setDescripcion(resultSet.getString("DESCRIPCION"));
                    fotoDelDia.setFecha(resultSet.getString("FECHA_PUBLICACION"));
                    return Optional.of(fotoDelDia);
                }
            }
        }
        return Optional.empty();
    }

    // 2. Método para buscar el más reciente
    public Optional<FotoDelDia> findLatest() throws SQLException {
        String sql = "SELECT ID_IMAGEN_DIA, URL_IMAGEN, TITULO, DESCRIPCION, FECHA_PUBLICACION FROM IMAGEN_DIA ORDER BY ID_IMAGEN_DIA DESC LIMIT 1";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            if (resultSet.next()) {
                FotoDelDia fotoDelDia = new FotoDelDia();
                fotoDelDia.setUrlImagen(resultSet.getString("URL_IMAGEN"));
                fotoDelDia.setTitulo(resultSet.getString("TITULO"));
                fotoDelDia.setDescripcion(resultSet.getString("DESCRIPCION"));
                fotoDelDia.setFecha(resultSet.getString("FECHA_PUBLICACION"));
                return Optional.of(fotoDelDia);
            }
        }
        return Optional.empty();
    }

    // 3. ¡ESTE ERA EL QUE FALTABA! El método save que estaba en rojo
    public void save(FotoDelDia fotoDelDia) throws SQLException {
    String insertSql = "INSERT INTO IMAGEN_DIA (URL_IMAGEN, TITULO, DESCRIPCION, FECHA_PUBLICACION) VALUES (?, ?, ?, ?)";
    
    // Fíjate en los paréntesis del try
    try (Connection connection = DatabaseConfig.getConnection();
         PreparedStatement statement = connection.prepareStatement(insertSql)) {
        
        statement.setString(1, fotoDelDia.getUrlImagen());
        statement.setString(2, fotoDelDia.getTitulo());
        statement.setString(3, fotoDelDia.getDescripcion());
        statement.setString(4, fotoDelDia.getFecha());
        
        statement.executeUpdate(); // <-- AQUÍ NO VA PUNTO Y COMA EXTRA, solo el de la sentencia
    } 
    }
    public Optional<Integer> findIdByFecha(String fecha) throws SQLException {
    String sql = "SELECT ID_IMAGEN_DIA FROM IMAGEN_DIA WHERE FECHA_PUBLICACION = ? LIMIT 1";
    try (Connection conn = DatabaseConfig.getConnection(); 
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        
        stmt.setString(1, fecha);
        try (ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return Optional.of(rs.getInt("ID_IMAGEN_DIA"));
            }
        }
    }
    return Optional.empty();

}
}