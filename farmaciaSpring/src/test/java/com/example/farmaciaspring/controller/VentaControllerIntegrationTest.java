package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.dto.VentaResponseDTO;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.repository.ClientesRepository;
import com.example.farmaciaspring.repository.ProductoRepository;
import com.example.farmaciaspring.repository.VentaDetalleRepository;
import com.example.farmaciaspring.repository.VentaRepository;
import com.example.farmaciaspring.service.VentaService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static com.example.farmaciaspring.support.TestDataFactory.cliente;
import static com.example.farmaciaspring.support.TestDataFactory.linea;
import static com.example.farmaciaspring.support.TestDataFactory.producto;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VentaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private VentaService ventaService;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ClientesRepository clientesRepository;
    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private VentaDetalleRepository ventaDetalleRepository;

    @AfterEach
    void limpiar() {
        ventaDetalleRepository.deleteAll();
        ventaRepository.deleteAll();
        productoRepository.deleteAll();
        clientesRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void getVenta_deberiaDevolverDetalleCompleto() throws Exception {
        Cliente cliente = clientesRepository.save(cliente("Ana"));
        Producto producto = productoRepository.save(producto("Omeprazol", 8.0, 20));
        VentaResponseDTO venta = ventaService.registrarVenta(
                cliente.getId(),
                LocalDate.now(),
                List.of(linea(producto.getId(), 2))
        );

        mockMvc.perform(get("/api/venta/" + venta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(venta.getId()))
                .andExpect(jsonPath("$.cliente.nombre").value("Ana"))
                .andExpect(jsonPath("$.precioTotal").value(16.0))
                .andExpect(jsonPath("$.detalles").isArray())
                .andExpect(jsonPath("$.detalles[0].cantidad").value(2))
                .andExpect(jsonPath("$.detalles[0].precioUnitario").value(8.0))
                .andExpect(jsonPath("$.detalles[0].subtotal").value(16.0))
                .andExpect(jsonPath("$.detalles[0].producto.nombre").value("Omeprazol"));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void getVenta_deberiaConservarPrecioHistorico() throws Exception {
        Cliente cliente = clientesRepository.save(cliente("Pedro"));
        Producto producto = productoRepository.save(producto("Loratadina", 15.0, 10));
        VentaResponseDTO venta = ventaService.registrarVenta(
                cliente.getId(),
                LocalDate.now(),
                List.of(linea(producto.getId(), 1))
        );

        producto.setPrecio(20.0);
        productoRepository.save(producto);

        mockMvc.perform(get("/api/venta/" + venta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detalles[0].precioUnitario").value(15.0))
                .andExpect(jsonPath("$.detalles[0].subtotal").value(15.0))
                .andExpect(jsonPath("$.precioTotal").value(15.0));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void postVenta_conStockInsuficiente_deberiaDevolver409() throws Exception {
        Cliente cliente = clientesRepository.save(cliente("Miguel"));
        Producto producto = productoRepository.save(producto("Aciclovir", 22.0, 1));

        mockMvc.perform(post("/api/venta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idcliente": %d,
                                  "fechaRegistro": "2026-08-17",
                                  "detalles": [{ "idproducto": %d, "cantidad": 3 }]
                                }
                                """.formatted(cliente.getId(), producto.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Stock insuficiente")));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void postVenta_deberiaIgnorarPrecioYStockEnviadosPorElCliente() throws Exception {
        Cliente cliente = clientesRepository.save(cliente("Elena"));
        Producto producto = productoRepository.save(producto("Ketorolaco", 10.0, 8));

        mockMvc.perform(post("/api/venta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idcliente": %d,
                                  "fechaRegistro": "2026-08-17",
                                  "precioTotal": 1,
                                  "stock": 999,
                                  "detalles": [{
                                    "idproducto": %d,
                                    "cantidad": 2,
                                    "precio": 0.01,
                                    "precioUnitario": 0.01,
                                    "subtotal": 0.02,
                                    "stock": 0
                                  }]
                                }
                                """.formatted(cliente.getId(), producto.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.precioTotal").value(20.0))
                .andExpect(jsonPath("$.detalles[0].cantidad").value(2))
                .andExpect(jsonPath("$.detalles[0].precioUnitario").value(10.0))
                .andExpect(jsonPath("$.detalles[0].subtotal").value(20.0));
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void putVenta_deberiaEstarCerrado() throws Exception {
        mockMvc.perform(put("/api/venta/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void deleteVenta_deberiaEstarCerrado() throws Exception {
        mockMvc.perform(delete("/api/venta/1"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void postVentaDetalle_deberiaEstarCerrado() throws Exception {
        mockMvc.perform(post("/api/ventadetalle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "idventa": 1, "idproducto": 1, "cantidad": 1 }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "Vendedor")
    void deleteVentaDetalle_deberiaEstarCerrado() throws Exception {
        mockMvc.perform(delete("/api/ventadetalle/1"))
                .andExpect(status().isNotFound());
    }
}
