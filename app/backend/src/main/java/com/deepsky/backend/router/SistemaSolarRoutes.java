package com.deepsky.backend.router;

import com.deepsky.backend.controller.SistemaSolarController;

import io.javalin.Javalin;

public class SistemaSolarRoutes {
    private final SistemaSolarController controller;

    public SistemaSolarRoutes(SistemaSolarController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        // Rutas de Planetas
        app.get("/api/sistema-solar", controller::listarPlanetas);
        app.get("/api/sistema-solar/{id}", controller::obtenerPlaneta);

        // Rutas de Curiosidades
        app.get("/api/sistema-solar/{id}/curiosidades", controller::obtenerCuriosidades); // Lectura pública
        app.post("/api/sistema-solar/{id}/curiosidades", controller::agregarCuriosidad); // Escritura (cualquier usuario autenticado)
        app.delete("/api/sistema-solar/curiosidades/{idDato}", controller::eliminarCuriosidad); // Eliminación (solo DIVULGADOR)
    }
}