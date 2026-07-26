package com.deepsky.backend.controller;

import java.util.HashMap;
import java.util.Map;

import com.deepsky.backend.dto.AuthDTOs.AuthResponse;
import com.deepsky.backend.dto.AuthDTOs.ForgotPasswordRequest;
import com.deepsky.backend.dto.AuthDTOs.LoginRequest;
import com.deepsky.backend.dto.AuthDTOs.RegisterRequest;
import com.deepsky.backend.dto.AuthDTOs.ResetPasswordRequest;
import com.deepsky.backend.dto.AuthDTOs.VerifyCodeRequest;
import com.deepsky.backend.service.AuthService;
import com.deepsky.backend.security.JwtService;

import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    public void me(Context ctx) {
        String authHeader = ctx.header("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "No autorizado"));
            return;
        }
        String token = authHeader.substring(7);
        if (!jwtService.esTokenValido(token)) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", "Token inválido o expirado"));
            return;
        }
        try {
            int id = jwtService.obtenerUsuarioIdDesdeToken(token);
            var claims = jwtService.obtenerClaims(token);
            String email = (String) claims.get("email");
            String rol = (String) claims.get("rol");
            String nombre = authService.buscarPorEmail(email)
                    .map(u -> u.getNombre())
                    .orElse(null);
            Map<String, Object> body = new HashMap<>();
            body.put("id", id);
            body.put("email", email);
            body.put("rol", rol);
            body.put("nombre", nombre);
            ctx.status(HttpStatus.OK).json(body);
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No fue posible leer el token"));
        }
    }

    public void register(Context ctx) {
        try {
            RegisterRequest req = ctx.bodyAsClass(RegisterRequest.class);
            authService.registrar(req);
            ctx.status(HttpStatus.CREATED);
            ctx.json(Map.of("mensaje", "Cuenta creada. Código de 6 dígitos enviado a tu correo."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo completar el registro. Intenta de nuevo."));
        }
    }

    public void login(Context ctx) {
        try {
            LoginRequest req = ctx.bodyAsClass(LoginRequest.class);
            authService.solicitarLogin(req);
            ctx.status(HttpStatus.OK);
            ctx.json(Map.of("mensaje", "Código de 6 dígitos enviado a tu correo."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo iniciar sesión. Intenta de nuevo."));
        }
    }

    public void loginDirect(Context ctx) {
        try {
            LoginRequest req = ctx.bodyAsClass(LoginRequest.class);
            AuthResponse res = authService.loginDirect(req);
            ctx.status(HttpStatus.OK);
            ctx.json(res);
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo iniciar sesión. Intenta de nuevo."));
        }
    }

    public void verifyCode(Context ctx) {
        try {
            VerifyCodeRequest req = ctx.bodyAsClass(VerifyCodeRequest.class);
            AuthResponse res = authService.verificarCodigoYLogin(req);
            ctx.status(HttpStatus.OK);
            ctx.json(res);
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo verificar el código. Intenta de nuevo."));
        }
    }

    public void registerDirect(Context ctx) {
        try {
            RegisterRequest req = ctx.bodyAsClass(RegisterRequest.class);
            AuthResponse res = authService.registrarYLogin(req);
            ctx.status(HttpStatus.CREATED);
            ctx.json(res);
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo completar el registro. Intenta de nuevo."));
        }
    }

    public void forgotPassword(Context ctx) {
        try {
            ForgotPasswordRequest req = ctx.bodyAsClass(ForgotPasswordRequest.class);
            authService.solicitarRecuperacion(req);
            ctx.status(HttpStatus.OK);
            ctx.json(Map.of("mensaje", "Código de 6 dígitos enviado a tu correo."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo procesar la recuperación de contraseña."));
        }
    }

    public void resetPassword(Context ctx) {
        try {
            ResetPasswordRequest req = ctx.bodyAsClass(ResetPasswordRequest.class);
            authService.restablecerPassword(req);
            ctx.status(HttpStatus.OK);
            ctx.json(Map.of("mensaje", "Contraseña actualizada correctamente."));
        } catch (IllegalArgumentException e) {
            ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("message", "No se pudo actualizar la contraseña. Intenta de nuevo."));
        }
    }
}