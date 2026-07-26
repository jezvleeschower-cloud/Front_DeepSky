package com.deepsky.backend.security;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import com.deepsky.backend.config.AppConfig;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtService {
    // Antes: Keys.secretKeyFor(SignatureAlgorithm.HS256) generaba una llave nueva
    // y aleatoria CADA VEZ que arrancaba el backend, invalidando todos los tokens
    // ya emitidos (y por lo tanto todas las sesiones activas) en cada reinicio.
    // Ahora la llave se lee de application.properties (jwt.secret) y es estable
    // entre reinicios. Si por algún motivo no está configurada, se genera una
    // aleatoria como respaldo (mismo comportamiento de antes, con aviso en consola).
    private static final Key SECRET_KEY = resolverLlave();
    private static final long EXPIRATION_TIME = 86_400_000; // 24 Horas

    private static Key resolverLlave() {
        String secretBase64 = AppConfig.get("jwt.secret");
        if (secretBase64 == null || secretBase64.isBlank()) {
            System.err.println("[JwtService] ADVERTENCIA: 'jwt.secret' no está configurado en application.properties. " +
                    "Se usará una llave aleatoria temporal: todas las sesiones se invalidarán en el próximo reinicio del backend.");
            return Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
        byte[] bytes = Base64.getDecoder().decode(secretBase64);
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generarToken(int idUsuario, String email, String rol) {
        return Jwts.builder()
                .setSubject(String.valueOf(idUsuario))
                .claim("email", email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Claims obtenerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean esTokenValido(String token) {
        try {
            Claims claims = obtenerClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public int obtenerUsuarioIdDesdeToken(String token) {
        Claims claims = obtenerClaims(token);
        return Integer.parseInt(claims.getSubject());
    }
}