package de.fitness.tracker.controller;

import de.fitness.tracker.model.User;
import de.fitness.tracker.model.WeightMeasurement;
import de.fitness.tracker.repository.UserRepository;
import de.fitness.tracker.repository.WeightMeasurementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/weight")
public class WeightMeasurementController {

    @Autowired
    private WeightMeasurementRepository weightRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createMeasurement(@RequestBody
    Map<String, Object> data) {
        Long userId = ((Number) data.get("userId")).longValue();

        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WeightMeasurement measurement = new WeightMeasurement();
        measurement.setUser(user.get());
        measurement.setDate(LocalDateTime.parse((String) data.get("date")));
        measurement.setWeight((Double) data.get("weight"));

        // Optional fields
        if (data.get("bodyFat") != null)
            measurement.setBodyFat(((Number) data.get("bodyFat")).doubleValue());
        if (data.get("muscleMass") != null)
            measurement.setMuscleMass(((Number) data.get("muscleMass")).doubleValue());
        if (data.get("boneMass") != null)
            measurement.setBoneMass(((Number) data.get("boneMass")).doubleValue());
        if (data.get("metabolicAge") != null)
            measurement.setMetabolicAge(((Number) data.get("metabolicAge")).intValue());
        if (data.get("waterPercentage") != null)
            measurement.setWaterPercentage(((Number) data.get("waterPercentage")).doubleValue());
        if (data.get("visceralFat") != null)
            measurement.setVisceralFat(((Number) data.get("visceralFat")).intValue());

        // BMI berechnen
        if (measurement.getWeight() != null && user.get().getHeight() != null) {
            double heightInMeters = user.get().getHeight() / 100.0;
            double bmi = measurement.getWeight() / (heightInMeters * heightInMeters);
            measurement.setBmi(Math.round(bmi * 10.0) / 10.0);
        }

        WeightMeasurement saved = weightRepository.save(measurement);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeightMeasurement>> getUserMeasurements(@PathVariable
    Long userId) {
        List<WeightMeasurement> measurements = weightRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(measurements);
    }
}