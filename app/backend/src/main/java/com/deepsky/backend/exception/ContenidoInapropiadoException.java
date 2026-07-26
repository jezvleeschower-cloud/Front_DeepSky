package com.deepsky.backend.exception;

/**
 * Se lanza cuando un texto o una imagen enviados por el usuario son
 * rechazados por el sistema de moderación (lenguaje altisonante o
 * contenido visual inapropiado) ANTES de llegar a la base de datos o
 * a Cloudinary.
 *
 * Extiende de IllegalArgumentException a propósito: todos los
 * controladores ya capturan IllegalArgumentException y responden con
 * un JSON de error (400/403), así que no hace falta tocar el manejo
 * de excepciones existente en cada controller.
 */
public class ContenidoInapropiadoException extends IllegalArgumentException {
    public ContenidoInapropiadoException(String message) {
        super(message);
    }
}
