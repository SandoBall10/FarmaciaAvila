package com.example.farmaciaspring.repository;

import com.example.farmaciaspring.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    // Aquí puedes añadir métodos personalizados si es necesario
}
