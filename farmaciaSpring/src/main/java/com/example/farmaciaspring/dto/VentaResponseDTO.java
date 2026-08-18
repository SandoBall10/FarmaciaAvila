package com.example.farmaciaspring.dto;

import java.time.LocalDate;
import java.util.List;

public class VentaResponseDTO {
    private int id;
    private int idcliente;
    private LocalDate fechaRegistro;
    private double precioTotal;
    private ClienteResumenDTO cliente;
    private List<VentaDetalleResponseDTO> detalles;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

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

    public double getPrecioTotal() {
        return precioTotal;
    }

    public void setPrecioTotal(double precioTotal) {
        this.precioTotal = precioTotal;
    }

    public ClienteResumenDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteResumenDTO cliente) {
        this.cliente = cliente;
    }

    public List<VentaDetalleResponseDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<VentaDetalleResponseDTO> detalles) {
        this.detalles = detalles;
    }
}
