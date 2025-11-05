package com.todo.todo_service.service;

import com.todo.todo_service.dto.TodoRequest;
import com.todo.todo_service.dto.TodoResponse;
import com.todo.todo_service.exception.TodoNotFoundException;
import com.todo.todo_service.exception.UnauthorizedTodoAccessException;
import com.todo.todo_service.exception.UserNotFoundException;
import com.todo.todo_service.model.Todo;
import com.todo.todo_service.repo.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserValidator userValidator;

    public TodoService(TodoRepository todoRepository, UserValidator userValidator) {
        this.todoRepository = todoRepository;
        this.userValidator = userValidator;
    }

    // 🔹 Create Todo
    public TodoResponse createTodo(TodoRequest request, String username) {
        if (!userValidator.userExists(username)) {
            throw new UserNotFoundException("User does not exist: " + username);
        }

        Todo todo = toEntity(request, username);
        Todo saved = todoRepository.save(todo);
        return toResponse(saved);
    }

    // 🔹 Get all todos for user
    public List<TodoResponse> getTodosByUser(String username) {
        return todoRepository.findByUsername(username)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 🔹 Update Todo
    public TodoResponse updateTodo(Long id, TodoRequest request, String username) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException("Todo not found with id: " + id));

        if (!todo.getUsername().equals(username)) {
            throw new UnauthorizedTodoAccessException("You are not allowed to modify this todo");
        }

        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.isCompleted());
        Todo saved = todoRepository.save(todo);
        return toResponse(saved);
    }

    public TodoResponse toggleTodo(Long id, boolean completed, String username) {
        Todo todo = todoRepository.findByIdAndUsername(id, username)
                .orElseThrow(() -> new TodoNotFoundException("Todo not found for user: " + username));

        System.out.println(todoRepository.findById(id).get().isCompleted());
        System.out.println(completed);
        todo.setCompleted(!completed);
        todoRepository.save(todo);

        return toResponse(todo);
    }

    // 🔹 Delete Todo
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new TodoNotFoundException("Todo not found with id: " + id);
        }
        todoRepository.deleteById(id);
    }

    // ✅ Helper: DTO → Entity
    private Todo toEntity(TodoRequest request, String username) {
        Todo todo = new Todo();
        todo.setUsername(username);
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.isCompleted());
        return todo;
    }

    // ✅ Helper: Entity → DTO
    private TodoResponse toResponse(Todo todo) {
        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setUsername(todo.getUsername());
        response.setTitle(todo.getTitle());
        response.setDescription(todo.getDescription());
        response.setCompleted(todo.isCompleted());
        response.setCreatedAt(todo.getCreatedAt());
        response.setUpdatedAt(todo.getUpdatedAt());
        return response;
    }
}
