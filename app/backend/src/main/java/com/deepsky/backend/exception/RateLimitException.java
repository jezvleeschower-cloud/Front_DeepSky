package com.deepsky.backend.exception;

/**
 * Se lanza cuando un usuario intenta repetir una acción restringida
 * (por ejemplo, eliminar un hilo del foro) antes de que se cumpla el
 * tiempo mínimo de espera entre una acción y la siguiente.
 */
public class RateLimitException extends RuntimeException {
    public RateLimitException(String message) {
        super(message);
    }
}
