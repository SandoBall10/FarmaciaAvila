package com.example.farmaciaspring.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VentaRequestDTO {
    @Positive(message = "Debe seleccionar un cliente")
    private int idcliente;
    private LocalDate fechaRegistro;
    @NotEmpty(message = "La venta debe incluir al menos un producto")
    @Valid
    private List<VentaLineaRequestDTO> detalles;

    public int getIdcliente() {
        return idcliente;
    }

    public void setIdcliente(int idcliente) {
        this.idcliente = idcliente;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public List<VentaLineaRequestDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<VentaLineaRequestDTO> detalles) {
        this.detalles = detalles;
    }
}
