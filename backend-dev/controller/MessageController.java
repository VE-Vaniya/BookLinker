package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestParam String senderEmail,
            @RequestParam String receiverEmail,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) MultipartFile imageFile) throws Exception {
        messageService.sendMessage(senderEmail, receiverEmail, text, imageFile);
        return ResponseEntity.ok("Message sent successfully!");
    }

    @GetMapping("/get")
    public ResponseEntity<List<Message>> getMessages(@RequestParam String senderEmail,
            @RequestParam String receiverEmail) throws Exception {
        List<Message> messages = messageService.getMessages(senderEmail, receiverEmail);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteMessage(@RequestParam String senderEmail,
            @RequestParam String receiverEmail,
            @RequestParam String messageId) throws Exception {
        messageService.deleteMessage(senderEmail, receiverEmail, messageId);
        return ResponseEntity.ok("Message deleted successfully!");
    }

    @PostMapping("/seen")
    public ResponseEntity<String> updateSeen(@RequestParam String senderEmail,
            @RequestParam String receiverEmail,
            @RequestParam String messageId) throws Exception {
        messageService.updateMessageSeen(senderEmail, receiverEmail, messageId);
        return ResponseEntity.ok("Message marked as seen!");
    }

    @GetMapping("/getchatroom")
    public ResponseEntity<String> getOrCreateChatRoom(@RequestParam String senderEmail,
            @RequestParam String receiverEmail) throws Exception {
        String chatId = messageService.getChatRoomId(senderEmail, receiverEmail);
        return ResponseEntity.ok(chatId);
    }

    @GetMapping("/get-chatted-users")
    public ResponseEntity<List<Map<String, String>>> getChattedUsers(@RequestParam String currentUserEmail)
            throws Exception {
        List<Map<String, String>> usersWithChatIds = messageService.getChattedUsers(currentUserEmail);
        return ResponseEntity.ok(usersWithChatIds);
    }

}
