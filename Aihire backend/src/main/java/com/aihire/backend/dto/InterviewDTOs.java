package com.aihire.backend.dto;

import com.aihire.backend.entity.InterviewMode;
import com.aihire.backend.entity.InterviewStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

public class InterviewDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterviewRequest {
        private Long applicationId;
        private Long scheduledBy; // Optional, resolved from security token if null
        private LocalDate interviewDate;
        private LocalTime interviewTime;
        private InterviewMode mode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterviewResponse {
        private Long id;
        private Long applicationId;
        private String applicantName;
        private String jobTitle;
        private Long scheduledById;
        private String scheduledByName;
        private LocalDate interviewDate;
        private LocalTime interviewTime;
        private InterviewMode mode;
        private InterviewStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewStatusUpdateRequest {
        private InterviewStatus status;
    }
}
