package com.example.farmaciaspring.dto;

public class LoginResponseDTO {
    private String token;
    private LoginUserDTO user;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String token, LoginUserDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LoginUserDTO getUser() {
        return user;
    }

    public void setUser(LoginUserDTO user) {
        this.user = user;
    }
}
