package com.todo.auth_service.service;

import com.todo.auth_service.dto.LoginRequest;
import com.todo.auth_service.dto.RegisterRequest;
import com.todo.auth_service.dto.UserResponse;
import com.todo.auth_service.exception.InvalidCredentialsException;
import com.todo.auth_service.exception.UserAlreadyExistsException;
import com.todo.auth_service.exception.UserNotFoundException;
import com.todo.auth_service.model.User;
import com.todo.auth_service.repo.UserRepository;
import com.todo.auth_service.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("User already exists!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return new UserResponse(user.getId(), user.getUsername(), "User registered successfully!");
    }

    public String login(LoginRequest request) {
        User existingUser = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        if (!passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials!");
        }

        return jwtUtil.generateToken(existingUser.getUsername());
    }

    public boolean userExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
