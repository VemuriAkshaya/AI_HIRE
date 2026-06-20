package com.aihire.backend.service;

import com.aihire.backend.dto.JobDTOs.*;
import com.aihire.backend.entity.Job;
import com.aihire.backend.entity.JobStatus;
import com.aihire.backend.entity.Role;
import com.aihire.backend.entity.User;
import com.aihire.backend.exception.BadRequestException;
import com.aihire.backend.exception.ResourceNotFoundException;
import com.aihire.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public JobResponse createJob(JobRequest request) {
        User recruiter = userService.getCurrentUserEntity();
        
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("Only recruiters are allowed to post jobs");
        }

        Job job = Job.builder()
                .recruiter(recruiter)
                .title(request.getTitle())
                .company(request.getCompany())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .location(request.getLocation())
                .salary(request.getSalary())
                .status(JobStatus.OPEN)
                .build();

        Job savedJob = jobRepository.save(job);
        return convertToJobResponse(savedJob);
    }

    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::convertToJobResponse)
                .collect(Collectors.toList());
    }

    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return convertToJobResponse(job);
    }

    public Job getJobEntityById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    @Transactional
    public void deleteJob(Long id) {
        User recruiter = userService.getCurrentUserEntity();
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        // Ensure recruiter owns this job post
        if (recruiter.getRole() != Role.RECRUITER || !job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new BadRequestException("You are not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    public JobResponse convertToJobResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getFullName())
                .title(job.getTitle())
                .company(job.getCompany())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .location(job.getLocation())
                .salary(job.getSalary())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .build();
    }
}
