package com.deepsky.backend.router;

import com.deepsky.backend.controller.RetoAstrofotografiaController;
import io.javalin.Javalin;

public class RetoAstrofotografiaRoutes {
    private final RetoAstrofotografiaController retoController;

    public RetoAstrofotografiaRoutes(RetoAstrofotografiaController retoController) {
        this.retoController = retoController;
    }

    public void register(Javalin app) {
        app.post("/api/retos", retoController::crear);
        app.get("/api/retos", retoController::listar);
        app.get("/api/retos/{id}", retoController::obtener);
        app.put("/api/retos/{id}/finalizar", retoController::finalizar);
        app.delete("/api/retos/{id}", retoController::eliminarReto);
        app.post("/api/retos/{id}/participaciones", retoController::participar);
        app.get("/api/retos/{id}/participaciones", retoController::listarParticipaciones);
        app.post("/api/participaciones/{participacionId}/like", retoController::darLike);
        app.delete("/api/retos/{id}/participaciones/{participacionId}", retoController::eliminarParticipacion);
    }
}