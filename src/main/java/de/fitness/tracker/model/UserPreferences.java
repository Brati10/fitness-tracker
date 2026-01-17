package de.fitness.tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User user;

    @Column(name = "default_rest_time")
    private Integer defaultRestTime = 60; // Sekunden, Default 60

    @Column(name = "weight_unit")
    private String weightUnit = "kg"; // "kg" oder "lbs", Default "kg"

    @Column(name = "theme")
    private String theme = "light";

    // Weitere Einstellungen können hier später hinzugefügt werden
}