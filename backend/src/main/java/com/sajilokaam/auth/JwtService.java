package com.sajilokaam.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtService {

    @Value("${jwt.secret:your-256-bit-secret-key-change-in-production-min-32-chars}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private Long expiration; // 24 hours default

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Optional<String> extractSubject(String token) {
        try {
            var jwt = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return Optional.ofNullable(jwt.getPayload().getSubject());
        } catch (Exception e) {
            System.err.println("JWT validation failed: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }
}

