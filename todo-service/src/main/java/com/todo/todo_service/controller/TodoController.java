package com.todo.todo_service.controller;

import com.todo.todo_service.generated.api.TodoApi;
import com.todo.todo_service.generated.model.*;
import com.todo.todo_service.service.TodoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class TodoController implements TodoApi {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @Override
    public ResponseEntity<TodoResponse> createTodo(
            @NotNull String xUser,
            @Valid TodoRequest request) {
        return ResponseEntity.ok(todoService.createTodo(request, xUser));
    }

    @Override
    public ResponseEntity<List<TodoResponse>> getFilteredTodos(
            String xUser,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return ResponseEntity.ok(todoService.getFilteredTodos(xUser, status, search, startDate, endDate));
    }

    @Override
    public ResponseEntity<TodoResponse> updateTodo(
            @NotNull String xUser,
            Integer id,
            @Valid TodoRequest request) {
        return ResponseEntity.ok(todoService.updateTodo(id, request, xUser));
    }

    @Override
    public ResponseEntity<TodoResponse> toggleTodo(
            @NotNull String xUser,
            Integer id,
            @Valid ToggleTodoRequest toggleTodoRequest) {
        Boolean completed = toggleTodoRequest.getCompleted();
        return ResponseEntity.ok(todoService.toggleTodo(id, completed, xUser));
    }

    @Override
    public ResponseEntity<DeleteTodo200Response> deleteTodo(Integer id) {
        todoService.deleteTodo(id);
        DeleteTodo200Response res = new DeleteTodo200Response();
        res.setMessage("Todo deleted successfully");
        return ResponseEntity.ok(res);
    }
}
