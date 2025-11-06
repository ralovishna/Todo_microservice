package com.todo.auth_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customConfig() {
        return new OpenAPI().info(
                        new Info()
                                .title("Auth App Apis")
                                .description("Authentication service")
                )
                .servers(List.of(
                                new Server().url("http://localhost:8081").description("local"),
                                new Server().url("http://localhost:8082").description("live")
                        )
                )
                .tags(
                        List.of(
                                new Tag().name("Health Check API"),
                                new Tag().name("Authentication APIs")
                        )
                );
    }
}
