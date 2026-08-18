package com.example.farmaciaspring.service;

import com.example.farmaciaspring.dto.VentaLineaRequestDTO;
import com.example.farmaciaspring.dto.VentaResponseDTO;
import com.example.farmaciaspring.exception.BusinessException;
import com.example.farmaciaspring.exception.InsufficientStockException;
import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.model.Venta;
import com.example.farmaciaspring.model.VentaDetalle;
import com.example.farmaciaspring.repository.ClientesRepository;
import com.example.farmaciaspring.repository.ProductoRepository;
import com.example.farmaciaspring.repository.VentaDetalleRepository;
import com.example.farmaciaspring.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.example.farmaciaspring.support.TestDataFactory.cliente;
import static com.example.farmaciaspring.support.TestDataFactory.linea;
import static com.example.farmaciaspring.support.TestDataFactory.producto;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;
    @Mock
    private VentaDetalleRepository ventaDetalleRepository;
    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private ClientesRepository clientesRepository;

    @InjectMocks
    private VentaService ventaService;

    private final List<VentaDetalle> detallesGuardados = new ArrayList<>();

    @BeforeEach
    void setUp() {
        detallesGuardados.clear();
    }

    @Test
    void registrarVenta_deberiaCalcularTotalConPrecioDelServidor() {
        Cliente cliente = clienteExistente(1);
        Producto paracetamol = productoConId(10, "Paracetamol", 10.0, 8);
        stubGuardadoDeVenta(50);

        VentaLineaRequestDTO linea = linea(10, 2);
        // El DTO de alta no incluye precio: si existiera, el servicio no lo usaría.
        VentaResponseDTO resultado = ventaService.registrarVenta(1, LocalDate.of(2026, 8, 17), List.of(linea));

        assertThat(resultado.getPrecioTotal()).isEqualTo(20.0);
        assertThat(resultado.getDetalles()).hasSize(1);
        assertThat(resultado.getDetalles().get(0).getPrecioUnitario()).isEqualTo(10.0);
        assertThat(resultado.getDetalles().get(0).getSubtotal()).isEqualTo(20.0);
        assertThat(paracetamol.getCantidad()).isEqualTo(6);
        verify(ventaRepository).save(any(Venta.class));
        verify(ventaDetalleRepository).save(any(VentaDetalle.class));
        assertThat(cliente.getId()).isEqualTo(1);
    }

    @Test
    void registrarVenta_deberiaRechazarStockInsuficiente() {
        clienteExistente(1);
        productoConId(10, "Amoxicilina", 12.5, 2);

        assertThatThrownBy(() -> ventaService.registrarVenta(1, LocalDate.now(), List.of(linea(10, 3))))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Amoxicilina")
                .hasMessageContaining("Disponible: 2")
                .hasMessageContaining("Solicitado: 3");

        verify(ventaRepository, never()).save(any());
        verify(ventaDetalleRepository, never()).save(any());
        verify(productoRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1})
    void registrarVenta_deberiaRechazarCantidadInvalida(int cantidad) {
        clienteExistente(1);

        assertThatThrownBy(() -> ventaService.registrarVenta(1, LocalDate.now(), List.of(linea(10, cantidad))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cantidad");

        verify(productoRepository, never()).findByIdForUpdate(anyInt());
        verify(ventaRepository, never()).save(any());
        verify(ventaDetalleRepository, never()).save(any());
    }

    @Test
    void registrarVenta_deberiaFallarSiElProductoNoExiste() {
        clienteExistente(1);
        when(productoRepository.findByIdForUpdate(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.registrarVenta(1, LocalDate.now(), List.of(linea(99, 1))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Producto no encontrado");

        verify(ventaRepository, never()).save(any());
        verify(ventaDetalleRepository, never()).save(any());
    }

    @Test
    void registrarVenta_deberiaFallarSiElClienteNoExiste() {
        when(clientesRepository.findById(77)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.registrarVenta(77, LocalDate.now(), List.of(linea(10, 1))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente no encontrado");

        verify(productoRepository, never()).findByIdForUpdate(anyInt());
        verify(ventaRepository, never()).save(any());
        verify(ventaDetalleRepository, never()).save(any());
    }

    @Test
    void registrarVenta_conVariasLineas_deberiaCalcularTotalYDescontarStock() {
        clienteExistente(1);
        Producto productoA = productoConId(1, "Producto A", 10.0, 10);
        Producto productoB = productoConId(2, "Producto B", 25.0, 10);
        stubGuardadoDeVenta(80);

        VentaResponseDTO resultado = ventaService.registrarVenta(
                1,
                LocalDate.now(),
                List.of(linea(1, 2), linea(2, 3))
        );

        assertThat(resultado.getPrecioTotal()).isEqualTo(95.0);
        assertThat(resultado.getDetalles()).hasSize(2);
        assertThat(productoA.getCantidad()).isEqualTo(8);
        assertThat(productoB.getCantidad()).isEqualTo(7);
        assertThat(resultado.getDetalles())
                .extracting(detalle -> detalle.getPrecioUnitario() * detalle.getCantidad())
                .containsExactlyInAnyOrder(20.0, 75.0);
    }

    private Cliente clienteExistente(int id) {
        Cliente cliente = cliente("Maria");
        cliente.setId(id);
        when(clientesRepository.findById(id)).thenReturn(Optional.of(cliente));
        return cliente;
    }

    private Producto productoConId(int id, String nombre, double precio, int stock) {
        Producto producto = producto(nombre, precio, stock);
        producto.setId(id);
        when(productoRepository.findByIdForUpdate(id)).thenReturn(Optional.of(producto));
        when(productoRepository.findById(id)).thenReturn(Optional.of(producto));
        when(productoRepository.save(producto)).thenReturn(producto);
        return producto;
    }

    private void stubGuardadoDeVenta(int idVenta) {
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> {
            Venta venta = invocation.getArgument(0);
            venta.setId(idVenta);
            return venta;
        });
        when(ventaDetalleRepository.save(any(VentaDetalle.class))).thenAnswer(invocation -> {
            VentaDetalle detalle = invocation.getArgument(0);
            detalle.setId(detallesGuardados.size() + 1);
            detallesGuardados.add(detalle);
            return detalle;
        });
        when(ventaDetalleRepository.findByIdventa(idVenta)).thenAnswer(invocation -> detallesGuardados);
    }
}
