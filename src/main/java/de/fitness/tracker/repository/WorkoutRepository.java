package de.fitness.tracker.repository;

import de.fitness.tracker.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.exercises WHERE w.user.id = :userId ORDER BY w.startTime DESC")
    List<Workout> findByUserIdOrderByDateDesc(@Param("userId") Long userId);
}