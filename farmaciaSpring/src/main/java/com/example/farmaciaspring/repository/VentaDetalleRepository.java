package com.example.farmaciaspring.repository;

import com.example.farmaciaspring.model.VentaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, Integer> {
    // Aquí puedes añadir métodos personalizados si es necesario
    List<VentaDetalle> findByIdventa(int idventa);
}
