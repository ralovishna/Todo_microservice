package com.todo.auth_service.controller;

import com.todo.auth_service.generated.api.AuthApi;
import com.todo.auth_service.generated.model.*;
import com.todo.auth_service.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController implements AuthApi {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public ResponseEntity<UserResponse> registerUser(RegisterRequest request) {
        var dto = new com.todo.auth_service.dto.RegisterRequest();
        dto.setUsername(request.getUsername());
        dto.setPassword(request.getPassword());

        var serviceResp = authService.register(dto);

        var genResp = new UserResponse();
        genResp.setId(serviceResp.getId());
        genResp.setUsername(serviceResp.getUsername());

        return ResponseEntity.ok(genResp);
    }

    @Override
    public ResponseEntity<LoginUser200Response> loginUser(LoginRequest request) {
        var dto = new com.todo.auth_service.dto.LoginRequest();
        dto.setUsername(request.getUsername());
        dto.setPassword(request.getPassword());

        String token = authService.login(dto);
        return ResponseEntity.ok(new LoginUser200Response().token(token));
    }

    @Override
    public ResponseEntity<UserExists200Response> userExists(String username) {
        boolean exists = authService.userExists(username);
        return ResponseEntity.ok(new UserExists200Response().exists(exists));
    }

    @Override
    public ResponseEntity<ValidateToken200Response> validateToken(String authorization) {
//        String token = authorization.replace("Bearer ", "");
        String token = authorization != null ? authorization.replace("Bearer ", "") : "";

        boolean valid = authService.validateToken(token);
        return ResponseEntity.ok(new ValidateToken200Response().valid(valid));
    }
}