package de.fitness.tracker.controller;

import de.fitness.tracker.model.User;
import de.fitness.tracker.model.WeightMeasurement;
import de.fitness.tracker.repository.UserRepository;
import de.fitness.tracker.repository.WeightMeasurementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/weight")
@CrossOrigin(origins = "http://localhost:3000")
public class WeightMeasurementController {

    @Autowired
    private WeightMeasurementRepository weightRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createMeasurement(@RequestBody WeightMeasurement measurement) {
        // User muss existieren
        Optional<User> user = userRepository.findById(measurement.getUser().getId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        measurement.setUser(user.get());

        // BMI automatisch berechnen
        if (measurement.getWeight() != null && user.get().getHeight() != null) {
            double heightInMeters = user.get().getHeight() / 100.0;
            double bmi = measurement.getWeight() / (heightInMeters * heightInMeters);
            measurement.setBmi(Math.round(bmi * 10.0) / 10.0); // Auf 1 Dezimalstelle runden
        }

        WeightMeasurement saved = weightRepository.save(measurement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeightMeasurement>> getUserMeasurements(@PathVariable Long userId) {
        List<WeightMeasurement> measurements = weightRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(measurements);
    }
}