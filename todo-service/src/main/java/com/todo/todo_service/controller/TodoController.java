package com.todo.todo_service.controller;

import com.todo.todo_service.model.Todo;
import com.todo.todo_service.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping
    public ResponseEntity<Todo> create(@RequestHeader("X-User") String username, @RequestBody Todo todo) {
        todo.setUsername(username);
        return ResponseEntity.ok(todoService.createTodo(todo));
    }

    @GetMapping
    public ResponseEntity<List<Todo>> getTodos(@RequestHeader("X-User") String username) {
        return ResponseEntity.ok(todoService.getTodosByUser(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(@PathVariable Long id, @RequestBody Todo todo) {
        return ResponseEntity.ok(todoService.updateTodo(id, todo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
