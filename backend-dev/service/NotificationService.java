package com.example.demo.service;

import com.example.demo.model.Notification;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;
import com.google.firebase.FirebaseApp;

import java.util.UUID;

@Service
public class NotificationService {

    private final DatabaseReference rootRef;

    public NotificationService(FirebaseApp firebaseApp) {
        this.rootRef = FirebaseDatabase.getInstance(firebaseApp).getReference();
    }

    public void sendNotification(String userEmail, String message) {
        System.out.println("Sending notification to: " + userEmail + " | Message: " + message); // DEBUG

        String sanitizedEmail = sanitizeEmail(userEmail);

        String notificationId = UUID.randomUUID().toString();
        Notification notification = new Notification(notificationId, userEmail, message, System.currentTimeMillis());

        rootRef.child("notifications")
               .child(sanitizedEmail)
               .child(notificationId)
               .setValueAsync(notification);
    }

    private String sanitizeEmail(String email) {
        return email.replace(".", ",");
    }
}
