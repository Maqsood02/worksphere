package com.freelancer.platform.controllers;

import com.freelancer.platform.models.Message;
import com.freelancer.platform.models.User;
import com.freelancer.platform.services.ChatService;
import com.freelancer.platform.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    private final ChatService chatService;
    private final UserService userService;

    public ChatRestController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(@RequestParam String withUser, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        String currentUser = principal.getName();
        
        // Fetch chat logs
        List<Message> history = chatService.getChatHistory(currentUser, withUser);
        
        // Mark messages as read
        chatService.markAsRead(currentUser, withUser);

        return ResponseEntity.ok(Map.of("success", true, "history", history));
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        String currentUser = principal.getName();
        String receiverId = payload.get("receiverId");
        String content = payload.get("content");

        if (receiverId == null || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid message details"));
        }

        User sender = userService.findByUsername(currentUser).orElse(null);
        String senderName = (sender != null) ? sender.getName() : currentUser;

        Message msg = Message.builder()
                .senderId(currentUser)
                .senderName(senderName)
                .receiverId(receiverId)
                .content(content)
                .build();

        Message savedMessage = chatService.sendMessage(msg);

        return ResponseEntity.ok(Map.of("success", true, "message", "Message sent successfully!", "sent", savedMessage));
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadCount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        String currentUser = principal.getName();
        List<Message> unread = chatService.getUnreadMessages(currentUser);
        return ResponseEntity.ok(Map.of("success", true, "unreadCount", unread.size(), "unreadList", unread));
    }
}
