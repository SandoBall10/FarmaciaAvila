package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.repository.ClientesRepository;
import com.example.farmaciaspring.repository.ProductoRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductoClienteDtoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ClientesRepository clientesRepository;

    @AfterEach
    void limpiar() {
        productoRepository.deleteAll();
        clientesRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearProducto_deberiaDevolverDtoSinExponerEntidad() throws Exception {
        mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Paracetamol",
                                  "precio": 10.5,
                                  "cantidad": 20,
                                  "fechaVencimiento": "2027-08-17",
                                  "descripcion": "Analgesico",
                                  "categoria": "Antiinflamatorios y Analgesicos"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Paracetamol"))
                .andExpect(jsonPath("$.precio").value(10.5))
                .andExpect(jsonPath("$.cantidad").value(20))
                .andExpect(jsonPath("$.categoria").value("Antiinflamatorios y Analgesicos"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearProducto_deberiaIgnorarIdEnviadoPorElCliente() throws Exception {
        mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 99999,
                                  "nombre": "Ibuprofeno",
                                  "precio": 7.5,
                                  "cantidad": 5,
                                  "fechaVencimiento": "2027-08-17",
                                  "descripcion": "Analgesico",
                                  "categoria": "Antiinflamatorios y Analgesicos"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(99999)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearProducto_deberiaDevolverSoloCamposDelContrato() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Vitamina D",
                                  "precio": 12.0,
                                  "cantidad": 8,
                                  "fechaVencimiento": "2027-08-17",
                                  "descripcion": "Suplemento",
                                  "categoria": "Vitaminas y Suplementos"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(fieldNames(result)).containsExactlyInAnyOrder(
                "id", "nombre", "precio", "cantidad", "fechaVencimiento", "descripcion", "categoria");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void crearProducto_deberiaValidarRequest() throws Exception {
        mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "",
                                  "precio": 0,
                                  "cantidad": -1,
                                  "fechaVencimiento": "2027-08-17",
                                  "descripcion": "x",
                                  "categoria": "Pruebas"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getProducto_inexistente_deberiaDevolver404() throws Exception {
        mockMvc.perform(get("/api/producto/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado"));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void crearCliente_deberiaDevolverDto() throws Exception {
        mockMvc.perform(post("/api/cliente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Lucia",
                                  "apellidos": "Perez",
                                  "email": "lucia@test.com",
                                  "telefono": "999111222"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Lucia"))
                .andExpect(jsonPath("$.apellidos").value("Perez"))
                .andExpect(jsonPath("$.email").value("lucia@test.com"))
                .andExpect(jsonPath("$.telefono").value("999111222"));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void crearCliente_deberiaDevolverSoloCamposDelContrato() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/cliente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Carla",
                                  "apellidos": "Ruiz",
                                  "email": "carla@test.com",
                                  "telefono": "988777666"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(fieldNames(result)).containsExactlyInAnyOrder(
                "id", "nombre", "apellidos", "email", "telefono");
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void crearCliente_telefonoInvalido_deberiaDevolver400() throws Exception {
        mockMvc.perform(post("/api/cliente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Lucia",
                                  "apellidos": "Perez",
                                  "email": "lucia@test.com",
                                  "telefono": "123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El teléfono debe tener 9 dígitos"));
    }

    private Set<String> fieldNames(MvcResult result) throws Exception {
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        Set<String> names = new HashSet<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}
