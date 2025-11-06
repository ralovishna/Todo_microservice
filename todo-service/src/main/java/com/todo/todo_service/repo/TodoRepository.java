package com.todo.todo_service.repo;

import com.todo.todo_service.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    List<Todo> findByUsername(String username);

    List<Todo> findByUsernameAndCompleted(String username, boolean completed);

    @Query("""
                SELECT t FROM Todo t
                WHERE t.username = :username
                  AND (:status = 'all'
                       OR (:status = 'completed' AND t.completed = TRUE)
                       OR (:status = 'pending' AND t.completed = FALSE))
                  AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))
                  AND (:startDate IS NULL OR t.createdAt >= :startDate)
                  AND (:endDate IS NULL OR t.createdAt <= :endDate)
                ORDER BY t.createdAt DESC
            """)
    List<Todo> findByFilters(
            @Param("username") String username,
            @Param("status") String status,
            @Param("search") String search,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );
}