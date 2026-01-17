package de.fitness.tracker.controller;

import de.fitness.tracker.model.User;
import de.fitness.tracker.repository.UserRepository;
import de.fitness.tracker.model.Exercise;
import de.fitness.tracker.model.ExerciseType;
import de.fitness.tracker.model.EquipmentType;
import de.fitness.tracker.model.MuscleGroup;
import de.fitness.tracker.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return ResponseEntity.ok(exercises);
    }

    @PostMapping
    public ResponseEntity<?> createExercise(@RequestBody
    Map<String, Object> data) {
        // Rolle prüfen
        Long userId = ((Number) data.get("userId")).longValue();
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        User user = userOpt.get();
        if (!"TRUSTED_USER".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to create exercises");
        }

        String name = (String) data.get("name");

        // Prüfen ob Übung schon existiert
        if (exerciseRepository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().body("Exercise already exists");
        }

        Exercise exercise = new Exercise();
        exercise.setName(name);

        // weightPerSide optional, default = false
        if (data.containsKey("weightPerSide")) {
            exercise.setWeightPerSide((Boolean) data.get("weightPerSide"));
        } else {
            exercise.setWeightPerSide(false);
        }

        // Equipment Type
        if (data.containsKey("equipmentType")) {
            try {
                exercise.setEquipmentType(EquipmentType.valueOf((String) data.get("equipmentType")));
            } catch (IllegalArgumentException e) {
                exercise.setEquipmentType(null);
            }
        }

        // Primary Muscle Group
        if (data.containsKey("primaryMuscleGroup")) {
            try {
                exercise.setPrimaryMuscleGroup(MuscleGroup.valueOf((String) data.get("primaryMuscleGroup")));
            } catch (IllegalArgumentException e) {
                exercise.setPrimaryMuscleGroup(null);
            }
        }

        // Exercise Type
        if (data.containsKey("exerciseType")) {
            try {
                exercise.setExerciseType(ExerciseType.valueOf((String) data.get("exerciseType")));
            } catch (IllegalArgumentException e) {
                exercise.setExerciseType(ExerciseType.STRENGTH); // Default
            }
        } else {
            exercise.setExerciseType(ExerciseType.STRENGTH); // Default wenn
                                                             // nicht angegeben
        }

        Exercise saved = exerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExercise(@PathVariable
    Long id) {
        return exerciseRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}