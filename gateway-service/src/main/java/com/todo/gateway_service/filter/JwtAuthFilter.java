package com.todo.gateway_service.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // ✅ Skip public endpoints
        if (isPublicRoute(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            // ✅ Modern JJWT syntax
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            String roles = claims.get("roles", String.class);

            // ✅ Attach headers for downstream services
            ServerWebExchange mutated = exchange.mutate()
                    .request(r -> r.headers(h -> {
                        h.add("X-User", username);
                        h.add("X-Roles", roles != null ? roles : "ROLE_USER");
                    }))
                    .build();

            System.out.println("Forwarding headers: " + mutated.getRequest().getHeaders());

            return chain.filter(mutated);

        } catch (Exception e) {
            e.printStackTrace();
            return onError(exchange, "Invalid JWT: " + e.getMessage());
        }
    }

    private boolean isPublicRoute(String path) {
        // Adjust for your auth routes
        return path.startsWith("/auth") || path.contains("/actuator");
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Run early
    }
}
