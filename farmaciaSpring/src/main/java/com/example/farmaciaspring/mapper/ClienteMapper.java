package com.example.farmaciaspring.mapper;

import com.example.farmaciaspring.dto.ClienteRequestDTO;
import com.example.farmaciaspring.dto.ClienteResponseDTO;
import com.example.farmaciaspring.dto.ClienteResumenDTO;
import com.example.farmaciaspring.model.Cliente;

public final class ClienteMapper {

    private ClienteMapper() {
    }

    public static Cliente toEntity(ClienteRequestDTO request) {
        Cliente cliente = new Cliente();
        apply(cliente, request);
        return cliente;
    }

    public static void apply(Cliente cliente, ClienteRequestDTO request) {
        cliente.setNombre(request.getNombre());
        cliente.setApellidos(request.getApellidos());
        cliente.setEmail(request.getEmail());
        cliente.setTelefono(request.getTelefono());
    }

    public static ClienteResponseDTO toResponse(Cliente cliente) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setId(cliente.getId());
        dto.setNombre(cliente.getNombre());
        dto.setApellidos(cliente.getApellidos());
        dto.setEmail(cliente.getEmail());
        dto.setTelefono(cliente.getTelefono());
        return dto;
    }

    public static ClienteResumenDTO toResumen(Cliente cliente) {
        return new ClienteResumenDTO(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getApellidos(),
                cliente.getEmail(),
                cliente.getTelefono()
        );
    }
}
