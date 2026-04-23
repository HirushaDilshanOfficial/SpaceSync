package com.spacesync.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity.
 *
 * @author Member 4 – Module E
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByOauthProviderId(String oauthProviderId);

    List<User> findAllByRole(Role role);

    boolean existsByEmail(String email);
}
