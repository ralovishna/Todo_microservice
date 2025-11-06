// src/main/java/com/todo/auth_service/dto/RegisterRequest.java
package com.todo.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6)
    private String password;
}