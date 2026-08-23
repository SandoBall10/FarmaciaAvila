package com.example.farmaciaspring.config;

import com.example.farmaciaspring.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "jwt.expiration-ms=5000",
        "app.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173"
})
class ConfigurableJwtAndCorsTest {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void jwtDebeRespetarExpirationExternalizada() {
        String token = jwtUtil.generateToken("admin", "ROLE_ADMIN");
        Date expiration = jwtUtil.extractAllClaims(token).getExpiration();
        long remainingMs = expiration.getTime() - System.currentTimeMillis();

        assertThat(remainingMs).isBetween(1_000L, 5_000L);
    }

    @Test
    void corsDebeAceptarVariosOrigenesConfigurados() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/authenticate");
        CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).containsExactly(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        );
    }
}
