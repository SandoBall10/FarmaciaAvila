package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.model.Role;
import com.example.farmaciaspring.model.User;
import com.example.farmaciaspring.repository.RoleRepository;
import com.example.farmaciaspring.repository.UserRepository;
import com.example.farmaciaspring.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static com.example.farmaciaspring.support.TestDataFactory.rol;
import static com.example.farmaciaspring.support.TestDataFactory.usuario;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthenticationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        Role admin = roleRepository.save(rol("ADMIN"));
        userRepository.save(usuario("admin", "admin123", admin, passwordEncoder));
    }

    @Test
    void authenticate_conCredencialesValidas_deberiaDevolverToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "admin",
                                "password", "admin123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.id").isNumber())
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.nombre").exists())
                .andExpect(jsonPath("$.user.apellido").exists())
                .andExpect(jsonPath("$.user.email").exists())
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.user.roles").doesNotExist())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(names(root)).containsExactlyInAnyOrder("token", "user");
        assertThat(names(root.get("user")))
                .containsExactlyInAnyOrder("id", "username", "nombre", "apellido", "email", "role");
    }

    @Test
    void authenticate_conCredencialesInvalidas_deberiaDevolver401() throws Exception {
        mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "admin",
                                "password", "incorrecta"
                        ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticate_conUsernameVacio_deberiaDevolver400() throws Exception {
        mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "",
                                "password", "admin123"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authenticate_conPasswordVacio_deberiaDevolver400() throws Exception {
        mockMvc.perform(post("/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "admin",
                                "password", ""
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authenticate_porQueryParams_noDebeAutenticar() throws Exception {
        mockMvc.perform(post("/authenticate")
                        .param("username", "admin")
                        .param("password", "admin123"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void jwtDeUsuarioEliminado_deberiaDevolver401() throws Exception {
        Role admin = roleRepository.findAll().get(0);
        User temporal = userRepository.save(usuario("temporal", "admin123", admin, passwordEncoder));
        String token = jwtUtil.generateToken(temporal.getUsername(), "ROLE_ADMIN");
        userRepository.delete(temporal);
        userRepository.flush();

        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.trace").doesNotExist());
    }

    private Set<String> names(JsonNode node) {
        Set<String> fields = new HashSet<>();
        node.fieldNames().forEachRemaining(fields::add);
        return fields;
    }
}
