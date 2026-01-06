package de.fitness.tracker.dto;

import lombok.Data;
import java.util.List;

@Data
public class TemplateSaveRequest {
    private Long userId;
    private String name;
    private List<TemplateExerciseData> exercises;

    @Data
    public static class TemplateExerciseData {
        private Long exerciseId;
        private Integer orderIndex;
        private Integer setsCount;
        private Double targetWeight;
        private Integer targetReps;
    }
}