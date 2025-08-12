package com.example.demo.model;

import com.google.firebase.database.Exclude;
import java.util.HashMap;
import java.util.Map;

public class User {
    private String id;
    private String name;
    private String email;
    private Double averageRating = 0.0;  // Initialize with default value
    private String password;
    private String profileImageUrl;
    private int ratingCount = 0;        // Initialize with default value
    private String safeEmail;           // For Firebase key compatibility

    public User() {
        // Default constructor required for Firebase deserialization
    }

    public User(String id, String name, String email, Double averageRating, 
               String password, String profileImageUrl, int ratingCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.safeEmail = email != null ? email.replace(".", ",") : null;
        this.averageRating = averageRating != null ? averageRating : 0.0;
        this.password = password;
        this.profileImageUrl = profileImageUrl;
        this.ratingCount = Math.max(ratingCount, 0); // Ensure non-negative
    }

    // Getters and Setters with null checks
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        this.safeEmail = email != null ? email.replace(".", ",") : null;
    }

    @Exclude
    public String getSafeEmail() {
        return safeEmail;
    }

    public Double getAverageRating() {
        return averageRating != null ? averageRating : 0.0;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating != null ? 
            Math.max(0.0, Math.min(5.0, averageRating)) : 0.0; // Clamp between 0-5
    }

    @Exclude
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public int getRatingCount() {
        return Math.max(ratingCount, 0); // Ensure non-negative
    }

    public void setRatingCount(int ratingCount) {
        this.ratingCount = Math.max(ratingCount, 0);
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", averageRating=" + averageRating +
                ", password='[PROTECTED]'" +
                ", profileImageUrl='" + profileImageUrl + '\'' +
                ", ratingCount=" + ratingCount +
                '}';
    }

    @Exclude
    public Map<String, Object> toMap() {
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("name", name);
        result.put("email", email);
        result.put("safeEmail", safeEmail);
        result.put("averageRating", getAverageRating()); // Use getter for safety
        result.put("profileImageUrl", profileImageUrl);
        result.put("ratingCount", getRatingCount()); // Use getter for safety
        // Password is intentionally excluded
        return result;
    }
}