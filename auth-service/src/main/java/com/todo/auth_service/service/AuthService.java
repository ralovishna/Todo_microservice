package com.todo.auth_service.service;

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

    public String register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("User already exists!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!";
    }

    public String login(User user) {
        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));
        if (!existingUser.getPassword().equals(user.getPassword())) {
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
