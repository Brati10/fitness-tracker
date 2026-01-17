package de.fitness.tracker.controller;

import de.fitness.tracker.model.User;
import de.fitness.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Alle User auflisten (nur für ADMIN)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam
    Long adminId) {
        // Prüfen ob Admin
        Optional<User> admin = userRepository.findById(adminId);
        if (admin.isEmpty() || !"ADMIN".equals(admin.get().getRole())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        List<User> users = userRepository.findAll();
        // Passwörter nicht mitsenden
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // User-Rolle ändern (nur ADMIN)
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable
    Long userId, @RequestBody
    Map<String, Object> data) {
        Long adminId = ((Number) data.get("adminId")).longValue();
        String newRole = (String) data.get("role");

        // Prüfen ob Admin
        Optional<User> admin = userRepository.findById(adminId);
        if (admin.isEmpty() || !"ADMIN".equals(admin.get().getRole())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        // User finden
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // Validierung: Nur USER, TRUSTED_USER, ADMIN erlaubt
        if (!"USER".equals(newRole) && !"TRUSTED_USER".equals(newRole) && !"ADMIN".equals(newRole)) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        user.setRole(newRole);
        userRepository.save(user);

        user.setPassword(null); // Passwort nicht mitsenden
        return ResponseEntity.ok(user);
    }

    // Passwort zurücksetzen (nur ADMIN)
    @PutMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable
    Long userId, @RequestBody
    Map<String, Object> data) {
        Long adminId = ((Number) data.get("adminId")).longValue();
        String newPassword = (String) data.get("newPassword");

        // Prüfen ob Admin
        Optional<User> admin = userRepository.findById(adminId);
        if (admin.isEmpty() || !"ADMIN".equals(admin.get().getRole())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        // User finden
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}