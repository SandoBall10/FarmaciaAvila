package com.example.farmaciaspring.exception;

public class InsufficientStockException extends RuntimeException {
    private final String productName;
    private final int available;
    private final int requested;

    public InsufficientStockException(String productName, int available, int requested) {
        super("Stock insuficiente para " + productName
                + ". Disponible: " + available
                + ". Solicitado: " + requested + ".");
        this.productName = productName;
        this.available = available;
        this.requested = requested;
    }

    public String getProductName() {
        return productName;
    }

    public int getAvailable() {
        return available;
    }

    public int getRequested() {
        return requested;
    }
}
