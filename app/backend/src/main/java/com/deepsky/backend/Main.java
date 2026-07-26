package com.deepsky.backend;

import com.deepsky.backend.config.AppConfig;
import com.deepsky.backend.config.JavalinConfig;

import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        // 1. Carga centralizada de las propiedades (puerto, db, etc.)
        AppConfig.load();

        // 2. Creamos la app de Javalin con TODOS los módulos ya inyectados
        Javalin app = JavalinConfig.createApp();
        
        // 3. Ruta de salud por defecto para comprobar que responda el servidor
        app.get("/api/health", context -> context.json(java.util.Map.of("status", "ok")));

        // 4. Puerto: se respeta "PORT" (usada en tu systemd de EC2) si existe,
        //    si no, cae a "server.port" / SERVER_PORT / application.properties.
        String portEnv = System.getenv("PORT");
        int port = Integer.parseInt(portEnv != null && !portEnv.isBlank() ? portEnv : AppConfig.get("server.port", "7001"));
        app.start(port);

        System.out.println("Servidor DeepSky correctamente iniciado en http://localhost:" + port);
    }
}