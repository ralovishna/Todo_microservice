package com.todo.auth_service.controller;

import com.todo.auth_service.model.User;
import com.todo.auth_service.service.AuthService;
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
    public ResponseEntity<?> register(@RequestBody User user) {
        return ResponseEntity.ok(Map.of("message", authService.register(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String token = authService.login(user);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/exists/{username}")
    public ResponseEntity<?> userExists(@PathVariable String username) {
        boolean exists = authService.userExists(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }


    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader("Authorization") String token) {
        boolean valid = authService.validateToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
