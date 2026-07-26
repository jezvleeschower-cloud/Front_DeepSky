package com.deepsky.backend.controller;

import com.deepsky.backend.service.AsteroideService;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class AsteroideController {
    private final AsteroideService asteroideService;

    public AsteroideController(AsteroideService asteroideService) {
        this.asteroideService = asteroideService;
    }

    public void listarAsteroides(Context ctx) {
        ctx.status(HttpStatus.OK);
        ctx.json(asteroideService.obtenerAsteroides());
    }
}