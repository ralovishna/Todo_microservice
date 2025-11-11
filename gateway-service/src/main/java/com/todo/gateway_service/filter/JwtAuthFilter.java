package com.todo.gateway_service.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.security.Key;
import java.util.UUID;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String requestId = generateOrGetRequestId(exchange);

        // ALWAYS inject X-Request-Id (even for public routes)
        ServerWebExchange.Builder exchangeBuilder = exchange.mutate()
                .request(r -> r.headers(headers -> headers.set("X-Request-Id", requestId)));

        if (isPublicRoute(path)) {
            log.info("PUBLIC ROUTE → {} {} | Request-ID: {}",
                    exchange.getRequest().getMethod(), path, requestId);
            return chain.filter(exchangeBuilder.build());
        }

        return validateJwtAndForward(exchange, chain, exchangeBuilder, requestId);
    }

    private String generateOrGetRequestId(ServerWebExchange exchange) {
        String id = exchange.getRequest().getId();
        if (id != null && !id.isBlank()) {
            return id;
        }
        String newId = UUID.randomUUID().toString().substring(0, 8);
        log.debug("Generated new Request-ID: {}", newId);
        return newId;
    }

    private boolean isPublicRoute(String path) {
        return path.startsWith("/auth")
                || path.startsWith("/actuator")
                || path.startsWith("/webjars")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    private Mono<Void> validateJwtAndForward(
            ServerWebExchange exchange,
            GatewayFilterChain chain,
            ServerWebExchange.Builder exchangeBuilder,
            String requestId) {

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing Authorization header | Request-ID: {}", requestId);
            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            String roles = claims.get("roles", String.class);

            if (username == null || username.isBlank()) {
                log.warn("JWT has no subject (username) | Request-ID: {}", requestId);
                return onError(exchange, "Invalid JWT: missing username", HttpStatus.UNAUTHORIZED);
            }

            // Final mutated exchange with all headers
            ServerWebExchange finalExchange = exchangeBuilder
                    .request(r -> r.headers(h -> {
                        h.set("X-User", username);
                        h.set("X-Roles", roles != null ? roles : "ROLE_USER");
                        h.set("X-Request-Id", requestId);
                    }))
                    .build();

            log.info("AUTHENTICATED → User: {} | Method: {} {} | Request-ID: {}",
                    username, exchange.getRequest().getMethod(),
                    exchange.getRequest().getURI().getPath(), requestId);

            return chain.filter(finalExchange);

        } catch (Exception e) {
            log.error("JWT Validation failed | Request-ID: {} | Error: {}", requestId, e.getMessage());
            return onError(exchange, "Invalid or expired JWT", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        log.warn("ACCESS DENIED → {} | Status: {} | Path: {}",
                message, status.value(), exchange.getRequest().getURI().getPath());
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                .bufferFactory().wrap(("{ \"error\": \"" + message + "\" }").getBytes())));
    }

    @Override
    public int getOrder() {
        return -100; // Run as early as possible
    }
}