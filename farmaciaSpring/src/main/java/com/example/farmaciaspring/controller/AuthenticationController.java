package com.example.farmaciaspring.controller;

import com.example.farmaciaspring.dto.LoginRequestDTO;
import com.example.farmaciaspring.dto.LoginResponseDTO;
import com.example.farmaciaspring.dto.LoginUserDTO;
import com.example.farmaciaspring.dto.UserResponseDTO;
import com.example.farmaciaspring.model.User;
import com.example.farmaciaspring.service.UserService;
import com.example.farmaciaspring.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthenticationController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<LoginResponseDTO> authenticate(@Valid @RequestBody LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(
                userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().getAuthority()
        );

        User user = userService.findByUsername(request.getUsername());
        UserResponseDTO safeUser = userService.toResponse(user);

        LoginUserDTO userPayload = new LoginUserDTO();
        userPayload.setId(safeUser.getId());
        userPayload.setUsername(safeUser.getUsername());
        userPayload.setNombre(safeUser.getNombre());
        userPayload.setApellido(safeUser.getApellido());
        userPayload.setEmail(safeUser.getEmail());
        userPayload.setRole(user.getRoles().iterator().next().getName());

        return ResponseEntity.ok(new LoginResponseDTO(token, userPayload));
    }
}
