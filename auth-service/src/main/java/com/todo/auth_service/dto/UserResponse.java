package com.todo.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String message;
}
