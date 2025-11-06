package com.todo.auth_service.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health Check API", description = "API to check the status of Auth service.")
public class HealthCheckController {

    @GetMapping("/health-check")
    public String hello() {
        return "Auth service is up..";
    }
}

