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
        if (projectRepository.count() == 0) {
            Project p1 = Project.builder()
                    .clientId("client")
                    .clientName("John Doe")
                    .title("E-Commerce Web Application")
                    .description("Create a modern SaaS-like e-commerce website with glassmorphism visual designs and quick checkout.")
                    .projectType("Website Development")
                    .budget(3500.0)
                    .deadline("2026-08-15")
                    .status("DEVELOPMENT")
                    .progress(55)
                    .build();

            Project p2 = Project.builder()
                    .clientId("client")
                    .clientName("John Doe")
                    .title("AI Smart Chatbot Integration")
                    .description("Inject an automated OpenAI-driven customer service bot helper into an existing portal.")
                    .projectType("AI Solutions")
                    .budget(1200.0)
                    .deadline("2026-07-28")
                    .status("PLANNING")
                    .progress(25)
                    .build();

            Project p3 = Project.builder()
                    .clientId("client")
                    .clientName("John Doe")
                    .title("Mobile Booking Utility Android App")
                    .description("Android applications development for time slot scheduling and invoice management.")
                    .projectType("Android Apps")
                    .budget(4200.0)
                    .deadline("2026-06-30")
                    .status("COMPLETED")
                    .progress(100)
                    .build();

            projectRepository.save(p1);
            projectRepository.save(p2);
            projectRepository.save(p3);
            System.out.println("[DB SEED] Default Projects seeded!");
        }
    }
}
