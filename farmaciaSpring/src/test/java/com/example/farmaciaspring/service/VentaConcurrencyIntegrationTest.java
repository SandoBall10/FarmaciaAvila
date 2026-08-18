package com.example.farmaciaspring.service;

import com.example.farmaciaspring.exception.InsufficientStockException;
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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static com.example.farmaciaspring.support.TestDataFactory.cliente;
import static com.example.farmaciaspring.support.TestDataFactory.linea;
import static com.example.farmaciaspring.support.TestDataFactory.producto;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class VentaConcurrencyIntegrationTest {

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
    void registrarVenta_conDosComprasConcurrentes_deberiaPermitirSoloUna() throws Exception {
        Cliente cliente = clientesRepository.save(cliente("Rosa"));
        Producto producto = productoRepository.save(producto("Salbutamol", 28.0, 1));

        CountDownLatch listos = new CountDownLatch(2);
        CountDownLatch arranque = new CountDownLatch(1);
        AtomicInteger exitos = new AtomicInteger();
        AtomicInteger conflictos = new AtomicInteger();
        AtomicInteger otrosErrores = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(2);
        Runnable compra = () -> {
            listos.countDown();
            try {
                arranque.await(5, TimeUnit.SECONDS);
                ventaService.registrarVenta(
                        cliente.getId(),
                        LocalDate.now(),
                        List.of(linea(producto.getId(), 1))
                );
                exitos.incrementAndGet();
            } catch (InsufficientStockException ex) {
                conflictos.incrementAndGet();
            } catch (Exception ex) {
                otrosErrores.incrementAndGet();
            }
        };

        pool.submit(compra);
        pool.submit(compra);
        assertThat(listos.await(5, TimeUnit.SECONDS)).isTrue();
        arranque.countDown();
        pool.shutdown();
        assertThat(pool.awaitTermination(15, TimeUnit.SECONDS)).isTrue();

        Producto recargado = productoRepository.findById(producto.getId()).orElseThrow();
        assertThat(otrosErrores.get()).isZero();
        assertThat(exitos.get()).isEqualTo(1);
        assertThat(conflictos.get()).isEqualTo(1);
        assertThat(recargado.getCantidad()).isZero();
        assertThat(recargado.getCantidad()).isGreaterThanOrEqualTo(0);
        assertThat(ventaRepository.count()).isEqualTo(1);
    }
}
