package de.fitness.tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exercise_sets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "sets", "workout" })
    private WorkoutExercise workoutExercise;

    @NotNull
    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    // Für STRENGTH-Übungen:
    @Column(name = "weight")
    private Double weight; // in kg (NULL bei Cardio)

    @Column(name = "reps")
    private Integer reps; // Wiederholungen (NULL bei Cardio)

    // Für CARDIO-Übungen:
    @Column(name = "duration_seconds")
    private Integer durationSeconds; // Dauer in Sekunden (NULL bei Strength)

    @Column(name = "distance_km")
    private Double distanceKm; // Distanz in km (NULL bei Strength, optional bei
                               // Cardio)
}