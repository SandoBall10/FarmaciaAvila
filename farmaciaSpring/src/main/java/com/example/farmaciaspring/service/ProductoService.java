package com.example.farmaciaspring.service;

import com.example.farmaciaspring.dto.ProductoRequestDTO;
import com.example.farmaciaspring.dto.ProductoResponseDTO;
import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.mapper.ProductoMapper;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<ProductoResponseDTO> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(ProductoMapper::toResponse)
                .toList();
    }

    public List<ProductoResponseDTO> buscarPorCategoria(String categoria) {
        return productoRepository.findByCategoriaContainingIgnoreCase(categoria).stream()
                .map(ProductoMapper::toResponse)
                .toList();
    }

    public List<ProductoResponseDTO> getAllProductos() {
        return productoRepository.findAll().stream()
                .map(ProductoMapper::toResponse)
                .toList();
    }

    public ProductoResponseDTO getProductoById(int id) {
        return ProductoMapper.toResponse(findProducto(id));
    }

    public ProductoResponseDTO addProducto(ProductoRequestDTO request) {
        Producto producto = ProductoMapper.toEntity(request);
        return ProductoMapper.toResponse(productoRepository.save(producto));
    }

    public ProductoResponseDTO updateProducto(int id, ProductoRequestDTO request) {
        Producto producto = findProducto(id);
        ProductoMapper.apply(producto, request);
        return ProductoMapper.toResponse(productoRepository.save(producto));
    }

    public void deleteProducto(int id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    private Producto findProducto(int id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }
}
