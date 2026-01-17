package de.fitness.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "weight_measurements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeightMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User user;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;

    @NotNull
    @Column(nullable = false)
    private Double weight; // in kg

    private Double bodyFat; // in %

    private Double muscleMass; // in kg

    private Double boneMass; // in kg

    private Double bmi;

    private Integer metabolicAge;

    private Double waterPercentage; // in %

    private Integer visceralFat; // Stufe
}