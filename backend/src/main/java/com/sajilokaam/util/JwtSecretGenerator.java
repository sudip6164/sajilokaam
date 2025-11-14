package com.sajilokaam.util;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility to generate a secure JWT secret key.
 * Run this as a standalone program to generate a secret for your .env file.
 */
public class JwtSecretGenerator {
    public static void main(String[] args) {
        // Generate 64 bytes (512 bits) for HS384 - provides extra security margin
        SecureRandom random = new SecureRandom();
        byte[] secretBytes = new byte[64];
        random.nextBytes(secretBytes);
        
        String secret = Base64.getEncoder().encodeToString(secretBytes);
        System.out.println("JWT_SECRET=" + secret);
        System.out.println("\nCopy the JWT_SECRET line above and add it to your .env file");
    }
}

