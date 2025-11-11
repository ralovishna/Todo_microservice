package com.todo.audit_service.audit;

import com.todo.audit_service.repo.AuditRepository;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Aspect
@Component
@Slf4j
public class AuditAspect {

    private static final Pattern CREATE_PATTERN = Pattern.compile(".*(create|save|add|register).*", Pattern.CASE_INSENSITIVE);
    private static final Pattern UPDATE_PATTERN = Pattern.compile(".*(update|edit|patch).*", Pattern.CASE_INSENSITIVE);
    private static final Pattern DELETE_PATTERN = Pattern.compile(".*(delete|remove).*", Pattern.CASE_INSENSITIVE);

    private final AuditRepository repo;

    public AuditAspect(AuditRepository repo) {
        this.repo = repo;
    }

    @AfterReturning("execution(* *..*Controller.*(..))")
    public void logAction(JoinPoint jp) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            log.debug("No request context. Skipping audit.");
            return;
        }

        try {
            HttpServletRequest request = attrs.getRequest();
            String methodName = jp.getSignature().getName();
            String service = jp.getSignature().getDeclaringType().getSimpleName().replace("Controller", "");

            String userId = getHeader(request, "X-User", "ANONYMOUS");
            String requestId = getHeader(request, "X-Request-Id", "NO-ID");

            Span span = Span.current();
            String traceId = null;
            String spanId = null;
            String traceFlags = "00";

            if (span != null && span.getSpanContext().isValid()) {
                SpanContext ctx = span.getSpanContext();
                traceId = ctx.getTraceId();
                spanId = ctx.getSpanId();
                traceFlags = ctx.isSampled() ? "01" : "00";
            }

            AuditLog.Action action = determineAction(methodName.toLowerCase());

            AuditLog log = AuditLog.builder()
                    .traceId(traceId)
                    .spanId(spanId)
                    .traceFlags(traceFlags)
                    .requestId(requestId)
                    .userId(userId)
                    .action(action)
                    .service(service)
                    .ipAddress(request.getRemoteAddr())
                    .details("{}")
                    .timestamp(LocalDateTime.now())
                    .build();

            repo.save(log);

        } catch (Exception e) {
            log.error("AUDIT FAILED | method={} | error={}", jp.getSignature(), e.getMessage(), e);
        }
    }

    private String getHeader(HttpServletRequest request, String name, String fallback) {
        String value = request.getHeader(name);
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private AuditLog.Action determineAction(String methodName) {
        if (methodName.contains("login")) return AuditLog.Action.LOGIN_SUCCESS;
        if (methodName.contains("logout")) return AuditLog.Action.LOGOUT;
        if (CREATE_PATTERN.matcher(methodName).matches()) return AuditLog.Action.CREATE;
        if (UPDATE_PATTERN.matcher(methodName).matches()) return AuditLog.Action.UPDATE;
        if (DELETE_PATTERN.matcher(methodName).matches()) return AuditLog.Action.DELETE;
        return AuditLog.Action.READ;
    }
}