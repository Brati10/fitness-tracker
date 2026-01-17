package de.fitness.tracker.controller;

import de.fitness.tracker.dto.TemplateSaveRequest;
import de.fitness.tracker.model.*;
import de.fitness.tracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
public class WorkoutTemplateController {

    @Autowired
    private WorkoutTemplateRepository templateRepository;

    @Autowired
    private TemplateExerciseRepository templateExerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @PostMapping
    public ResponseEntity<?> createTemplate(@RequestBody
    TemplateSaveRequest request) {
        Optional<User> user = userRepository.findById(request.getUserId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WorkoutTemplate template = new WorkoutTemplate();
        template.setUser(user.get());
        template.setName(request.getName());

        WorkoutTemplate savedTemplate = templateRepository.save(template);

        // Übungen hinzufügen
        for (TemplateSaveRequest.TemplateExerciseData exerciseData : request.getExercises()) {
            Optional<Exercise> exercise = exerciseRepository.findById(exerciseData.getExerciseId());
            if (exercise.isEmpty())
                continue;

            TemplateExercise te = new TemplateExercise();
            te.setTemplate(savedTemplate);
            te.setExercise(exercise.get());
            te.setOrderIndex(exerciseData.getOrderIndex());
            te.setSetsCount(exerciseData.getSetsCount());
            te.setTargetWeight(exerciseData.getTargetWeight());
            te.setTargetReps(exerciseData.getTargetReps());

            templateExerciseRepository.save(te);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", savedTemplate.getId(), "message", "Template created successfully"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutTemplate>> getUserTemplates(@PathVariable
    Long userId) {
        List<WorkoutTemplate> templates = templateRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTemplate(@PathVariable
    Long id) {
        Optional<WorkoutTemplate> template = templateRepository.findById(id);
        if (template.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(template.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTemplate(@PathVariable
    Long id, @RequestBody
    TemplateSaveRequest request) {
        Optional<WorkoutTemplate> templateOpt = templateRepository.findById(id);
        if (templateOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        WorkoutTemplate template = templateOpt.get();
        template.setName(request.getName());

        // Alte Übungen löschen
        templateExerciseRepository.deleteAll(template.getExercises());
        template.getExercises().clear();

        // Neue Übungen hinzufügen
        for (TemplateSaveRequest.TemplateExerciseData exerciseData : request.getExercises()) {
            Optional<Exercise> exercise = exerciseRepository.findById(exerciseData.getExerciseId());
            if (exercise.isEmpty())
                continue;

            TemplateExercise te = new TemplateExercise();
            te.setTemplate(template);
            te.setExercise(exercise.get());
            te.setOrderIndex(exerciseData.getOrderIndex());
            te.setSetsCount(exerciseData.getSetsCount());
            te.setTargetWeight(exerciseData.getTargetWeight());
            te.setTargetReps(exerciseData.getTargetReps());

            templateExerciseRepository.save(te);
        }

        templateRepository.save(template);

        return ResponseEntity.ok(Map.of("id", template.getId(), "message", "Template updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable
    Long id) {
        if (!templateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        templateRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
    }
}