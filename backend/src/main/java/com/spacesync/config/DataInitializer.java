package com.spacesync.config;

import com.spacesync.user.Role;
import com.spacesync.user.User;
import com.spacesync.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds initial data into the database.
 * Ensures the default Admin user exists.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // ── Seed Admin User ──────────────────────────────────────────────────
        String adminEmail = "admin@gmail.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .name("SpaceSync Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("#Admin123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .pictureUrl("https://ui-avatars.com/api/?name=Admin&background=0D1117&color=58a6ff")
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default Admin user created: " + adminEmail);
        }
    }
}
