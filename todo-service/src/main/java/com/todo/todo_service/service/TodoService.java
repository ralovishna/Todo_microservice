package com.todo.todo_service.service;

import com.todo.todo_service.generated.model.TodoRequest;
import com.todo.todo_service.generated.model.TodoResponse;
import com.todo.todo_service.model.Todo;
import com.todo.todo_service.repo.TodoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    // ✅ Create new todo
    public TodoResponse createTodo(TodoRequest request, String username) {
        Todo todo = new Todo(
                username,
                request.getTitle(),
                request.getDescription(),
                request.getCompleted() != null ? request.getCompleted() : false
        );
        todoRepository.save(todo);
        return toResponse(todo);
    }

    // ✅ Filtered retrieval (status + search + date range)
    public List<TodoResponse> getFilteredTodos(
            String username,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate
    ) {
        OffsetDateTime start = startDate != null ? startDate.atStartOfDay().atOffset(ZoneOffset.UTC) : null;
        OffsetDateTime end = endDate != null ? endDate.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC) : null;

        return todoRepository.findByFilters(username, status, search, start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ Update existing todo
    public TodoResponse updateTodo(Integer id, TodoRequest request, String username) {
        Todo todo = todoRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new EntityNotFoundException("Todo not found"));
        if (!todo.getUsername().equals(username)) {
            throw new SecurityException("You cannot modify this todo");
        }
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.getCompleted() != null && request.getCompleted());
        todoRepository.save(todo);
        return toResponse(todo);
    }

    // ✅ Toggle completion
    public TodoResponse toggleTodo(Integer id, Boolean completed, String username) {
        Todo todo = todoRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new EntityNotFoundException("Todo not found"));
        if (!todo.getUsername().equals(username)) {
            throw new SecurityException("You cannot modify this todo");
        }
        todo.setCompleted(completed);
        todoRepository.save(todo);
        return toResponse(todo);
    }

    // ✅ Delete todo
    public void deleteTodo(Integer id) {
        if (!todoRepository.existsById(Long.valueOf(id))) {
            throw new EntityNotFoundException("Todo not found");
        }
        todoRepository.deleteById(Long.valueOf(id));
    }

    // ✅ Mapping utility
    private TodoResponse toResponse(Todo todo) {
        TodoResponse res = new TodoResponse();
        res.setId(todo.getId().intValue());
        res.setUsername(todo.getUsername());
        res.setTitle(todo.getTitle());
        res.setDescription(todo.getDescription());
        res.setCompleted(todo.isCompleted());
        res.setCreatedAt(todo.getCreatedAt());
        res.setUpdatedAt(todo.getUpdatedAt());
        return res;
    }
}
