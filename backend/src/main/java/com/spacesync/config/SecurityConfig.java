package com.spacesync.config;

import com.spacesync.auth.HttpCookieOAuth2AuthorizationRequestRepository;
import com.spacesync.auth.JwtAuthenticationFilter;
import com.spacesync.auth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Central Spring Security configuration.
 * - Enables OAuth2 Google login
 * - Stateless sessions (JWT)
 * - Role-based endpoint protection
 * - CORS for React frontend
 *
 * @author Member 4 – Module E (Authentication & Authorization)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler    oAuth2SuccessHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── Disable CSRF (stateless JWT API) ────────────────────────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS ─────────────────────────────────────────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── Session: stateless ───────────────────────────────────────────
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Authorization rules ──────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                // Public: Auth endpoints + H2 console (dev)
                .requestMatchers("/login/**", "/oauth2/**", "/h2-console/**", "/api/auth/dev-login").permitAll()
                .requestMatchers("/api/auth/signin", "/api/auth/signup").permitAll()
                // Public: Swagger / actuator (optional)
                .requestMatchers("/actuator/health").permitAll()

                // ADMIN only
                .requestMatchers(HttpMethod.POST,   "/api/auth/assign-role").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/auth/roles").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/notifications/send").hasRole("ADMIN")

                // Any authenticated user for everything else
                .anyRequest().authenticated()
            )

            // ── OAuth2 login flow ────────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth
                    .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository))
                .successHandler(oAuth2SuccessHandler)
            )

            // ── JWT filter before UsernamePasswordAuthenticationFilter ────────
            .addFilterBefore(jwtAuthenticationFilter,
                             UsernamePasswordAuthenticationFilter.class)

            // ── Disable frame options for H2 console (dev only) ─────────────
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
