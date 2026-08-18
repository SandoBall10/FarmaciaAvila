package com.example.farmaciaspring.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_deberiaPoderListarUsuarios() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void vendedor_noDeberiaAccederAUsuarios() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sinAutenticacion_noDeberiaAccederAUsuarios() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_deberiaPoderCrearProducto() throws Exception {
        mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Vitamina C",
                                  "precio": 8.9,
                                  "cantidad": 10,
                                  "fechaVencimiento": "2027-04-22",
                                  "descripcion": "Suplemento",
                                  "categoria": "Vitaminas y Suplementos"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void vendedor_noDeberiaCrearProducto() throws Exception {
        mockMvc.perform(post("/api/producto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Vitamina C",
                                  "precio": 8.9,
                                  "cantidad": 10,
                                  "fechaVencimiento": "2027-04-22",
                                  "descripcion": "Suplemento",
                                  "categoria": "Vitaminas y Suplementos"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void vendedor_noDeberiaActualizarProducto() throws Exception {
        mockMvc.perform(put("/api/producto/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Vitamina C",
                                  "precio": 8.9,
                                  "cantidad": 10,
                                  "fechaVencimiento": "2027-04-22",
                                  "descripcion": "Suplemento",
                                  "categoria": "Vitaminas y Suplementos"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void vendedor_noDeberiaEliminarProducto() throws Exception {
        mockMvc.perform(delete("/api/producto/1"))
                .andExpect(status().isForbidden());
    }
}
