package com.freelancer.platform.services;

import com.freelancer.platform.models.Message;
import com.freelancer.platform.models.Project;
import com.freelancer.platform.repositories.MessageRepository;
import com.freelancer.platform.repositories.ProjectRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;

    public ChatService(MessageRepository messageRepository, ProjectRepository projectRepository) {
        this.messageRepository = messageRepository;
        this.projectRepository = projectRepository;
    }

    public Message sendMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        Message saved = messageRepository.save(message);

        // If the recipient is "ai", trigger automated response
        if ("ai".equalsIgnoreCase(message.getReceiverId())) {
            generateAiResponse(message.getSenderId(), message.getContent());
        }

        return saved;
    }

    public List<Message> getChatHistory(String user1, String user2) {
        return messageRepository.findChatHistory(user1, user2);
    }

    public List<Message> getUnreadMessages(String username) {
        return messageRepository.findByReceiverIdAndIsReadFalse(username);
    }

    public void markAsRead(String username, String senderId) {
        List<Message> history = messageRepository.findChatHistory(username, senderId);
        for (Message msg : history) {
            if (msg.getReceiverId().equals(username) && !msg.getIsRead()) {
                msg.setIsRead(true);
                messageRepository.save(msg);
            }
        }
    }

    private void generateAiResponse(String clientUsername, String clientQuery) {
        String queryLower = clientQuery.toLowerCase();
        String reply;

        if (queryLower.contains("price") || queryLower.contains("cost") || queryLower.contains("budget")) {
            reply = "💰 **AI Price Estimator:** Here are general starting ranges for my premium services:\n" +
                    "• *SaaS Website Development:* $1,500 - $5,000 (3-5 weeks)\n" +
                    "• *React / Custom Portals:* $2,000 - $6,000 (4-6 weeks)\n" +
                    "• *AI Solutions / OpenAI integrations:* $1,200 - $3,500 (2-4 weeks)\n" +
                    "• *Mobile Android Apps (Java/Kotlin):* $3,000 - $8,000 (5-8 weeks)\n\n" +
                    "Want a precise quote? You can fill out the **Project Request Form** on our portal for an automated custom invoice estimate!";
        } else if (queryLower.contains("coupon") || queryLower.contains("discount") || queryLower.contains("promo")) {
            reply = "🎟️ **Coupon System Activated!** Use code **FREELANCE20** during project submission to receive a flat **20% discount** on your initial project proposal budget!";
        } else if (queryLower.contains("status") || queryLower.contains("track") || queryLower.contains("progress")) {
            List<Project> clientProjects = projectRepository.findByClientId(clientUsername);
            if (clientProjects.isEmpty()) {
                reply = "🔍 I couldn't find any active projects associated with your account. You can submit a project proposal from the **Request Form** to get started.";
            } else {
                StringBuilder sb = new StringBuilder("📋 **Active Projects Status for you:**\n");
                for (Project p : clientProjects) {
                    sb.append("• *").append(p.getTitle()).append("*: Status: **").append(p.getStatus())
                            .append("** (Progress: ").append(p.getProgress()).append("%)\n");
                }
                reply = sb.toString();
            }
        } else if (queryLower.contains("tech") || queryLower.contains("stack") || queryLower.contains("java") || queryLower.contains("mongodb")) {
            reply = "⚡ **Core Technology Stack:**\n" +
                    "This entire platform is built with a highly secure and scalable architecture:\n" +
                    "• *Backend:* Java 17/21+, Spring Boot 3.x, Spring Security (Role-based access)\n" +
                    "• *Database:* MongoDB (Flexible, fast, document-based persistence)\n" +
                    "• *Frontend:* Thymeleaf template compilation engine styled dynamically with Tailwind CSS v4, smooth animations, and premium glassmorphism layouts.";
        } else if (queryLower.contains("hello") || queryLower.contains("hi") || queryLower.contains("hey")) {
            reply = "👋 Hello! I am your AI Assistant. How can I help you today?\n" +
                    "Try asking me about:\n" +
                    "• *'price'* to get estimated quotes\n" +
                    "• *'coupon'* for promotional discount codes\n" +
                    "• *'status'* to check on your active projects\n" +
                    "• *'tech'* to inspect the stack behind this website";
        } else {
            reply = "💡 That is a great question! I'm your virtual assistant. To discuss custom items, wireframes, or custom timelines, you can type a message directly to me here, or book an appointment on my calendar in the dashboard.";
        }

        Message aiMessage = Message.builder()
                .senderId("ai")
                .senderName("AI Co-Pilot")
                .receiverId(clientUsername)
                .content(reply)
                .isAi(true)
                .timestamp(LocalDateTime.now().plusSeconds(1)) // Small offset for logical sorting
                .build();
        messageRepository.save(aiMessage);
    }

    @PostConstruct
    public void seedMessages() {
        if (messageRepository.count() == 0) {
            Message m1 = Message.builder()
                    .senderId("admin")
                    .senderName("Alex Developer")
                    .receiverId("client")
                    .content("Hi John! Welcome to the client portal. How is the design roadmap for the E-Commerce Web Application looking?")
                    .timestamp(LocalDateTime.now().minusDays(2))
                    .isRead(true)
                    .build();

            Message m2 = Message.builder()
                    .senderId("client")
                    .senderName("John Doe")
                    .receiverId("admin")
                    .content("Hi Alex! It looks fantastic. We are ready to finalize the database schemas for the catalog and checkout systems.")
                    .timestamp(LocalDateTime.now().minusDays(1))
                    .isRead(true)
                    .build();

            messageRepository.save(m1);
            messageRepository.save(m2);
            System.out.println("[DB SEED] Chat history seeded!");
        }
    }
}
