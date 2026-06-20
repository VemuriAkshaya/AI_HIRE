package com.aihire.backend.repository;

import com.aihire.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findByUserId(Long userId);
    Optional<Application> findByJobIdAndUserId(Long jobId, Long userId);
}
