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

@SpringBootTest
class EnvironmentConfigIntegrationTest {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void jwtDebeUsarExpiracionConfiguradaDeUnaHora() {
        String token = jwtUtil.generateToken("admin", "ROLE_ADMIN");
        Date expiration = jwtUtil.extractAllClaims(token).getExpiration();
        long remainingMs = expiration.getTime() - System.currentTimeMillis();

        assertThat(remainingMs).isBetween(3_540_000L, 3_600_000L);
        assertThat(jwtUtil.extractAllClaims(token).get("password")).isNull();
    }

    @Test
    void corsDebeUsarOrigenesConfiguradosYRechazarComodin() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/producto");
        CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).containsExactly("http://localhost:5173");
        assertThat(configuration.getAllowedOrigins()).doesNotContain("*");
        assertThat(configuration.getAllowCredentials()).isTrue();
    }
}
