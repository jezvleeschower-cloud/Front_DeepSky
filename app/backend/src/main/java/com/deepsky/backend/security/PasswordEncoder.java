package com.deepsky.backend.security;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordEncoder {
    private final int workload;

    public PasswordEncoder() {
        this.workload = 12; // equilibrio entre seguridad y rendimiento
    }

    public String hash(String plainPassword) {
        if (plainPassword == null) return null;
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(workload));
    }

    public boolean verify(String plainPassword, String hashed) {
        if (plainPassword == null || hashed == null) return false;
        try {
            return BCrypt.checkpw(plainPassword, hashed);
        } catch (Exception e) {
            return false;
        }
    }
}
