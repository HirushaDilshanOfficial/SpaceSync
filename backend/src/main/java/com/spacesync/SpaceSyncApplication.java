package com.spacesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.spacesync", "backend"})
@EntityScan(basePackages = {"com.spacesync", "backend"})
@EnableJpaRepositories(basePackages = {"com.spacesync", "backend"})
public class SpaceSyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpaceSyncApplication.class, args);
    }
}
