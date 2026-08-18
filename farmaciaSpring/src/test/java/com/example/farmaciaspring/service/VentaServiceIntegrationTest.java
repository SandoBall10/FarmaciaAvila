package com.example.farmaciaspring.service;

import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.repository.ClientesRepository;
import com.example.farmaciaspring.repository.ProductoRepository;
import com.example.farmaciaspring.repository.VentaDetalleRepository;
import com.example.farmaciaspring.repository.VentaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static com.example.farmaciaspring.support.TestDataFactory.cliente;
import static com.example.farmaciaspring.support.TestDataFactory.linea;
import static com.example.farmaciaspring.support.TestDataFactory.producto;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class VentaServiceIntegrationTest {

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
    void registrarVenta_siFallaLaSegundaLinea_noDejaStockNiVentaParcial() {
        Cliente cliente = clientesRepository.save(cliente("Carlos"));
        Producto amoxicilina = productoRepository.save(producto("Amoxicilina", 12.5, 5));
        int stockOriginal = amoxicilina.getCantidad();
        int ventasAntes = (int) ventaRepository.count();
        int detallesAntes = (int) ventaDetalleRepository.count();

        assertThatThrownBy(() -> ventaService.registrarVenta(
                cliente.getId(),
                LocalDate.now(),
                List.of(linea(amoxicilina.getId(), 1), linea(999_999, 1))
        )).isInstanceOf(ResourceNotFoundException.class);

        Producto recargado = productoRepository.findById(amoxicilina.getId()).orElseThrow();
        assertThat(recargado.getCantidad()).isEqualTo(stockOriginal);
        assertThat(ventaRepository.count()).isEqualTo(ventasAntes);
        assertThat(ventaDetalleRepository.count()).isEqualTo(detallesAntes);
    }

    @Test
    void getVentaCompleta_deberiaConservarPrecioUnitarioAunqueCambieElProducto() {
        Cliente cliente = clientesRepository.save(cliente("Lucia"));
        Producto producto = productoRepository.save(producto("Ibuprofeno", 15.0, 10));

        var venta = ventaService.registrarVenta(
                cliente.getId(),
                LocalDate.now(),
                List.of(linea(producto.getId(), 2))
        );

        producto.setPrecio(20.0);
        productoRepository.save(producto);

        var consultada = ventaService.getVentaCompleta(venta.getId());
        assertThat(consultada.getDetalles()).hasSize(1);
        assertThat(consultada.getDetalles().get(0).getPrecioUnitario()).isEqualTo(15.0);
        assertThat(consultada.getDetalles().get(0).getSubtotal()).isEqualTo(30.0);
        assertThat(consultada.getPrecioTotal()).isEqualTo(30.0);
        assertThat(consultada.getCliente().getNombre()).isEqualTo("Lucia");
    }
}
