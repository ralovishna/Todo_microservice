package com.todo.audit_service.repo;

import com.todo.audit_service.audit.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository extends JpaRepository<AuditLog, Long> {
}
