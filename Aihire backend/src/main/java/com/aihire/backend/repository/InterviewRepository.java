package com.aihire.backend.repository;

import com.aihire.backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByScheduledById(Long recruiterId);
    List<Interview> findByApplicationId(Long applicationId);
}
