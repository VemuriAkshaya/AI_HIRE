package com.aihire.backend.service;

import com.aihire.backend.dto.ApplicationDTOs.*;
import com.aihire.backend.entity.*;
import com.aihire.backend.exception.BadRequestException;
import com.aihire.backend.exception.ResourceNotFoundException;
import com.aihire.backend.repository.ApplicationRepository;
import com.aihire.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    @Transactional
    public ApplicationResponse apply(ApplicationRequest request) {
        User applicant;
        if (request.getUserId() != null) {
            applicant = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Applicant user not found"));
        } else {
            applicant = userService.getCurrentUserEntity();
        }

        if (applicant.getRole() != Role.JOB_SEEKER) {
            throw new BadRequestException("Only job seekers can apply for jobs");
        }

        Job job = jobService.getJobEntityById(request.getJobId());
        if (job.getStatus() == JobStatus.CLOSED) {
            throw new BadRequestException("This job posting is closed");
        }

        // Prevent duplicate applications
        if (applicationRepository.findByJobIdAndUserId(job.getId(), applicant.getId()).isPresent()) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Calculate Match Score
        int matchScore = calculateMatchScore(applicant.getSkills(), job.getRequiredSkills());

        Application application = Application.builder()
                .job(job)
                .user(applicant)
                .matchScore(matchScore)
                .status(ApplicationStatus.APPLIED)
                .build();

        Application savedApplication = applicationRepository.save(application);
        return convertToResponse(savedApplication);
    }

    public List<ApplicationResponse> getApplicationsByJob(Long jobId) {
        User currentUser = userService.getCurrentUserEntity();
        Job job = jobService.getJobEntityById(jobId);

        // Security check: Only the recruiter who posted the job can view the applicants
        if (currentUser.getRole() != Role.RECRUITER || !job.getRecruiter().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You are not authorized to view applicants for this job");
        }

        return applicationRepository.findByJobId(jobId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByUser(Long userId) {
        User currentUser = userService.getCurrentUserEntity();

        // Security check: Job seekers can only view their own applications, Recruiters can view anyway (or we restrict)
        if (currentUser.getRole() == Role.JOB_SEEKER && !currentUser.getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view these applications");
        }

        return applicationRepository.findByUserId(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateStatus(Long id, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        User currentUser = userService.getCurrentUserEntity();
        
        // Security check: Only recruiter of the job can update status
        if (currentUser.getRole() != Role.RECRUITER || !application.getJob().getRecruiter().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You are not authorized to manage this candidate application");
        }

        // CRITICAL RULE: Once status is HIRED, rejection should be blocked unless admin override is implemented
        if (application.getStatus() == ApplicationStatus.HIRED && newStatus == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Candidate has already been hired. Rejection is blocked.");
        }

        application.setStatus(newStatus);
        
        // Update job seeker application status, and auto update the related interviews status if needed
        Application updatedApplication = applicationRepository.save(application);
        return convertToResponse(updatedApplication);
    }

    @Transactional
    public ApplicationResponse hireCandidate(Long id) {
        return updateStatus(id, ApplicationStatus.HIRED);
    }

    @Transactional
    public ApplicationResponse rejectCandidate(Long id) {
        return updateStatus(id, ApplicationStatus.REJECTED);
    }

    public Application getApplicationEntityById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    /**
     * Skill Match Score Logic:
     * - Compare applicant skills and job required skills (case-insensitive, trimmed)
     * - Calculate percentage match (0-100)
     */
    public int calculateMatchScore(String applicantSkillsStr, String requiredSkillsStr) {
        if (requiredSkillsStr == null || requiredSkillsStr.trim().isEmpty()) {
            return 100; // If no required skills, any candidate is a 100% match
        }
        if (applicantSkillsStr == null || applicantSkillsStr.trim().isEmpty()) {
            return 0; // If applicant has no skills but job requires skills, 0% match
        }

        String[] reqSkills = requiredSkillsStr.split(",");
        String[] appSkills = applicantSkillsStr.split(",");

        Set<String> appSkillSet = new HashSet<>();
        for (String s : appSkills) {
            appSkillSet.add(s.trim().toLowerCase());
        }

        int matchCount = 0;
        int totalRequired = 0;

        for (String s : reqSkills) {
            String skill = s.trim().toLowerCase();
            if (!skill.isEmpty()) {
                totalRequired++;
                if (appSkillSet.contains(skill)) {
                    matchCount++;
                }
            }
        }

        if (totalRequired == 0) {
            return 100;
        }

        return (matchCount * 100) / totalRequired;
    }

    public ApplicationResponse convertToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .company(app.getJob().getCompany())
                .userId(app.getUser().getId())
                .userName(app.getUser().getFullName())
                .userSkills(app.getUser().getSkills())
                .matchScore(app.getMatchScore())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}
