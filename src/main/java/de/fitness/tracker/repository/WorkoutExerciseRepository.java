package de.fitness.tracker.repository;

import de.fitness.tracker.model.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutIdOrderByOrderIndex(Long workoutId);

    @Query("SELECT we FROM WorkoutExercise we JOIN FETCH we.sets WHERE we.exercise.id = :exerciseId ORDER BY we.workout.startTime DESC")
    List<WorkoutExercise> findByExerciseIdOrderByWorkoutDateDesc(@Param("exerciseId") Long exerciseId);
}