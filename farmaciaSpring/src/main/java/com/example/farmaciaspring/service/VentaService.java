package com.example.farmaciaspring.service;

import com.example.farmaciaspring.dto.ClienteResumenDTO;
import com.example.farmaciaspring.dto.ProductoResumenDTO;
import com.example.farmaciaspring.dto.VentaDetalleResponseDTO;
import com.example.farmaciaspring.dto.VentaLineaRequestDTO;
import com.example.farmaciaspring.dto.VentaListItemDTO;
import com.example.farmaciaspring.dto.VentaRequestDTO;
import com.example.farmaciaspring.dto.VentaResponseDTO;
import com.example.farmaciaspring.mapper.VentaMapper;
import com.example.farmaciaspring.exception.BusinessException;
import com.example.farmaciaspring.exception.InsufficientStockException;
import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.model.Cliente;
import com.example.farmaciaspring.model.Producto;
import com.example.farmaciaspring.model.Venta;
import com.example.farmaciaspring.model.VentaDetalle;
import com.example.farmaciaspring.repository.ClientesRepository;
import com.example.farmaciaspring.repository.ProductoRepository;
import com.example.farmaciaspring.repository.VentaDetalleRepository;
import com.example.farmaciaspring.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final VentaDetalleRepository ventaDetalleRepository;
    private final ProductoRepository productoRepository;
    private final ClientesRepository clientesRepository;

    public VentaService(VentaRepository ventaRepository,
                        VentaDetalleRepository ventaDetalleRepository,
                        ProductoRepository productoRepository,
                        ClientesRepository clientesRepository) {
        this.ventaRepository = ventaRepository;
        this.ventaDetalleRepository = ventaDetalleRepository;
        this.productoRepository = productoRepository;
        this.clientesRepository = clientesRepository;
    }

    public List<VentaListItemDTO> getAllVentas() {
        return ventaRepository.findAll().stream()
                .map(VentaMapper::toListItem)
                .toList();
    }

    @Transactional
    public VentaResponseDTO registrarVenta(VentaRequestDTO request) {
        return registrarVenta(request.getIdcliente(), request.getFechaRegistro(), request.getDetalles());
    }

    @Transactional(readOnly = true)
    public VentaResponseDTO getVentaCompleta(int id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
        return toResponse(venta);
    }

    @Transactional
    public VentaResponseDTO registrarVenta(int idCliente, LocalDate fechaRegistro, List<VentaLineaRequestDTO> lineas) {
        clientesRepository.findById(idCliente)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        if (lineas == null || lineas.isEmpty()) {
            throw new BusinessException("La venta debe incluir al menos un producto");
        }

        List<VentaLineaRequestDTO> lineasOrdenadas = new ArrayList<>(lineas);
        lineasOrdenadas.sort(Comparator.comparingInt(VentaLineaRequestDTO::getIdproducto));

        double total = 0;
        List<VentaDetalle> detalles = new ArrayList<>();

        for (VentaLineaRequestDTO linea : lineasOrdenadas) {
            if (linea.getCantidad() <= 0) {
                throw new BusinessException("La cantidad debe ser mayor que cero");
            }

            Producto producto = productoRepository.findByIdForUpdate(linea.getIdproducto())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado: " + linea.getIdproducto()));

            if (producto.getCantidad() < linea.getCantidad()) {
                throw new InsufficientStockException(
                        producto.getNombre(), producto.getCantidad(), linea.getCantidad());
            }

            producto.setCantidad(producto.getCantidad() - linea.getCantidad());
            productoRepository.save(producto);

            VentaDetalle detalle = new VentaDetalle();
            detalle.setIdproducto(producto.getId());
            detalle.setCantidad(linea.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalles.add(detalle);

            total += producto.getPrecio() * linea.getCantidad();
        }

        Venta venta = new Venta();
        venta.setIdcliente(idCliente);
        venta.setFechaRegistro(fechaRegistro != null ? fechaRegistro : LocalDate.now());
        venta.setPrecioTotal(total);
        Venta nuevaVenta = ventaRepository.save(venta);

        for (VentaDetalle detalle : detalles) {
            detalle.setIdventa(nuevaVenta.getId());
            ventaDetalleRepository.save(detalle);
        }

        return toResponse(nuevaVenta);
    }

    private VentaResponseDTO toResponse(Venta venta) {
        VentaResponseDTO dto = new VentaResponseDTO();
        dto.setId(venta.getId());
        dto.setIdcliente(venta.getIdcliente());
        dto.setFechaRegistro(venta.getFechaRegistro());
        dto.setPrecioTotal(venta.getPrecioTotal());

        clientesRepository.findById(venta.getIdcliente()).ifPresent(cliente ->
                dto.setCliente(toClienteResumen(cliente)));

        List<VentaDetalleResponseDTO> detalles = new ArrayList<>();
        for (VentaDetalle detalle : ventaDetalleRepository.findByIdventa(venta.getId())) {
            detalles.add(toDetalleResponse(detalle));
        }
        dto.setDetalles(detalles);
        return dto;
    }

    private ClienteResumenDTO toClienteResumen(Cliente cliente) {
        return new ClienteResumenDTO(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getApellidos(),
                cliente.getEmail(),
                cliente.getTelefono()
        );
    }

    private VentaDetalleResponseDTO toDetalleResponse(VentaDetalle detalle) {
        Producto producto = productoRepository.findById(detalle.getIdproducto()).orElse(null);
        double precioUnitario = detalle.getPrecioUnitario() != null
                ? detalle.getPrecioUnitario()
                : (producto != null ? producto.getPrecio() : 0);

        VentaDetalleResponseDTO dto = new VentaDetalleResponseDTO();
        dto.setId(detalle.getId());
        dto.setIdproducto(detalle.getIdproducto());
        dto.setCantidad(detalle.getCantidad());
        dto.setPrecioUnitario(precioUnitario);
        dto.setSubtotal(precioUnitario * detalle.getCantidad());
        if (producto != null) {
            dto.setProducto(new ProductoResumenDTO(producto.getId(), producto.getNombre()));
        }
        return dto;
    }
}
