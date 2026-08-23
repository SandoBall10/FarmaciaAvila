package com.example.farmaciaspring.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class ProdProfilePropertiesTest {

    @Test
    void prodNoDebeUsarDdlAutoUpdateNiSecretosLiterales() throws Exception {
        Properties properties = load("application-prod.properties");

        assertThat(properties.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
        assertThat(properties.getProperty("spring.flyway.enabled")).isEqualTo("true");
        assertThat(properties.getProperty("spring.datasource.url")).contains("${DB_URL}");
        assertThat(properties.getProperty("spring.datasource.username")).contains("${DB_USERNAME}");
        assertThat(properties.getProperty("spring.datasource.password")).contains("${DB_PASSWORD}");
        assertThat(properties.getProperty("jwt.secret")).contains("${JWT_SECRET}");
        assertThat(properties.getProperty("jwt.expiration-ms")).contains("${JWT_EXPIRATION");
        assertThat(properties.getProperty("app.cors.allowed-origins")).contains("${CORS_ALLOWED_ORIGINS}");
        assertThat(properties.getProperty("app.cors.allowed-origins")).doesNotContain("localhost");
    }

    @Test
    void localTampocoDebeUsarDdlAutoUpdate() throws Exception {
        Properties properties = load("application-local.properties");

        assertThat(properties.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
        assertThat(properties.getProperty("spring.flyway.enabled")).isEqualTo("true");
    }

    private Properties load(String classpathLocation) throws Exception {
        Properties properties = new Properties();
        try (InputStream in = new ClassPathResource(classpathLocation).getInputStream()) {
            properties.load(in);
        }
        return properties;
    }
}
