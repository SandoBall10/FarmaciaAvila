package com.example.farmaciaspring.mapper;

import com.example.farmaciaspring.dto.ProductoRequestDTO;
import com.example.farmaciaspring.dto.ProductoResponseDTO;
import com.example.farmaciaspring.model.Producto;

public final class ProductoMapper {

    private ProductoMapper() {
    }

    public static Producto toEntity(ProductoRequestDTO request) {
        Producto producto = new Producto();
        apply(producto, request);
        return producto;
    }

    public static void apply(Producto producto, ProductoRequestDTO request) {
        producto.setNombre(request.getNombre());
        producto.setPrecio(request.getPrecio());
        producto.setCantidad(request.getCantidad());
        producto.setFechaVencimiento(request.getFechaVencimiento());
        producto.setDescripcion(request.getDescripcion());
        producto.setCategoria(request.getCategoria());
    }

    public static ProductoResponseDTO toResponse(Producto producto) {
        ProductoResponseDTO dto = new ProductoResponseDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setPrecio(producto.getPrecio());
        dto.setCantidad(producto.getCantidad());
        dto.setFechaVencimiento(producto.getFechaVencimiento());
        dto.setDescripcion(producto.getDescripcion());
        dto.setCategoria(producto.getCategoria());
        return dto;
    }
}
