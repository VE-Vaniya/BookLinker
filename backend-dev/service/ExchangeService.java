package com.example.demo.service;

import com.example.demo.model.ExchangeRequest;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ExchangeService {
    private final FirebaseDatabase database = FirebaseDatabase.getInstance();
    private final DatabaseReference exchangeRequestsRef = database.getReference("exchangeRequests");

    public CompletableFuture<String> createExchangeRequest(ExchangeRequest request) {
        CompletableFuture<String> future = new CompletableFuture<>();
        
        String key = exchangeRequestsRef.push().getKey();
        request.setId(key);
        
        exchangeRequestsRef.child(key).setValueAsync(request.toMap())
            .addListener(() -> future.complete(key), Runnable::run);
            
        return future;
    }

    public CompletableFuture<Void> updateRequestStatus(String requestId, String status) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        System.out.println("Updating exchange request " + requestId + " status to: " + status);
        
        // Simply update the status without calling recordExchangeTransaction
        exchangeRequestsRef.child(requestId).child("status").setValueAsync(status)
            .addListener(() -> future.complete(null), Runnable::run);
            
        return future;
    }

    public CompletableFuture<List<ExchangeRequest>> getExchangeRequestsByUserEmail(String userEmail, boolean asTarget) {
        CompletableFuture<List<ExchangeRequest>> future = new CompletableFuture<>();
        
        System.out.println("Fetching exchange requests for " + userEmail + " (asTarget: " + asTarget + ")");
        
        exchangeRequestsRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<ExchangeRequest> requestsList = new ArrayList<>();
                
                System.out.println("Found " + dataSnapshot.getChildrenCount() + " total exchange requests");
                
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    try {
                        System.out.println("Processing request with ID: " + snapshot.getKey());
                        
                        // Dump all available fields for debugging
                        System.out.println("Available fields in this request: ");
                        for (DataSnapshot child : snapshot.getChildren()) {
                            System.out.println(" - " + child.getKey() + ": " + child.getValue());
                        }
                        
                        // Get field values with fallbacks
                        String requestId = snapshot.getKey();
                        String requesterId = snapshot.hasChild("requesterId") ? 
                            snapshot.child("requesterId").getValue(String.class) : null;
                        
                        // Handle case when targetUserEmail is missing
                        String targetUserEmail = null;
                        if (snapshot.hasChild("targetUserEmail")) {
                            targetUserEmail = snapshot.child("targetUserEmail").getValue(String.class);
                        } 
                        
                        // Get target book ID which we'll need regardless
                        String targetBookId = snapshot.hasChild("targetBookId") ? 
                            snapshot.child("targetBookId").getValue(String.class) : null;
                        
                        System.out.println("Request basic details - ID: " + requestId + 
                                         ", requesterID: " + requesterId + 
                                         ", targetBookId: " + targetBookId +
                                         ", targetUserEmail: " + targetUserEmail);
                        
                        // Check if this request matches our search criteria
                        boolean matches = false;
                        
                        // If we're looking for requests where user is the target recipient
                        if (asTarget) {
                            // If targetUserEmail exists and matches
                            if (userEmail.equals(targetUserEmail)) {
                                matches = true;
                                System.out.println("Match found via targetUserEmail");
                            } 
                            // If we don't have targetUserEmail but want to show this request anyway (test only)
                            // In a production system you'd need a way to determine the proper owner 
                            else if (targetUserEmail == null) {
                                matches = true; // TESTING ONLY - remove in production
                                System.out.println("WARNING: Including request with missing targetUserEmail");
                            }
                        } 
                        // If we're looking for requests the user initiated
                        else if (!asTarget && userEmail.equals(requesterId)) {
                            matches = true;
                            System.out.println("Match found as requester");
                        }
                        
                        if (matches) {
                            ExchangeRequest request = new ExchangeRequest();
                            request.setId(requestId);
                            
                            // Set all fields with null checking
                            if (snapshot.hasChild("requesterId"))
                                request.setRequesterId(snapshot.child("requesterId").getValue(String.class));
                            
                            if (snapshot.hasChild("targetBookId"))
                                request.setTargetBookId(snapshot.child("targetBookId").getValue(String.class));
                            
                            // Even if targetUserEmail is missing, set it to help with debugging
                            request.setTargetUserEmail(targetUserEmail != null ? targetUserEmail : userEmail);
                            
                            if (snapshot.hasChild("offeredBookTitle"))
                                request.setOfferedBookTitle(snapshot.child("offeredBookTitle").getValue(String.class));
                            
                            if (snapshot.hasChild("offeredBookAuthor"))
                                request.setOfferedBookAuthor(snapshot.child("offeredBookAuthor").getValue(String.class));
                            
                            if (snapshot.hasChild("offeredBookISBN"))
                                request.setOfferedBookISBN(snapshot.child("offeredBookISBN").getValue(String.class));
                            
                            if (snapshot.hasChild("offeredBookCondition"))
                                request.setOfferedBookCondition(snapshot.child("offeredBookCondition").getValue(String.class));
                            
                            if (snapshot.hasChild("offeredBookId"))
                                request.setOfferedBookId(snapshot.child("offeredBookId").getValue(String.class));
                            
                            // Add handling for the offered book image URL
                            if (snapshot.hasChild("offeredBookImageUrl"))
                                request.setOfferedBookImageUrl(snapshot.child("offeredBookImageUrl").getValue(String.class));
                            
                            if (snapshot.hasChild("status"))
                                request.setStatus(snapshot.child("status").getValue(String.class));
                            
                            if (snapshot.hasChild("createdAt")) {
                                Object createdAtObj = snapshot.child("createdAt").getValue();
                                if (createdAtObj instanceof Long) {
                                    request.setCreatedAt(new Date((Long) createdAtObj));
                                }
                            }
                            
                            requestsList.add(request);
                            System.out.println("Added request to result list: " + request);
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing exchange request: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                System.out.println("Returning " + requestsList.size() + " exchange requests");
                future.complete(requestsList);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Firebase error: " + error.getMessage());
                future.completeExceptionally(error.toException());
            }
        });
        
        return future;
    }
}