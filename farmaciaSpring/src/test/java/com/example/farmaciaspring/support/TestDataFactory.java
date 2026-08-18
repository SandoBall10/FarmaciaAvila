package com.example.farmaciaspring.support;

import com.example.farmaciaspring.dto.VentaLineaRequestDTO;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.model.Role;
import com.example.farmaciaspring.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Set;

public final class TestDataFactory {

    private TestDataFactory() {
    }

    public static Producto producto(String nombre, double precio, int stock) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setCantidad(stock);
        producto.setFechaVencimiento(LocalDate.now().plusYears(1));
        producto.setDescripcion("Producto de prueba");
        producto.setCategoria("Pruebas");
        return producto;
    }

    public static Cliente cliente(String nombre) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre);
        cliente.setApellidos("Prueba");
        cliente.setEmail(nombre.toLowerCase() + "@test.com");
        cliente.setTelefono("999111222");
        return cliente;
    }

    public static VentaLineaRequestDTO linea(int idProducto, int cantidad) {
        VentaLineaRequestDTO linea = new VentaLineaRequestDTO();
        linea.setIdproducto(idProducto);
        linea.setCantidad(cantidad);
        return linea;
    }

    public static Role rol(String nombre) {
        Role role = new Role();
        role.setName(nombre);
        return role;
    }

    public static User usuario(String username, String rawPassword, Role role, PasswordEncoder encoder) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(rawPassword));
        user.setNombre(username);
        user.setApellido("Test");
        user.setEmail(username + "@farmacia.test");
        user.setRoles(Set.of(role));
        return user;
    }
}
