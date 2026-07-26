package com.deepsky.backend.service;

import com.deepsky.backend.dto.AuthDTOs.*;
import com.deepsky.backend.model.RolUsuario;
import com.deepsky.backend.model.Usuario;
import com.deepsky.backend.repository.UsuarioRepository;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.security.PasswordEncoder;

import java.util.List;
import java.util.Optional;

public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final VerificationCodeService codeService;
    private final JwtService jwtService;

    private static final List<String> DOMINIOS_INSTITUCIONALES = List.of(
            "nasa.gov", "eso.org", "unam.mx", "iaa.es", "cfa.harvard.edu", "ias.edu", "astro.aau.dk"
    );

    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, VerificationCodeService codeService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.codeService = codeService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Paso 1 del registro: valida datos, guarda pendiente en memoria y envía código.
     * NO guarda en la base de datos todavía.
     */
    public String registrar(RegisterRequest req) {
        if (usuarioRepository.findByEmail(req.email).isPresent()) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado.");
        }
        if (req.nombre == null || req.nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio.");
        }
        if (req.password == null || req.password.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres.");
        }

        // Hashear la contraseña antes de guardar en memoria
        RegisterRequest reqHasheado = new RegisterRequest();
        reqHasheado.nombre = req.nombre;
        reqHasheado.email = req.email;
        reqHasheado.password = passwordEncoder.hash(req.password);

        // Guardar datos pendientes en memoria (NO en BD)
        codeService.guardarRegistroPendiente(req.email, reqHasheado);

        return codeService.generarYGuardarCodigo(req.email, "¡Bienvenido a DeepSky! Usa este código para verificar tu cuenta:");
    }

    /**
     * Paso 2 del registro: verifica el código y ENTONCES guarda en BD.
     * También funciona para verificar login con código.
     */
    public AuthResponse verificarCodigoYLogin(VerifyCodeRequest req) {
        boolean valido = codeService.validarCodigo(req.email, req.codigo);
        if (!valido) {
            throw new IllegalArgumentException("Código de verificación incorrecto o expirado.");
        }

        // Si hay un registro pendiente, guardarlo ahora en BD
        RegisterRequest pendiente = codeService.obtenerYEliminarRegistroPendiente(req.email);
        if (pendiente != null) {
            RolUsuario rolAsignado = determinarRol(pendiente.email);
            Usuario nuevo = new Usuario();
            nuevo.setNombre(pendiente.nombre);
            nuevo.setEmail(pendiente.email);
            nuevo.setPasswordHash(pendiente.password); // ya viene hasheado
            nuevo.setRol(rolAsignado);
            usuarioRepository.guardar(nuevo);
        }

        Usuario u = usuarioRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        String token = jwtService.generarToken(u.getIdUsuario(), u.getEmail(), u.getRol().name());
        return new AuthResponse(token, u.getEmail(), u.getNombre(), u.getRol().name(), "Sesión iniciada correctamente.");
    }

    public void solicitarLogin(LoginRequest req) {
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(req.email);
        if (userOpt.isEmpty() || !passwordEncoder.verify(req.password, userOpt.get().getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas.");
        }
        codeService.generarYGuardarCodigo(req.email, "Usa este código para iniciar sesión en DeepSky:");
    }

    public AuthResponse loginDirect(LoginRequest req) {
        Usuario u = usuarioRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas."));

        if (!passwordEncoder.verify(req.password, u.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas.");
        }

        String token = jwtService.generarToken(u.getIdUsuario(), u.getEmail(), u.getRol().name());
        return new AuthResponse(token, u.getEmail(), u.getNombre(), u.getRol().name(), "Sesión iniciada correctamente.");
    }

    public AuthResponse registrarYLogin(RegisterRequest req) {
        if (usuarioRepository.findByEmail(req.email).isPresent()) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado.");
        }

        RolUsuario rolAsignado = determinarRol(req.email);

        Usuario nuevo = new Usuario();
        nuevo.setNombre(req.nombre);
        nuevo.setEmail(req.email);
        nuevo.setPasswordHash(passwordEncoder.hash(req.password));
        nuevo.setRol(rolAsignado);

        Usuario guardado = usuarioRepository.guardar(nuevo);
        String token = jwtService.generarToken(guardado.getIdUsuario(), guardado.getEmail(), guardado.getRol().name());
        return new AuthResponse(token, guardado.getEmail(), guardado.getNombre(), guardado.getRol().name(), "Cuenta creada y sesión iniciada.");
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public void solicitarRecuperacion(ForgotPasswordRequest req) {
        if (req.email == null || req.email.isBlank()) {
            throw new IllegalArgumentException("Debes indicar un correo.");
        }
        usuarioRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("No existe una cuenta registrada con ese correo."));

        codeService.generarYGuardarCodigo(req.email, "Usa este código para restablecer tu contraseña en DeepSky:");
    }

    public void restablecerPassword(ResetPasswordRequest req) {
        if (req.nuevaPassword == null || req.nuevaPassword.length() < 8) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        boolean codigoValido = codeService.validarCodigo(req.email, req.codigo);
        if (!codigoValido) {
            throw new IllegalArgumentException("Código de verificación incorrecto o expirado.");
        }

        Usuario u = usuarioRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("No existe una cuenta registrada con ese correo."));

        String nuevoHash = passwordEncoder.hash(req.nuevaPassword);
        usuarioRepository.actualizarPassword(u.getEmail(), nuevoHash);
    }

    private RolUsuario determinarRol(String email) {
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        boolean esInstitucional = DOMINIOS_INSTITUCIONALES.stream().anyMatch(domain::endsWith);
        return esInstitucional ? RolUsuario.DIVULGADOR : RolUsuario.PARTICIPANTE;
    }
}