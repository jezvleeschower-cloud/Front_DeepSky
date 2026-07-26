package com.deepsky.backend.router;

import com.deepsky.backend.controller.AsteroideController;

import io.javalin.Javalin;

public class AsteroideRoutes {
    private final AsteroideController controller;

    public AsteroideRoutes(AsteroideController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        app.get("/api/asteroides", controller::listarAsteroides);
    }
}