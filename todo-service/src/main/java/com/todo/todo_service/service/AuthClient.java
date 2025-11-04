package com.todo.todo_service.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthClient {

    private final RestTemplate restTemplate;

    // ✅ Inject the load-balanced RestTemplate from AppConfig
    public AuthClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean validateToken(String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    "http://AUTH-SERVICE/api/auth/validate",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            return body != null && Boolean.TRUE.equals(body.get("valid"));
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
