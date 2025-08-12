package com.example.demo.model;

public class Notification {
    private String id;
    private String userEmail;
    private String message;
    private long timestamp;

    public Notification() {}

    public Notification(String id, String userEmail, String message, long timestamp) {
        this.id = id;
        this.userEmail = userEmail;
        this.message = message;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
