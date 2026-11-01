package com.localfix.security;

import com.localfix.entity.User;
import com.localfix.entity.UserRole;
import com.localfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * AdminAccountInitializer
 *
 * Automatically seeds an initial administrator account upon startup if none exists.
 * Credentials are configurable via environment variables:
 * - LOCALFIX_ADMIN_EMAIL (default: admin@localfix.org)
 * - LOCALFIX_ADMIN_PASSWORD (default: Admin@12345)
 * - LOCALFIX_ADMIN_NAME (default: City Administrator)
 */
@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${localfix.admin.email:admin@localfix.org}")
    private String adminEmail;

    @Value("${localfix.admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${localfix.admin.name:City Administrator}")
    private String adminName;

    public AdminAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String normalizedEmail = adminEmail.trim().toLowerCase();

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            User admin = new User(
                    adminName.trim(),
                    normalizedEmail,
                    passwordEncoder.encode(adminPassword),
                    UserRole.ADMIN
            );
            userRepository.save(admin);
            log.info("Initialized default administrator account for [{}] with role [ADMIN]", normalizedEmail);
        } else {
            log.debug("Administrator account [{}] already exists.", normalizedEmail);
        }
    }
}
