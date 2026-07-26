package com.deepsky.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class AppConfig {
    private static final Properties PROPERTIES = new Properties();

    private AppConfig() {
    }

    public static void load() {
        try (InputStream inputStream = AppConfig.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (inputStream != null) {
                PROPERTIES.load(inputStream);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("No fue posible cargar la configuración de la aplicación", exception);
        }
    }

    public static String get(String key) {
        // En producción, las variables de entorno tienen prioridad sobre application.properties.
        // Esto permite inyectar credenciales reales (SMTP, DB, etc.) desde el hosting sin
        // tener que escribirlas en un archivo versionado en el repositorio.
        // Ej: "mail.smtp.password" -> variable de entorno "MAIL_SMTP_PASSWORD"
        String envKey = key.toUpperCase().replace('.', '_');
        String valorEnv = System.getenv(envKey);
        if (valorEnv != null && !valorEnv.isBlank()) {
            return valorEnv;
        }
        return PROPERTIES.getProperty(key);
    }

    public static String get(String key, String defaultValue) {
        String valor = get(key);
        return (valor != null && !valor.isBlank()) ? valor : defaultValue;
    }
}
