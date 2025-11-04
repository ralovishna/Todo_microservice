package com.todo.gateway_service.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final WebClient.Builder webClientBuilder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthFilter(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        System.out.println("🟡 [Gateway] Incoming request → " + path);


        // ✅ Allow open routes
        if (isPublicRoute(path)) {
            System.out.println("🟢 [Gateway] Public route → skipping authentication");
            return chain.filter(exchange);
        }

        // 🔒 Require Authorization header
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ [Gateway] Missing or invalid Authorization header");
            return onError(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        System.out.println("🟢 [Gateway] Validating token via AUTH-SERVICE...");

        // ✅ Step 1: Validate with AUTH-SERVICE
        return webClientBuilder.build()
                .get()
                .uri("lb://AUTH-SERVICE/api/auth/validate")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    System.out.println("🟢 [Gateway] Auth validation response: " + response);

                    Boolean valid = (Boolean) response.get("valid");
                    if (Boolean.TRUE.equals(valid)) {
                        String username = extractUsername(token);
                        System.out.println("✅ [Gateway] JWT valid. Username → " + username);

                        // ✅ Add headers and forward downstream
                        ServerWebExchange mutatedExchange = exchange.mutate()
                                .request(r -> r.headers(h -> {
                                    h.set(HttpHeaders.AUTHORIZATION, authHeader);
                                    h.set("X-User", username);
                                }))
                                .build();

                        return chain.filter(mutatedExchange);
                    } else {
                        System.out.println("❌ [Gateway] Invalid JWT token (AuthService returned false)");
                        return onError(exchange, "Invalid JWT token");
                    }
                })
                .onErrorResume(e -> {
                    System.out.println("❌ [Gateway] Error while validating JWT → " + e.getMessage());
                    e.printStackTrace();
                    return onError(exchange, "Error validating token: " + e.getMessage());
                });
    }

    private boolean isPublicRoute(String path) {
        return path.startsWith("/api/auth")
                || path.startsWith("/eureka")
                || path.contains("/actuator");
    }

    private String extractUsername(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            System.out.println("⚠️ [Gateway] Failed to extract username → " + e.getMessage());
            return "unknown";
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message) {
        System.out.println("❌ [Gateway] Rejecting request → " + message);
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("error", message);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
