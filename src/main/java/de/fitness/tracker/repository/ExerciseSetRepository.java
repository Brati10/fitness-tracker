package de.fitness.tracker.repository;

import de.fitness.tracker.model.ExerciseSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseSetRepository extends JpaRepository<ExerciseSet, Long> {
    
    List<ExerciseSet> findByWorkoutExerciseIdOrderBySetNumber(Long workoutExerciseId);
}