package com.todo.todo_service.config;

import com.todo.todo_service.service.AuthClient;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final AuthClient authClient;

    public JwtAuthFilter(AuthClient authClient) {
        this.authClient = authClient;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("🟡 [TodoService] Incoming request → " + path);

        if (shouldNotFilter(request)) {
            System.out.println("🟢 [TodoService] Skipping filter for path: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String xUserHeader = request.getHeader("X-User");

        // 🔒 Check Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
            System.out.println("❌ [TodoService] Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        System.out.println("🔹 [TodoService] Received Token: " + token);

        // ✅ Validate Token via Auth Service
        boolean valid;
        try {
            valid = authClient.validateToken(token);
            System.out.println("🔹 [TodoService] Token Valid? " + valid);
        } catch (Exception e) {
            e.printStackTrace();
            writeError(response, HttpStatus.UNAUTHORIZED, "Error validating token");
            System.out.println("❌ [TodoService] Exception while validating token: " + e.getMessage());
            return;
        }

        if (!valid) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            System.out.println("❌ [TodoService] Invalid or expired token");
            return;
        }

        // ✅ Ensure X-User header (from Gateway)
        if (xUserHeader == null || xUserHeader.isBlank()) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Missing X-User header");
            System.out.println("❌ [TodoService] Missing X-User header");
            return;
        }

        System.out.println("✅ [TodoService] Auth successful for user: " + xUserHeader);

        // ✅ Set authentication context (fixes 403)
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        xUserHeader,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        System.out.println("🔐 [TodoService] SecurityContext updated for user: " + xUserHeader);

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String msg) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + msg + "\"}");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator");
    }
}
