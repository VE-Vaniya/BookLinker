package com.example.demo.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import com.google.firebase.FirebaseApp;

@Service
public class UserProfileService {
    
    private DatabaseReference userProfileRef;
    private final FirebaseApp firebaseApp;

    public UserProfileService(FirebaseApp firebaseApp) {
        this.firebaseApp = firebaseApp;
    }

    @PostConstruct
    private void init() {
        this.userProfileRef = FirebaseDatabase.getInstance(firebaseApp).getReference("userProfiles");
    }

    public void saveUserProfileImage(String email, String imageUrl) {
        userProfileRef.child(email.replace(".", "_")).child("profileImageUrl").setValueAsync(imageUrl);
    }
}
