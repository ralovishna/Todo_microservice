package com.todo.todo_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class GatewayHeaderAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
//        request.setAttribute("X-User", "ralo");

        String xUser = request.getHeader("X-User");
        String xRoles = request.getHeader("X-Roles");
        System.out.println("\n\n\n\n" + xUser + " and " + xRoles);
//        String xUser = "ralo";
//        String xRoles = "ROLE_USER";

        if (xUser == null || xUser.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Missing X-User header\"}");
            return;
        }

        // ✅ Build Spring Authentication from Gateway headers
        List<SimpleGrantedAuthority> authorities = Arrays.stream(xRoles.split(","))
                .map(SimpleGrantedAuthority::new)
                .toList();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(xUser, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}

