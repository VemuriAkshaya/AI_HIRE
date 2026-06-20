package com.aihire.backend.dto;

import com.aihire.backend.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private String skills;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private UserResponse user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private Role role;
        private String skills;
        private LocalDateTime createdAt;
    }
}
