package com.example.farmaciaspring.service;

import com.example.farmaciaspring.dto.ClienteRequestDTO;
import com.example.farmaciaspring.dto.ClienteResponseDTO;
import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.mapper.ClienteMapper;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.repository.ClientesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClientesRepository clientesRepository;

    public ClienteService(ClientesRepository clientesRepository) {
        this.clientesRepository = clientesRepository;
    }

    public List<ClienteResponseDTO> getAllClientes() {
        return clientesRepository.findAll().stream()
                .map(ClienteMapper::toResponse)
                .toList();
    }

    public ClienteResponseDTO getClienteById(int id) {
        return ClienteMapper.toResponse(findCliente(id));
    }

    public ClienteResponseDTO addCliente(ClienteRequestDTO request) {
        Cliente cliente = ClienteMapper.toEntity(request);
        return ClienteMapper.toResponse(clientesRepository.save(cliente));
    }

    public ClienteResponseDTO updateCliente(int id, ClienteRequestDTO request) {
        Cliente cliente = findCliente(id);
        ClienteMapper.apply(cliente, request);
        return ClienteMapper.toResponse(clientesRepository.save(cliente));
    }

    public void deleteCliente(int id) {
        if (!clientesRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente no encontrado");
        }
        clientesRepository.deleteById(id);
    }

    private Cliente findCliente(int id) {
        return clientesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }
}
