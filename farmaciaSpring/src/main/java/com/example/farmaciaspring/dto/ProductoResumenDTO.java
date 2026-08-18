package com.example.farmaciaspring.dto;

public class ProductoResumenDTO {
    private int id;
    private String nombre;

    public ProductoResumenDTO() {
    }

    public ProductoResumenDTO(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
