package com.aihire.backend.dto;

import com.aihire.backend.entity.JobStatus;
import lombok.*;
import java.time.LocalDateTime;

public class JobDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobRequest {
        private String title;
        private String company;
        private String description;
        private String requiredSkills;
        private String location;
        private Double salary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobResponse {
        private Long id;
        private Long recruiterId;
        private String recruiterName;
        private String title;
        private String company;
        private String description;
        private String requiredSkills;
        private String location;
        private Double salary;
        private JobStatus status;
        private LocalDateTime createdAt;
    }
}
