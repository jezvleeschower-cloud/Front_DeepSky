package com.deepsky.backend.router;

import com.deepsky.backend.controller.ImagenController;
import io.javalin.Javalin;

public class ImagenRoutes {
    private final ImagenController imagenController;

    public ImagenRoutes(ImagenController imagenController) {
        this.imagenController = imagenController;
    }

    public void register(Javalin app) {
        app.get("/api/imagenes/search", imagenController::buscar);
        app.get("/api/imagenes/{id}", imagenController::obtenerPorId);
    }
}