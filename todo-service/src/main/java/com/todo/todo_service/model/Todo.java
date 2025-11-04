package com.todo.todo_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "todos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;   // foreign key reference to User.username
    private String title;
    private String description;
    private boolean completed = false;

    public Todo(String username, String title, String description, boolean completed) {
        this.username = username;
        this.title = title;
        this.description = description;
        this.completed = completed;
    }

    // Getters and Setters
}
