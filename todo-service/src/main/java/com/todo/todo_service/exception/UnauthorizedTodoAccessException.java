package com.todo.todo_service.exception;

public class UnauthorizedTodoAccessException extends RuntimeException {
    public UnauthorizedTodoAccessException(String message) {
        super(message);
    }
}
