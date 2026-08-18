package com.example.farmaciaspring.service;

import com.example.farmaciaspring.dto.RoleDTO;
import com.example.farmaciaspring.dto.UserRequestDTO;
import com.example.farmaciaspring.dto.UserResponseDTO;
import com.example.farmaciaspring.exception.BusinessException;
import com.example.farmaciaspring.exception.ResourceNotFoundException;
import com.example.farmaciaspring.model.Role;
import com.example.farmaciaspring.model.User;
import com.example.farmaciaspring.repository.RoleRepository;
import com.example.farmaciaspring.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponseDTO> getUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Long id) {
        return toResponse(findUser(id));
    }

    public UserResponseDTO createUser(UserRequestDTO request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("La contraseña es obligatoria");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("El nombre de usuario ya existe", HttpStatus.CONFLICT);
        }
        User user = new User();
        applyRequest(user, request, true);
        return toResponse(userRepository.save(user));
    }

    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        User userActual = findUser(id);
        if (!userActual.getUsername().equals(request.getUsername())
                && userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("El nombre de usuario ya existe", HttpStatus.CONFLICT);
        }
        applyRequest(userActual, request, false);
        return toResponse(userRepository.save(userActual));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        userRepository.deleteById(id);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void applyRequest(User user, UserRequestDTO request, boolean creating) {
        user.setUsername(request.getUsername());
        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setEmail(request.getEmail());
        if (creating || (request.getPassword() != null && !request.getPassword().isBlank())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRoles(resolveRoles(request.getRoles()));
    }

    private Set<Role> resolveRoles(Set<RoleDTO> roles) {
        Set<Role> resolved = new HashSet<>();
        for (RoleDTO roleDto : roles) {
            Role role = roleRepository.findById(roleDto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
            resolved.add(role);
        }
        return resolved;
    }

    public UserResponseDTO toResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNombre(user.getNombre());
        dto.setApellido(user.getApellido());
        dto.setEmail(user.getEmail());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                    .map(role -> new RoleDTO(role.getId(), role.getName()))
                    .collect(Collectors.toSet()));
        }
        return dto;
    }
}
