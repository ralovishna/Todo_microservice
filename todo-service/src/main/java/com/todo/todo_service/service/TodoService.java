package com.todo.todo_service.service;

import com.todo.todo_service.model.Todo;
import com.todo.todo_service.repo.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserValidator userValidator;

    public TodoService(TodoRepository todoRepository, UserValidator userValidator) {
        this.todoRepository = todoRepository;
        this.userValidator = userValidator;
    }

    public Todo createTodo(Todo todo) {
        if (!userValidator.userExists(todo.getUsername())) {
            throw new RuntimeException("User does not exist");
        }
        return todoRepository.save(todo);
    }

    public List<Todo> getTodosByUser(String username) {
        return todoRepository.findByUsername(username);
    }

    public Todo updateTodo(Long id, Todo updated) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUsername().equals(updated.getUsername())) {
            throw new RuntimeException("Unauthorized to edit this todo");
        }
        todo.setTitle(updated.getTitle());
        todo.setDescription(updated.getDescription());
        todo.setCompleted(updated.isCompleted());
        return todoRepository.save(todo);
    }

    public void deleteTodo(Long id) {
        todoRepository.deleteById(id);
    }
}
