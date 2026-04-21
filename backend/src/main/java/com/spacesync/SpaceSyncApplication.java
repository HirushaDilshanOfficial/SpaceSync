package com.spacesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.spacesync"})
@EntityScan(basePackages = {"com.spacesync"})
@EnableJpaRepositories(basePackages = {"com.spacesync"})
public class SpaceSyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpaceSyncApplication.class, args);
    }
}
