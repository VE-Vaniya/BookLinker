package com.example.demo.model;

import java.util.HashMap;
import java.util.Map;

public class Rating {
    private String id;
    private String raterEmail;
    private String ratedEmail;
    private int stars;
    private String timestamp;
    private String raterEmail_ratedEmail;

    public Rating() {}

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("raterEmail", raterEmail);
        map.put("ratedEmail", ratedEmail);
        map.put("stars", stars);
        map.put("timestamp", timestamp);
        map.put("raterEmail_ratedEmail", raterEmail + "_" + ratedEmail);
        return map;
    }

    // Getters and setters...
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRaterEmail() { return raterEmail; }
    public void setRaterEmail(String raterEmail) { 
        this.raterEmail = raterEmail;
        updateCompositeKey();
    }
    public String getRatedEmail() { return ratedEmail; }
    public void setRatedEmail(String ratedEmail) { 
        this.ratedEmail = ratedEmail;
        updateCompositeKey();
    }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getRaterEmail_ratedEmail() { return raterEmail_ratedEmail; }

    private void updateCompositeKey() {
        if (raterEmail != null && ratedEmail != null) {
            this.raterEmail_ratedEmail = raterEmail + "_" + ratedEmail;
        }
    }
}