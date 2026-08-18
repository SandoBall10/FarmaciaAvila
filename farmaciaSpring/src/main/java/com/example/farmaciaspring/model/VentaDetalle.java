package com.example.farmaciaspring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;

@Entity
public class VentaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int idventa;
    private int idproducto;
    @Positive(message = "La cantidad debe ser mayor que cero")
    private int cantidad;

    /**
     * Precio del producto al momento de la venta.
     * Las ventas anteriores a Fase 3 pueden tener este valor nulo.
     */
    private Double precioUnitario;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdventa() {
        return idventa;
    }

    public void setIdventa(int idventa) {
        this.idventa = idventa;
    }

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

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}
