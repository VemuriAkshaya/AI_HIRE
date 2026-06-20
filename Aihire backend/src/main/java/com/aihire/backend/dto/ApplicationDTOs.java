package com.aihire.backend.dto;

import com.aihire.backend.entity.ApplicationStatus;
import lombok.*;
import java.time.LocalDateTime;

public class ApplicationDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationRequest {
        private Long jobId;
        private Long userId; // Optional, can be resolved from security token if null
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String company;
        private Long userId;
        private String userName;
        private String userSkills;
        private Integer matchScore;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private ApplicationStatus status;
    }
}
