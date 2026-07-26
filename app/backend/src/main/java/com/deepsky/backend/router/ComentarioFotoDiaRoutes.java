package com.deepsky.backend.router;

import com.deepsky.backend.controller.ComentarioFotoDiaController;
import io.javalin.Javalin;

public class ComentarioFotoDiaRoutes {
    private final ComentarioFotoDiaController controller;

    public ComentarioFotoDiaRoutes(ComentarioFotoDiaController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        // Nota: se usa un prefijo distinto a "/api/foto-del-dia/{fecha}" para evitar que
        // Javalin interprete "comentarios" como si fuera el parámetro {fecha}.
        app.post("/api/comentarios/foto-del-dia", controller::publicar);
        app.get("/api/comentarios/foto-del-dia", controller::obtenerPorFecha);
        app.delete("/api/comentarios/foto-del-dia/{id}", controller::eliminar);
    }
}