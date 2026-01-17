package de.fitness.tracker.controller;

import de.fitness.tracker.dto.AuthResponse;
import de.fitness.tracker.dto.LoginRequest;
import de.fitness.tracker.dto.RegisterRequest;
import de.fitness.tracker.model.User;
import de.fitness.tracker.repository.UserRepository;
import de.fitness.tracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody
    RegisterRequest request) {
        // Validierung
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // User erstellen
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setHeight(request.getHeight());

        // Erster User = ADMIN
        long userCount = userRepository.count();
        if (userCount == 0) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);

        // Token generieren
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody
    LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userOpt.get();

        // Passwort prüfen
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // Token generieren
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getUsername(), user.getRole()));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization")
    String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No token provided");
        }

        String token = authHeader.substring(7);

        if (jwtUtil.isTokenValid(token)) {
            Long userId = jwtUtil.extractUserId(token);
            String username = jwtUtil.extractUsername(token);

            // User laden um role zu holen
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            String role = userOpt.get().getRole();
            return ResponseEntity.ok(new AuthResponse(token, userId, username, role));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
}