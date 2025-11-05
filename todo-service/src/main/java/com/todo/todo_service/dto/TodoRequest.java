package com.todo.todo_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TodoRequest {
    @NotBlank(message = "Title cannot be empty")
    private String title;

    private String description;
    private boolean completed;
}
