package de.fitness.tracker.repository;

import de.fitness.tracker.model.WeightMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeightMeasurementRepository extends JpaRepository<WeightMeasurement, Long> {
    
    List<WeightMeasurement> findByUserIdOrderByDateDesc(Long userId);
}