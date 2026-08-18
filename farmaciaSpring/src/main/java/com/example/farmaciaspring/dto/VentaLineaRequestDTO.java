package com.example.farmaciaspring.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VentaLineaRequestDTO {
    @Positive(message = "Debe seleccionar un producto")
    private int idproducto;

    @Positive(message = "La cantidad debe ser mayor que cero")
    private int cantidad;

    public int getIdproducto() {
        return idproducto;
    }

    public void setIdproducto(int idproducto) {
        this.idproducto = idproducto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}
