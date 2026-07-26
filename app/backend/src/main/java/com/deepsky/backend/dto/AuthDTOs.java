package com.deepsky.backend.dto;

public class AuthDTOs {

    public static class RegisterRequest {
        public String nombre;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class VerifyCodeRequest {
        public String email;
        public String codigo;
    }

    public static class ForgotPasswordRequest {
        public String email;
    }

    public static class ResetPasswordRequest {
        public String email;
        public String codigo;
        public String nuevaPassword;
    }

    public static class AuthResponse {
        public String token;
        public String email;
        public String nombre;
        public String rol;
        public String mensaje;

        public AuthResponse(String token, String email, String nombre, String rol, String mensaje) {
            this.token = token;
            this.email = email;
            this.nombre = nombre;
            this.rol = rol;
            this.mensaje = mensaje;
        }
    }
}