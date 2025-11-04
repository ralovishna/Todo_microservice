package com.todo.todo_service.repo;

import com.todo.todo_service.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUsername(String username);
}
