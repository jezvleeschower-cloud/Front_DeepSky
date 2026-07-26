package com.deepsky.backend.service;

import com.deepsky.backend.dto.AuthDTOs.RegisterRequest;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class VerificationCodeService {
    // Almacena en memoria email -> código de 6 dígitos
    private final Map<String, String> codigosEnMemoria = new ConcurrentHashMap<>();
    // Almacena datos de registro pendiente de verificación email -> RegisterRequest
    private final Map<String, RegisterRequest> registrosPendientes = new ConcurrentHashMap<>();

    private final SecureRandom random = new SecureRandom();
    private final EmailService emailService;

    public VerificationCodeService(EmailService emailService) {
        this.emailService = emailService;
    }

    public String generarYGuardarCodigo(String email) {
        return generarYGuardarCodigo(email, "Usa este código para verificar tu identidad en DeepSky:");
    }

    public String generarYGuardarCodigo(String email, String motivo) {
        int numero = 100000 + random.nextInt(900000);
        String codigo = String.valueOf(numero);
        codigosEnMemoria.put(email.toLowerCase(), codigo);

        System.out.println("==================================================");
        System.out.println("📧 [EMAIL SERVICE] Código generado para: " + email);
        System.out.println("🔑 Código de verificación de 6 dígitos: " + codigo);
        System.out.println("==================================================");

        emailService.enviarCodigoVerificacion(email, codigo, motivo);

        return codigo;
    }

    public boolean validarCodigo(String email, String codigo) {
        if (email == null || codigo == null) return false;
        String codigoGuardado = codigosEnMemoria.get(email.toLowerCase());

        if (codigoGuardado != null && codigoGuardado.equals(codigo.trim())) {
            codigosEnMemoria.remove(email.toLowerCase());
            return true;
        }
        return false;
    }

    // Guardar datos de registro pendiente
    public void guardarRegistroPendiente(String email, RegisterRequest req) {
        registrosPendientes.put(email.toLowerCase(), req);
    }

    // Obtener y consumir registro pendiente
    public RegisterRequest obtenerYEliminarRegistroPendiente(String email) {
        return registrosPendientes.remove(email.toLowerCase());
    }

    public boolean tieneRegistroPendiente(String email) {
        return registrosPendientes.containsKey(email.toLowerCase());
    }
}