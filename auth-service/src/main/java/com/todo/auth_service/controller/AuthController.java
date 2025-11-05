package com.todo.auth_service.controller;

import com.todo.auth_service.dto.LoginRequest;
import com.todo.auth_service.dto.RegisterRequest;
import com.todo.auth_service.dto.UserResponse;
import com.todo.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/exists/{username}")
    public ResponseEntity<Map<String, Boolean>> userExists(@PathVariable String username) {
        boolean exists = authService.userExists(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validate(@RequestHeader("Authorization") String token) {
        boolean valid = authService.validateToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
