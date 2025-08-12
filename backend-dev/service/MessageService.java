package com.example.demo.service;

import com.example.demo.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.Map;

@Service
public class MessageService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private ImageUploadService imageUploadService;

    public void sendMessage(String senderEmail, String receiverEmail, String text, MultipartFile imageFile)
            throws Exception {
        String chatId = firebaseService.createOrGetChatRoom(senderEmail, receiverEmail).get();

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = imageUploadService.uploadImage(imageFile);
        }

        Message message = new Message();
        message.setSenderEmail(senderEmail);
        message.setReceiverEmail(receiverEmail);
        message.setText(text);
        message.setImageUrl(imageUrl);
        message.setTimestamp(Instant.now().getEpochSecond());
        message.setSeen(false);

        firebaseService.sendMessage(chatId, message);
    }

    public List<Map<String, String>> getChattedUsers(String currentUserEmail) throws Exception {
        return firebaseService.getChattedUsersWithChatIds(currentUserEmail);
    }
    
    
    public List<Message> getMessages(String senderEmail, String receiverEmail)
            throws ExecutionException, InterruptedException {
        String chatId = firebaseService.createOrGetChatRoom(senderEmail, receiverEmail).get();
        return firebaseService.getMessages(chatId, senderEmail, receiverEmail).get(); // 🔧 updated with sender/receiver
    }

    public void deleteMessage(String senderEmail, String receiverEmail, String messageId)
            throws ExecutionException, InterruptedException {
        String chatId = firebaseService.createOrGetChatRoom(senderEmail, receiverEmail).get();
        firebaseService.deleteMessage(chatId, senderEmail, receiverEmail, messageId); // 🔧 updated
    }

    public void updateMessageSeen(String senderEmail, String receiverEmail, String messageId)
            throws ExecutionException, InterruptedException {
        String chatId = firebaseService.createOrGetChatRoom(senderEmail, receiverEmail).get();
        firebaseService.updateSeen(chatId, senderEmail, receiverEmail, messageId); // 🔧 updated
    }

    public String getChatRoomId(String senderEmail, String receiverEmail)
            throws ExecutionException, InterruptedException {
        return firebaseService.createOrGetChatRoom(senderEmail, receiverEmail).get();
    }
}
