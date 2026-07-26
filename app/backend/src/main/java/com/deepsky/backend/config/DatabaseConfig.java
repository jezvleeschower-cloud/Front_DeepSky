package com.deepsky.backend.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    private DatabaseConfig() {
    }

    public static Connection getConnection() throws SQLException {
        String url = AppConfig.get("db.url", "jdbc:mysql://localhost:3306/deepsky_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        String user = AppConfig.get("db.user", "root");
        String password = AppConfig.get("db.password", "");
        return DriverManager.getConnection(url, user, password);
    }
}
