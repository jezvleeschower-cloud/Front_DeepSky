package com.deepsky.backend.router;

import com.deepsky.backend.controller.FotoDelDiaController;
import io.javalin.Javalin;

public class FotoDelDiaRoutes {
    private final FotoDelDiaController fotoDelDiaController;

    public FotoDelDiaRoutes(FotoDelDiaController fotoDelDiaController) {
        this.fotoDelDiaController = fotoDelDiaController;
    }

    public void register(Javalin app) {
        app.get("/api/foto-del-dia", context -> {
            if (context.queryParam("fecha") != null) {
                fotoDelDiaController.obtenerPorFecha(context);
            } else {
                fotoDelDiaController.obtenerActual(context);
            }
        });
    }
}