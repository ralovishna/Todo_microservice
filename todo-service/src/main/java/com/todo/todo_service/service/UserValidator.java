package com.todo.todo_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class UserValidator {

    private final RestTemplate restTemplate;

    public UserValidator(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean userExists(String username) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    "http://AUTH-SERVICE/auth/exists/{username}",
                    Map.class,
                    username
            );

            return response != null && Boolean.TRUE.equals(response.get("exists"));
        } catch (Exception e) {
            System.err.println("❌ [UserValidator] Error checking user existence: " + e.getMessage());
            return false;
        }
    }
}
