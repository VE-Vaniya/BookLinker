package com.example.demo.service;

import com.example.demo.model.Rating;
import com.example.demo.model.User;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.*;

@Service
public class RatingService {
    private final DatabaseReference ratingsRef = FirebaseDatabase.getInstance().getReference("ratings");
    private final DatabaseReference usersRef = FirebaseDatabase.getInstance().getReference("users");

    public CompletableFuture<Map<String, Object>> submitRating(Rating rating) {
        CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();
        String safeRatedEmail = rating.getRatedEmail().replace(".", ",");
        
        ratingsRef.orderByChild("raterEmail_ratedEmail")
                .equalTo(rating.getRaterEmail() + "_" + rating.getRatedEmail())
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            future.completeExceptionally(new RuntimeException("User already rated this profile"));
                            return;
                        }

                        rating.setId(UUID.randomUUID().toString());
                        rating.setTimestamp(String.valueOf(System.currentTimeMillis()));

                        usersRef.child(safeRatedEmail).runTransaction(new Transaction.Handler() {
                            @Override
                            public Transaction.Result doTransaction(MutableData currentData) {
                                User user = currentData.getValue(User.class);
                                if (user == null) {
                                    user = new User();
                                    user.setEmail(rating.getRatedEmail());
                                    user.setAverageRating((double) rating.getStars());
                                    user.setRatingCount(1);
                                } else {
                                    double currentTotal = user.getAverageRating() * user.getRatingCount();
                                    int newCount = user.getRatingCount() + 1;
                                    user.setAverageRating((currentTotal + rating.getStars()) / newCount);
                                    user.setRatingCount(newCount);
                                }
                                currentData.setValue(user);
                                return Transaction.success(currentData);
                            }

                            @Override
                            public void onComplete(DatabaseError error, boolean committed, DataSnapshot snapshot) {
                                if (error != null || !committed) {
                                    future.completeExceptionally(error != null ? 
                                        error.toException() : 
                                        new RuntimeException("Transaction failed to commit"));
                                    return;
                                }

                                ratingsRef.child(rating.getId()).setValue(rating.toMap(), (dbError, ref) -> {
                                    if (dbError != null) {
                                        future.completeExceptionally(dbError.toException());
                                    } else {
                                        User updatedUser = snapshot.getValue(User.class);
                                        Map<String, Object> result = new HashMap<>();
                                        result.put("ratingId", rating.getId());
                                        result.put("averageRating", updatedUser.getAverageRating());
                                        result.put("ratingCount", updatedUser.getRatingCount());
                                        future.complete(result);
                                    }
                                });
                            }
                        });
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        future.completeExceptionally(error.toException());
                    }
                });
        return future;
    }

    public CompletableFuture<Map<String, Object>> getUserRatingStats(String email) {
        CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();
        String safeEmail = email.replace(".", ",");
        
        usersRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                User user = snapshot.getValue(User.class);
                if (user != null) {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("averageRating", user.getAverageRating());
                    stats.put("ratingCount", user.getRatingCount());
                    future.complete(stats);
                } else {
                    future.complete(Map.of(
                        "averageRating", 0.0,
                        "ratingCount", 0
                    ));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<List<Rating>> getRatingsByUser(String email, int limit) {
        CompletableFuture<List<Rating>> future = new CompletableFuture<>();
        
        ratingsRef.orderByChild("ratedEmail")
            .equalTo(email)
            .limitToLast(limit)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    List<Rating> ratings = new ArrayList<>();
                    for (DataSnapshot child : snapshot.getChildren()) {
                        Map<String, Object> ratingMap = (Map<String, Object>) child.getValue();
                        if (ratingMap != null) {
                            Rating rating = new Rating();
                            rating.setId((String) ratingMap.get("id"));
                            rating.setRaterEmail((String) ratingMap.get("raterEmail"));
                            rating.setRatedEmail((String) ratingMap.get("ratedEmail"));
                            rating.setStars(((Long) ratingMap.get("stars")).intValue());
                            rating.setTimestamp((String) ratingMap.get("timestamp"));
                            ratings.add(rating);
                        }
                    }
                    future.complete(ratings);
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(error.toException());
                }
            });
        return future;
    }
}