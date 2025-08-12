package com.example.demo.model;

public class Complaint {
    private String id;
    private String natureOfConcern;
    private String details;
    private String email;
    private String complaineeEmail;
    private String username;
    private String status; // "Pending", "Resolved"
    private String timestamp;
    private Double fineAmount;
    private Double adminCut;
    private boolean finePaid;
    private String resolvedAt;

    public Complaint() {}

    public Complaint(String id, String natureOfConcern, String details, String email, String complaineeEmail,
                     String username, String status, String timestamp, Double fineAmount,
                     Double adminCut, boolean finePaid, String resolvedAt) {
        this.id = id;
        this.natureOfConcern = natureOfConcern;
        this.details = details;
        this.email = email;
        this.complaineeEmail = complaineeEmail;
        this.username = username;
        this.status = status;
        this.timestamp = timestamp;
        this.fineAmount = fineAmount;
        this.adminCut = adminCut;
        this.finePaid = finePaid;
        this.resolvedAt = resolvedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNatureOfConcern() {
        return natureOfConcern;
    }

    public void setNatureOfConcern(String natureOfConcern) {
        this.natureOfConcern = natureOfConcern;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

        public String getComplaineeEmail() {
        return complaineeEmail;
    }

    public void setComplaineeEmail(String complaineeEmail) {
        this.complaineeEmail = complaineeEmail;
    }
    public Double getFineAmount() {
        return fineAmount;
    }
    
    public void setFineAmount(Double fineAmount) {
        this.fineAmount = fineAmount;
    }
    
    public Double getAdminCut() {
        return adminCut;
    }
    
    public void setAdminCut(Double adminCut) {
        this.adminCut = adminCut;
    }
    
    public boolean isFinePaid() {
        return finePaid;
    }
    
    public void setFinePaid(boolean finePaid) {
        this.finePaid = finePaid;
    }
    
    public String getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(String resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
}