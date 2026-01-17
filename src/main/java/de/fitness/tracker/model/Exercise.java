package de.fitness.tracker.model;

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_type")
    private ExerciseType exerciseType = ExerciseType.STRENGTH; // Default:
                                                               // STRENGTH

    // Nur für STRENGTH-Übungen:
    @Column(name = "weight_per_side")
    private Boolean weightPerSide = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type")
    private EquipmentType equipmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_muscle_group")
    private MuscleGroup primaryMuscleGroup;
}