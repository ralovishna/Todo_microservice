package com.todo.todo_service.controller;

import com.todo.todo_service.dto.TodoRequest;
import com.todo.todo_service.dto.TodoResponse;
import com.todo.todo_service.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping
    public ResponseEntity<TodoResponse> create(
            @RequestHeader("X-User") String username,
            @Valid @RequestBody TodoRequest request) {
        return ResponseEntity.ok(todoService.createTodo(request, username));
    }

    @GetMapping
    public ResponseEntity<List<TodoResponse>> getTodos(
            @RequestHeader("X-User") String username) {
        return ResponseEntity.ok(todoService.getTodosByUser(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> update(
            @RequestHeader("X-User") String username,
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request) {
        return ResponseEntity.ok(todoService.updateTodo(id, request, username));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TodoResponse> toggleTodo(
            @RequestHeader("X-User") String username,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {

        Boolean completed = request.get("completed");
        if (completed == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(todoService.toggleTodo(id, completed, username));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.ok().build();
    }
}
