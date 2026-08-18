package com.example.farmaciaspring.mapper;

import com.example.farmaciaspring.dto.VentaListItemDTO;
import com.example.farmaciaspring.model.Venta;

public final class VentaMapper {

    private VentaMapper() {
    }

    public static VentaListItemDTO toListItem(Venta venta) {
        VentaListItemDTO dto = new VentaListItemDTO();
        dto.setId(venta.getId());
        dto.setIdcliente(venta.getIdcliente());
        dto.setFechaRegistro(venta.getFechaRegistro());
        dto.setPrecioTotal(venta.getPrecioTotal());
        return dto;
    }
}
