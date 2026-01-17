package de.fitness.tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "template_exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "exercises" })
    private WorkoutTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Exercise exercise;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(name = "sets_count")
    private Integer setsCount; // Anzahl Sätze als Vorlage

    // Für STRENGTH-Vorlagen
    @Column(name = "target_weight")
    private Double targetWeight;

    @Column(name = "target_reps")
    private Integer targetReps;

    // Für CARDIO-Vorlagen
    @Column(name = "target_duration_seconds")
    private Integer targetDurationSeconds;

    @Column(name = "target_distance_km")
    private Double targetDistanceKm;
}