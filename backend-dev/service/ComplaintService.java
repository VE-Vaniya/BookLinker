package com.example.demo.service;

import com.example.demo.model.Complaint;
import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;
import com.google.firebase.FirebaseApp;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Service
public class ComplaintService {

    private DatabaseReference databaseReference;
    private final FirebaseApp firebaseApp;
    private final Executor executor = Executors.newFixedThreadPool(2);

    public ComplaintService(FirebaseApp firebaseApp) {
        this.firebaseApp = firebaseApp;
    }

    @PostConstruct
    private void init() {
        this.databaseReference = FirebaseDatabase.getInstance(firebaseApp).getReference("complaints");
    }

    public CompletableFuture<String> fileComplaint(Complaint complaint) {
        CompletableFuture<String> future = new CompletableFuture<>();

        try {
            String complaintId = UUID.randomUUID().toString();
            complaint.setId(complaintId);
            complaint.setStatus("Pending");
            complaint.setTimestamp(String.valueOf(System.currentTimeMillis()));
            complaint.setFineAmount(0.0);
            complaint.setAdminCut(0.0);
            complaint.setFinePaid(false);
            complaint.setResolvedAt(null);

            ApiFuture<Void> apiFuture = databaseReference.child(complaintId).setValueAsync(complaint);

            apiFuture.addListener(() -> {
                try {
                    apiFuture.get();
                    future.complete(complaintId);
                } catch (Exception e) {
                    future.completeExceptionally(e);
                }
            }, executor);

        } catch (Exception e) {
            future.completeExceptionally(e);
        }

        return future;
    }

    public CompletableFuture<List<Complaint>> getPendingComplaints() {
        CompletableFuture<List<Complaint>> future = new CompletableFuture<>();

        databaseReference.orderByChild("status").equalTo("Pending")
            .addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    List<Complaint> complaints = new ArrayList<>();
                    for (DataSnapshot snap : snapshot.getChildren()) {
                        Complaint complaint = snap.getValue(Complaint.class);
                        if (complaint != null) {
                            complaints.add(complaint);
                        }
                    }
                    future.complete(complaints);
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(error.toException());
                }
            });

        return future;
    }

    public CompletableFuture<Void> imposeFine(String complaintId, double fineAmount, double adminPercentage) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        databaseReference.child(complaintId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Complaint complaint = snapshot.getValue(Complaint.class);
                if (complaint != null) {
                    double adminCut = fineAmount * (adminPercentage / 100);
                    complaint.setFineAmount(fineAmount);
                    complaint.setAdminCut(adminCut);
                    complaint.setStatus("Pending");
                    databaseReference.child(complaintId).setValueAsync(complaint);
                    future.complete(null);
                } else {
                    future.completeExceptionally(new Exception("Complaint not found"));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    public CompletableFuture<Void> markComplaintAsResolved(String complaintId) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        databaseReference.child(complaintId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Complaint complaint = snapshot.getValue(Complaint.class);
                if (complaint != null) {
                    complaint.setStatus("Resolved");
                    complaint.setResolvedAt(String.valueOf(System.currentTimeMillis()));
                    databaseReference.child(complaintId).setValueAsync(complaint);
                    future.complete(null);
                } else {
                    future.completeExceptionally(new Exception("Complaint not found"));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    public CompletableFuture<List<Complaint>> getPaidFines() {
        CompletableFuture<List<Complaint>> future = new CompletableFuture<>();

        databaseReference.orderByChild("finePaid").equalTo(true)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    List<Complaint> complaints = new ArrayList<>();
                    for (DataSnapshot snap : snapshot.getChildren()) {
                        Complaint complaint = snap.getValue(Complaint.class);
                        if (complaint != null) {
                            complaints.add(complaint);
                        }
                    }
                    future.complete(complaints);
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(error.toException());
                }
            });

        return future;
    }
}
