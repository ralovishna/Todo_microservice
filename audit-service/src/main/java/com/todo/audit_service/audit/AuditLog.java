package com.todo.audit_service.audit;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_trace_id", columnList = "trace_id"),
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "trace_id", length = 32, nullable = false)
    private String traceId;
    @Column(name = "span_id", length = 16, nullable = false)
    private String spanId;
    @Column(name = "trace_flags", length = 2)
    private String traceFlags = "01";
    @Column(name = "request_id", length = 50)
    private String requestId;
    @Column(name = "user_id", length = 100, nullable = false)
    private String userId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Action action;
    @Column(nullable = false, length = 50)
    private String service;
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    @Column(columnDefinition = "JSON")
    private String details = "{}";
    @Column(name = "timestamp", nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum Action {LOGIN_SUCCESS, CREATE, READ, UPDATE, DELETE}
}