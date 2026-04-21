package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .httpBasic(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public read endpoints used by forms/dashboard bootstrap
                .requestMatchers(HttpMethod.GET, "/api/resources/**").permitAll()

                // Incident reporting/viewing for all authenticated app users
                .requestMatchers(HttpMethod.POST, "/api/incidents").hasAnyRole("USER", "TECHNICIAN", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/incidents/**").hasAnyRole("USER", "TECHNICIAN", "ADMIN")

                // Incident management actions for technician/admin only
                .requestMatchers(HttpMethod.PATCH, "/api/incidents/**").hasAnyRole("TECHNICIAN", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/incidents/*/comments").hasAnyRole("TECHNICIAN", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/incidents/**").hasRole("ADMIN")

                // Keep other existing APIs unchanged for now
                .anyRequest().permitAll()
            );
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("user")
                .password("{noop}password")
                .roles("USER")
                .build();

        UserDetails technician = User.withUsername("tech")
                .password("{noop}password")
                .roles("TECHNICIAN")
                .build();

        UserDetails admin = User.withUsername("admin")
                .password("{noop}password")
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user, technician, admin);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(List.of("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
