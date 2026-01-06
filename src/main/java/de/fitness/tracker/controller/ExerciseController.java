package de.fitness.tracker.controller;

import de.fitness.tracker.model.Exercise;
import de.fitness.tracker.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:5173")
public class ExerciseController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return ResponseEntity.ok(exercises);
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@RequestBody Exercise exercise) {
        // Prüfen ob Übung schon existiert
        if (exerciseRepository.findByName(exercise.getName()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        
        Exercise saved = exerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExercise(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}