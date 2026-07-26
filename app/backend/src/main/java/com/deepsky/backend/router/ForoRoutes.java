package com.deepsky.backend.router;

import com.deepsky.backend.controller.ForoController;

import io.javalin.Javalin;

public class ForoRoutes {
    private final ForoController controller;

    public ForoRoutes(ForoController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        app.get("/api/foro", controller::listarHilos);
        app.post("/api/foro", controller::crearHilo);                       // Crear Hilo (Divulgador)
        app.post("/api/foro/{id}/comentarios", controller::comentarHilo);   // Comentar Hilo (Divulgador / Usuario)
        app.get("/api/foro/{id}/comentarios", controller::obtenerComentarios);
        app.delete("/api/foro/{foroId}/comentarios/{id}", controller::eliminarComentario);
        app.delete("/api/foro/{id}", controller::eliminarHilo);
    }
}