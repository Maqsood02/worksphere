package com.freelancer.platform.services;

import com.freelancer.platform.models.Project;
import com.freelancer.platform.repositories.ProjectRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project createProject(Project project) {
        syncProgressWithStatus(project);
        return projectRepository.save(project);
    }

    public List<Project> getProjectsByClient(String clientId) {
        return projectRepository.findByClientId(clientId);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project updateProjectStatus(String projectId, String status) {
        Optional<Project> opt = projectRepository.findById(projectId);
        if (opt.isPresent()) {
            Project project = opt.get();
            project.setStatus(status);
            syncProgressWithStatus(project);
            return projectRepository.save(project);
        }
        throw new IllegalArgumentException("Project not found: " + projectId);
    }

    private void syncProgressWithStatus(Project project) {
        switch (project.getStatus().toUpperCase()) {
            case "RECEIVED" -> project.setProgress(10);
            case "PLANNING" -> project.setProgress(25);
            case "DEVELOPMENT" -> project.setProgress(55);
            case "TESTING" -> project.setProgress(75);
            case "REVIEW" -> project.setProgress(90);
            case "COMPLETED" -> project.setProgress(100);
            default -> {}
        }
    }

    @PostConstruct
    public void seedProjects() {
        // Initial state: No auto-generated mock projects in database
    }
}
