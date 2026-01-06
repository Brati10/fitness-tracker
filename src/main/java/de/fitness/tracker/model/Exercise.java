package de.fitness.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name; // z.B. "Bankdrücken Langhantel"

    @Enumerated(EnumType.STRING)
    private ExerciseCategory category; // optional: CHEST, BACK, LEGS, etc.

    public enum ExerciseCategory {
        CHEST,
        BACK,
        LEGS,
        SHOULDERS,
        BICEPS,
        TRICEPS,
        CORE,
        CARDIO,
        OTHER
    }
}