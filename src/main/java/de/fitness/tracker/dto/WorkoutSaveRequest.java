package de.fitness.tracker.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkoutSaveRequest {
    private Long userId;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<ExerciseData> exercises;

    @Data
    public static class ExerciseData {
        private Long exerciseId;
        private Integer orderIndex;
        private String comment;
        private List<SetData> sets;
    }

    @Data
    public static class SetData {
        private Integer setNumber;
        private Double weight;
        private Integer reps;
    }
}