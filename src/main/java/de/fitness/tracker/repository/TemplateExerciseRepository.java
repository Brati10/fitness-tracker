package de.fitness.tracker.repository;

import de.fitness.tracker.model.TemplateExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateExerciseRepository extends JpaRepository<TemplateExercise, Long> {

    List<TemplateExercise> findByTemplateIdOrderByOrderIndex(Long templateId);
}