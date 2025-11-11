package com.todo.auth_service.config; // or com.todo.todo_service for todo-service

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@EnableAspectJAutoProxy
@ComponentScan(basePackages = "com.todo.audit_service")
public class AuditConfig {
}