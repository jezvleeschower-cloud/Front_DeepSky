package com.deepsky.backend.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import com.deepsky.backend.config.AppConfig;

public class DatabaseConnection {

    public static Connection getConnection() throws SQLException {
        // Consumimos las propiedades desde AppConfig, que ya fue inicializado con éxito
        String url = AppConfig.get("db.url");
        String user = AppConfig.get("db.user");
        String password = AppConfig.get("db.password");

        if (url == null || user == null) {
            throw new SQLException("Las credenciales de la base de datos no se pudieron obtener de AppConfig.");
        }

        return DriverManager.getConnection(url, user, password);
    }
}