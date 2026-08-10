package com.freelancer.platform.services;

import com.freelancer.platform.models.User;
import com.freelancer.platform.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public Optional<User> findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        String cleaned = identifier.trim().toLowerCase();
        
        Optional<User> byUsername = userRepository.findByUsername(identifier.trim());
        if (byUsername.isPresent()) return byUsername;

        List<User> all = userRepository.findAll();
        for (User u : all) {
            if (u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleaned)) return Optional.of(u);
            if (u.getPhone() != null && !u.getPhone().isBlank() && u.getPhone().trim().replaceAll("[^0-9]", "").equals(cleaned.replaceAll("[^0-9]", ""))) return Optional.of(u);
        }
        return Optional.empty();
    }

    public boolean resetPassword(String usernameOrEmail, String newPassword) {
        Optional<User> userOpt = findByIdentifier(usernameOrEmail);
        if (userOpt.isEmpty()) return false;
        User u = userOpt.get();
        u.setPassword(passwordEncoder.encode(newPassword));
        u.setRawPassword(newPassword);
        u.setEmailOtp(null);
        u.setPhoneOtp(null);
        userRepository.save(u);
        return true;
    }

    public String generateAndSaveOtp(User user) {
        String emailOtp = generateOtp();
        String phoneOtp = generateOtp();
        user.setEmailOtp(emailOtp);
        user.setPhoneOtp(phoneOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        return emailOtp;
    }

    public boolean verifyEmailOtp(String username, String otpInput) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        if (user.getEmailOtp() != null && user.getEmailOtp().equals(otpInput) &&
            user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setEmailVerified(true);
            user.setEmailOtp(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean verifyPhoneOtp(String username, String otpInput) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        if ((user.getPhoneOtp() != null && user.getPhoneOtp().equals(otpInput)) ||
            (user.getEmailOtp() != null && user.getEmailOtp().equals(otpInput))) {
            user.setPhoneVerified(true);
            user.setPhoneOtp(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean verifyOtp(String username, String otpInput) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        boolean validEmail = user.getEmailOtp() != null && user.getEmailOtp().equals(otpInput);
        boolean validPhone = user.getPhoneOtp() != null && user.getPhoneOtp().equals(otpInput);
        if ((validEmail || validPhone) && user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setEmailVerified(true);
            user.setPhoneVerified(true);
            user.setEmailOtp(null);
            user.setPhoneOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) return false;
        String regex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.trim().matches(regex);
    }

    public boolean isEmailRegistered(String email) {
        if (email == null || email.isBlank()) return false;
        String cleaned = email.trim().toLowerCase();
        return userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleaned));
    }

    public boolean isPhoneRegistered(String phone) {
        if (phone == null || phone.isBlank()) return false;
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.isBlank()) return false;
        return userRepository.findAll().stream()
                .anyMatch(u -> u.getPhone() != null && !u.getPhone().isBlank() &&
                        u.getPhone().replaceAll("[^0-9]", "").equals(digits));
    }

    public static boolean isPasswordSecure(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    public User registerUser(User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (userRepository.findByUsername(user.getUsername().trim()).isPresent() ||
            userRepository.findByUsernameIgnoreCase(user.getUsername().trim()).isPresent()) {
            throw new IllegalArgumentException("Username '@" + user.getUsername() + "' is already taken.");
        }
        if (user.getEmail() == null || !isValidEmail(user.getEmail())) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        if (isEmailRegistered(user.getEmail())) {
            throw new IllegalArgumentException("Email '" + user.getEmail() + "' is already registered.");
        }
        if (user.getPhone() != null && !user.getPhone().isBlank() && isPhoneRegistered(user.getPhone())) {
            throw new IllegalArgumentException("Phone number '" + user.getPhone() + "' is already registered.");
        }
        if (!isPasswordSecure(user.getPassword())) {
            throw new IllegalArgumentException("Password must be 8+ chars with uppercase, lowercase, number & special char (!@#$).");
        }

        user.setRawPassword(user.getPassword()); // Store user-created password in DB record!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            user.setRole("ROLE_CLIENT");
        }
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        if (username == null) return Optional.empty();
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            user = userRepository.findByUsername(username.trim());
        }
        if (user.isEmpty()) {
            user = userRepository.findByUsernameIgnoreCase(username.trim());
        }
        return user;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void updateUserPassword(String username, String rawPassword) {
        Optional<User> userOpt = findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRawPassword(rawPassword);
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            System.out.println("[UserService] Password updated in MongoDB for @" + username);
        } else {
            User newUser = User.builder()
                    .username(username != null ? username.trim() : username)
                    .password(passwordEncoder.encode(rawPassword))
                    .rawPassword(rawPassword)
                    .name(username)
                    .email(username.contains("@") ? username : username + "@worksphere.ac.in")
                    .role("ROLE_INTERN")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(newUser);
            System.out.println("[UserService] Created new user in MongoDB for @" + username);
        }
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public void deleteByUsername(String username) {
        userRepository.findByUsername(username).ifPresent(userRepository::delete);
    }

    @PostConstruct
    public void seedUsers() {
        // Ensure all MongoDB user records have rawPassword populated and saved directly in MongoDB
        try {
            userRepository.findAll().forEach(u -> {
                if (u.getRawPassword() == null || u.getRawPassword().isBlank()) {
                    String pass = "123456";
                    if ("admin".equalsIgnoreCase(u.getUsername())) pass = "adminpassword";
                    else if ("client".equalsIgnoreCase(u.getUsername())) pass = "clientpassword";
                    else if ("intern".equalsIgnoreCase(u.getUsername())) pass = "internpassword";
                    else if ("freelancer".equalsIgnoreCase(u.getUsername())) pass = "freelancerpassword";

                    u.setRawPassword(pass);
                    userRepository.save(u);
                    System.out.println("[DB UPDATE] Saved rawPassword '" + pass + "' directly into MongoDB for @" + u.getUsername());
                }
            });
        } catch (Exception e) {
            System.err.println("[DB UPDATE ERROR] " + e.getMessage());
        }
        // Migrate old 'admin' username to 'worksphere' in MongoDB if exists
        userRepository.findByUsername("admin").ifPresent(oldAdmin -> {
            oldAdmin.setUsername("worksphere");
            oldAdmin.setName("Maqsood M D");
            oldAdmin.setEmail("worksphere.ac.in@gmail.com");
            oldAdmin.setPhone("8792404950");
            oldAdmin.setPassword(passwordEncoder.encode("Workshere@123"));
            oldAdmin.setRawPassword("Workshere@123");
            userRepository.save(oldAdmin);
            System.out.println("[ADMIN UPDATE] Migrated admin username to 'worksphere' in MongoDB!");
        });

        // Ensure Admin user 'worksphere' has updated credentials in MongoDB
        if (userRepository.findByUsername("worksphere").isEmpty()) {
            User admin = User.builder()
                    .username("worksphere")
                    .password(passwordEncoder.encode("Workshere@123"))
                    .rawPassword("Workshere@123")
                    .name("Maqsood M D")
                    .email("worksphere.ac.in@gmail.com")
                    .phone("8792404950")
                    .role("ROLE_ADMIN")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("[DB SEED] Admin created! Username: worksphere, Password: Workshere@123");
        } else {
            userRepository.findByUsername("worksphere").ifPresent(u -> {
                u.setName("Maqsood M D");
                u.setEmail("worksphere.ac.in@gmail.com");
                u.setPhone("8792404950");
                u.setRole("ROLE_ADMIN");
                u.setPassword(passwordEncoder.encode("Workshere@123"));
                u.setRawPassword("Workshere@123");
                userRepository.save(u);
                System.out.println("[DB UPDATE] Updated Admin account in MongoDB: Maqsood M D (@worksphere)");
            });
        }

        // Also ensure typo alias 'workshpere' is seeded as ROLE_ADMIN
        if (userRepository.findByUsername("workshpere").isEmpty()) {
            User adminAlias = User.builder()
                    .username("workshpere")
                    .password(passwordEncoder.encode("Workshere@123"))
                    .rawPassword("Workshere@123")
                    .name("Maqsood M D")
                    .email("worksphere.ac.in@gmail.com")
                    .phone("8792404950")
                    .role("ROLE_ADMIN")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(adminAlias);
        } else {
            userRepository.findByUsername("workshpere").ifPresent(u -> {
                u.setRole("ROLE_ADMIN");
                u.setPassword(passwordEncoder.encode("Workshere@123"));
                u.setRawPassword("Workshere@123");
                userRepository.save(u);
            });
        }

        // Ensure Intern user 'maqsood' exists in MongoDB
        if (userRepository.findByUsername("maqsood").isEmpty()) {
            User maqsood = User.builder()
                    .username("maqsood")
                    .password(passwordEncoder.encode("123456"))
                    .rawPassword("123456")
                    .name("Maqsood MD")
                    .email("maqsoodmd.ac.in@gmail.com")
                    .phone("8792404950")
                    .role("ROLE_INTERN")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(maqsood);
            System.out.println("[DB SEED] Intern created! Username: maqsood, Password: 123456");
        } else {
            userRepository.findByUsername("maqsood").ifPresent(u -> {
                u.setName("Maqsood MD");
                u.setEmail("maqsoodmd.ac.in@gmail.com");
                u.setPhone("8792404950");
                u.setRole("ROLE_INTERN");
                if (u.getRawPassword() == null || u.getRawPassword().isBlank()) {
                    u.setRawPassword("123456");
                    u.setPassword(passwordEncoder.encode("123456"));
                }
                userRepository.save(u);
            });
        }

        // Ensure Intern user 'Chinmaykv' exists in MongoDB
        if (userRepository.findByUsername("Chinmaykv").isEmpty()) {
            User chinmay = User.builder()
                    .username("Chinmaykv")
                    .password(passwordEncoder.encode("123456"))
                    .rawPassword("123456")
                    .name("Chinmay K V")
                    .email("chinmaykv555@gmail.com")
                    .phone("7760674555")
                    .role("ROLE_INTERN")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(chinmay);
            System.out.println("[DB SEED] Intern created! Username: Chinmaykv, Password: 123456");
        } else {
            userRepository.findByUsername("Chinmaykv").ifPresent(u -> {
                u.setName("Chinmay K V");
                u.setEmail("chinmaykv555@gmail.com");
                u.setPhone("7760674555");
                u.setRole("ROLE_INTERN");
                if (u.getRawPassword() == null || u.getRawPassword().isBlank()) {
                    u.setRawPassword("123456");
                    u.setPassword(passwordEncoder.encode("123456"));
                }
                userRepository.save(u);
            });
        }

        // Ensure Client user 'Maqsood' exists in MongoDB
        if (userRepository.findByUsername("Maqsood").isEmpty()) {
            User client = User.builder()
                    .username("Maqsood")
                    .password(passwordEncoder.encode("123456"))
                    .rawPassword("123456")
                    .name("Maqsood MD")
                    .email("maqsoodmdhrl@gmail.com")
                    .phone("8792404950")
                    .role("ROLE_CLIENT")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(client);
            System.out.println("[DB SEED] Client created! Username: Maqsood, Password: 123456");
        } else {
            userRepository.findByUsername("Maqsood").ifPresent(u -> {
                u.setName("Maqsood MD");
                u.setEmail("maqsoodmdhrl@gmail.com");
                u.setPhone("8792404950");
                if (u.getRawPassword() == null || u.getRawPassword().isBlank()) {
                    u.setRawPassword("123456");
                    u.setPassword(passwordEncoder.encode("123456"));
                }
                userRepository.save(u);
            });
        }
    }
}

