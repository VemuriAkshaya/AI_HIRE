package com.aihire.backend.controller;

import com.aihire.backend.dto.InterviewDTOs.*;
import com.aihire.backend.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<InterviewResponse> scheduleInterview(@Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(interviewService.scheduleInterview(request));
    }

    @GetMapping("/recruiter/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByRecruiter(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewsByRecruiter(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<InterviewResponse> updateInterviewStatus(
            @PathVariable Long id, 
            @Valid @RequestBody InterviewStatusUpdateRequest request) {
        return ResponseEntity.ok(interviewService.updateInterviewStatus(id, request.getStatus()));
    }
}
