package de.fitness.tracker.controller;

import de.fitness.tracker.dto.WorkoutSaveRequest;
import de.fitness.tracker.model.*;
import de.fitness.tracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private ExerciseSetRepository exerciseSetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    // Neues Workout starten
    @PostMapping
    public ResponseEntity<?> createWorkout(@RequestBody Workout workout) {
        Optional<User> user = userRepository.findById(workout.getUser().getId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        workout.setUser(user.get());

        Workout saved = workoutRepository.save(workout);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Alle Workouts eines Users
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Workout>> getUserWorkouts(@PathVariable Long userId) {
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(workouts);
    }

    // Einzelnes Workout mit Details
    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkout(@PathVariable Long id) {
        return workoutRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Übung zu Workout hinzufügen
    @PostMapping("/{workoutId}/exercises")
    public ResponseEntity<?> addExerciseToWorkout(
            @PathVariable Long workoutId,
            @RequestBody WorkoutExercise workoutExercise) {

        Optional<Workout> workout = workoutRepository.findById(workoutId);
        if (workout.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Exercise> exercise = exerciseRepository.findById(workoutExercise.getExercise().getId());
        if (exercise.isEmpty()) {
            return ResponseEntity.badRequest().body("Exercise not found");
        }

        workoutExercise.setWorkout(workout.get());
        workoutExercise.setExercise(exercise.get());

        WorkoutExercise saved = workoutExerciseRepository.save(workoutExercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Satz zu WorkoutExercise hinzufügen
    @PostMapping("/exercises/{workoutExerciseId}/sets")
    public ResponseEntity<?> addSetToExercise(
            @PathVariable Long workoutExerciseId,
            @RequestBody ExerciseSet exerciseSet) {

        Optional<WorkoutExercise> workoutExercise = workoutExerciseRepository.findById(workoutExerciseId);
        if (workoutExercise.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        exerciseSet.setWorkoutExercise(workoutExercise.get());
        ExerciseSet saved = exerciseSetRepository.save(exerciseSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Letzte Werte für eine Übung abrufen (für "Letztes Mal"-Anzeige)
    @GetMapping("/exercises/{exerciseId}/last")
    public ResponseEntity<?> getLastExercisePerformance(
            @PathVariable Long exerciseId,
            @RequestParam Long userId) {

        // Alle WorkoutExercises für diese Übung holen
        List<WorkoutExercise> allPerformances = workoutExerciseRepository
                .findByExerciseIdOrderByWorkoutDateDesc(exerciseId);

        // Nur die vom aktuellen User filtern
        List<WorkoutExercise> userPerformances = allPerformances.stream()
                .filter(we -> we.getWorkout().getUser().getId().equals(userId))
                .toList();

        if (userPerformances.isEmpty()) {
            return ResponseEntity.ok().body(null);
        }

        // Nimm die letzte Ausführung dieses Users
        WorkoutExercise lastPerformance = userPerformances.get(0);
        return ResponseEntity.ok(lastPerformance);
    }

    @PostMapping("/save-complete")
    public ResponseEntity<?> saveCompleteWorkout(@RequestBody WorkoutSaveRequest request) {
        System.out.println("=== SAVE COMPLETE CALLED ===");
        System.out.println("User ID: " + request.getUserId());
        System.out.println("Workout Name: " + request.getName());
        System.out.println("Number of exercises: " + request.getExercises().size());

        Optional<User> user = userRepository.findById(request.getUserId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Workout erstellen
        Workout workout = new Workout();
        workout.setUser(user.get());
        workout.setName(request.getName());
        workout.setStartTime(request.getStartTime());
        workout.setEndTime(request.getEndTime());

        Workout savedWorkout = workoutRepository.save(workout);

        // Übungen + Sätze speichern
        for (WorkoutSaveRequest.ExerciseData exerciseData : request.getExercises()) {
            Optional<Exercise> exercise = exerciseRepository.findById(exerciseData.getExerciseId());
            if (exercise.isEmpty())
                continue;

            WorkoutExercise workoutExercise = new WorkoutExercise();
            workoutExercise.setWorkout(savedWorkout);
            workoutExercise.setExercise(exercise.get());
            workoutExercise.setOrderIndex(exerciseData.getOrderIndex());
            workoutExercise.setComment(exerciseData.getComment());

            WorkoutExercise savedWE = workoutExerciseRepository.save(workoutExercise);

            // Sätze speichern
            for (WorkoutSaveRequest.SetData setData : exerciseData.getSets()) {
                ExerciseSet set = new ExerciseSet();
                set.setWorkoutExercise(savedWE);
                set.setSetNumber(setData.getSetNumber());
                set.setWeight(setData.getWeight());
                set.setReps(setData.getReps());
                exerciseSetRepository.save(set);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", savedWorkout.getId(),
                "message", "Workout saved successfully"));
    }
}