package com.deepsky.backend.router;

import com.deepsky.backend.controller.FavoritoController;
import io.javalin.Javalin;

public class FavoritoRoutes {
    private final FavoritoController favoritoController;

    public FavoritoRoutes(FavoritoController favoritoController) {
        this.favoritoController = favoritoController;
    }

    public void register(Javalin app) {
        app.post("/api/favoritos", favoritoController::agregar);
        app.get("/api/favoritos", favoritoController::listar);
        app.delete("/api/favoritos/{nasaId}", favoritoController::eliminar);
    }
}