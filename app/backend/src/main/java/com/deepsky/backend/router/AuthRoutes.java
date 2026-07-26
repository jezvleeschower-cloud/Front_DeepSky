package com.deepsky.backend.router;

import com.deepsky.backend.controller.AuthController;

import io.javalin.Javalin;

public class AuthRoutes {
    private final AuthController controller;

    public AuthRoutes(AuthController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        app.post("/api/auth/register", controller::register);
        app.post("/api/auth/login", controller::login);
        app.post("/api/auth/login-direct", controller::loginDirect);
        app.post("/api/auth/register-direct", controller::registerDirect);
        app.get("/api/auth/me", controller::me);
        app.post("/api/auth/verify", controller::verifyCode);
        app.post("/api/auth/forgot-password", controller::forgotPassword);
        app.post("/api/auth/reset-password", controller::resetPassword);
    }
}