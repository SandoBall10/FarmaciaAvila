package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.dto.ClienteRequestDTO;
import com.example.farmaciaspring.dto.ClienteResponseDTO;
import com.example.farmaciaspring.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponseDTO> getAllClientes() {
        return clienteService.getAllClientes();
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO getClienteById(@PathVariable int id) {
        return clienteService.getClienteById(id);
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> addCliente(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.addCliente(request));
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO updateCliente(@PathVariable int id, @Valid @RequestBody ClienteRequestDTO request) {
        return clienteService.updateCliente(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCliente(@PathVariable int id) {
        clienteService.deleteCliente(id);
        return ResponseEntity.noContent().build();
    }
}
