package com.aihire.backend.service;

import com.aihire.backend.dto.InterviewDTOs.*;
import com.aihire.backend.entity.*;
import com.aihire.backend.exception.BadRequestException;
import com.aihire.backend.exception.ResourceNotFoundException;
import com.aihire.backend.repository.ApplicationRepository;
import com.aihire.backend.repository.InterviewRepository;
import com.aihire.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public InterviewResponse scheduleInterview(InterviewRequest request) {
        User recruiter;
        if (request.getScheduledBy() != null) {
            recruiter = userRepository.findById(request.getScheduledBy())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter user not found"));
        } else {
            recruiter = userService.getCurrentUserEntity();
        }

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters can schedule interviews");
        }

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + request.getApplicationId()));

        // Security check: recruiter scheduling must be the owner of the job posting
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new BadRequestException("You are not authorized to schedule an interview for this job posting");
        }

        Interview interview = Interview.builder()
                .application(application)
                .scheduledBy(recruiter)
                .interviewDate(request.getInterviewDate())
                .interviewTime(request.getInterviewTime())
                .mode(request.getMode())
                .status(InterviewStatus.SCHEDULED)
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Transition application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        return convertToResponse(savedInterview);
    }

    public List<InterviewResponse> getInterviewsByRecruiter(Long recruiterId) {
        User currentUser = userService.getCurrentUserEntity();

        // Security check: recruiters can only fetch their own schedules
        if (!currentUser.getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to view this recruiter's interviews");
        }

        return interviewRepository.findByScheduledById(recruiterId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse updateInterviewStatus(Long id, InterviewStatus status) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));

        User currentUser = userService.getCurrentUserEntity();

        // Security check: Only scheduling recruiter can change status
        if (!interview.getScheduledBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You are not authorized to update this interview status");
        }

        interview.setStatus(status);
        Interview updatedInterview = interviewRepository.save(interview);
        return convertToResponse(updatedInterview);
    }

    public InterviewResponse convertToResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .applicantName(interview.getApplication().getUser().getFullName())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .scheduledById(interview.getScheduledBy().getId())
                .scheduledByName(interview.getScheduledBy().getFullName())
                .interviewDate(interview.getInterviewDate())
                .interviewTime(interview.getInterviewTime())
                .mode(interview.getMode())
                .status(interview.getStatus())
                .build();
    }
}
