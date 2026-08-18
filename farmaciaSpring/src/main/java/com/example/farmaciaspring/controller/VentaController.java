package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.dto.VentaListItemDTO;
import com.example.farmaciaspring.dto.VentaRequestDTO;
import com.example.farmaciaspring.dto.VentaResponseDTO;
import com.example.farmaciaspring.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/venta")
@PreAuthorize("hasAnyRole('ADMIN', 'Vendedor')")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    public List<VentaListItemDTO> getAllVentas() {
        return ventaService.getAllVentas();
    }

    @GetMapping("/{id}")
    public VentaResponseDTO getVentaById(@PathVariable int id) {
        return ventaService.getVentaCompleta(id);
    }

    @PostMapping
    public ResponseEntity<VentaResponseDTO> addVenta(@Valid @RequestBody VentaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.registrarVenta(request));
    }
}
