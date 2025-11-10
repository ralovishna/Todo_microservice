package com.todo.todo_service.controller;

import com.todo.todo_service.generated.api.TodoApi;
import com.todo.todo_service.generated.model.*;
import com.todo.todo_service.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
public class TodoController implements TodoApi {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @Override
    public ResponseEntity<TodoResponse> createTodo(
            @jakarta.validation.constraints.NotNull String xUser,
            @Valid TodoRequest request) {
        return ResponseEntity.ok(todoService.createTodo(request, xUser));
    }

    @Override
    public ResponseEntity<PaginatedTodoResponse> getFilteredTodos(
            String xUser,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "1") Integer page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") Integer size) {

        PaginatedTodoResponse response = todoService.getFilteredTodos(
                xUser, status, search, startDate, endDate, page, size);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<TodoResponse> updateTodo(
            @jakarta.validation.constraints.NotNull String xUser,
            Long id,
            @Valid TodoRequest request) {
        return ResponseEntity.ok(todoService.updateTodo(id, request, xUser));
    }

    @Override
    public ResponseEntity<TodoResponse> toggleTodo(
            @jakarta.validation.constraints.NotNull String xUser,
            Long id,
            @Valid ToggleTodoRequest toggleTodoRequest) {
        Boolean completed = toggleTodoRequest.getCompleted();
        return ResponseEntity.ok(todoService.toggleTodo(id, completed, xUser));
    }

    @Override
    public ResponseEntity<DeleteTodo200Response> deleteTodo(Long id) {
        todoService.deleteTodo(id);
        DeleteTodo200Response res = new DeleteTodo200Response();
        res.setMessage("Todo deleted successfully");
        return ResponseEntity.ok(res);
    }
}