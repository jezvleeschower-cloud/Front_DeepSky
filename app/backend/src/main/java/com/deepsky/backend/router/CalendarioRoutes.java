package com.deepsky.backend.router;

import com.deepsky.backend.controller.CalendarioController;

import io.javalin.Javalin;

public class CalendarioRoutes {
    private final CalendarioController calendarioController;

    public CalendarioRoutes(CalendarioController calendarioController) {
        this.calendarioController = calendarioController;
    }

    public void register(Javalin app) {
        // Rutas Públicas / Generales
        app.get("/api/calendario/test", calendarioController::test);
        app.get("/api/calendario/eventos", calendarioController::getEventosPorMes);
        app.post("/api/calendario/eventos", calendarioController::crearEvento);

        // Rutas Protegidas (Requieren Token de Usuario Registrado)
        app.put("/api/calendario/eventos/{id}", calendarioController::actualizarEvento);
        app.delete("/api/calendario/eventos/{id}", calendarioController::eliminarEvento);
        app.post("/api/calendario/eventos/{id}/favorito", calendarioController::fijarFavorito);
        app.delete("/api/calendario/eventos/{id}/favorito", calendarioController::desfijarFavorito);
    }
}