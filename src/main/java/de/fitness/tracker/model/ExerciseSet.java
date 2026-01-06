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
    @Column(nullable = false)
    private Integer setNumber; // 1, 2, 3, 4, ...

    @NotNull
    @Column(nullable = false)
    private Double weight; // in kg

    @NotNull
    @Column(nullable = false)
    private Integer reps; // Wiederholungen
}