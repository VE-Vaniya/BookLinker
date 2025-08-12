package com.example.demo.service;

import com.example.demo.model.CartItem;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class CartService {
    private final DatabaseReference cartRef;

    public CartService(FirebaseApp firebaseApp) {
        this.cartRef = FirebaseDatabase.getInstance(firebaseApp).getReference("carts");
    }

    //  Helper method to sanitize email (Firebase path-safe)
    private String sanitizeEmail(String email) {
        return email.replace(".", ",");
    }


    public CompletableFuture<Void> addToCart(String userEmail, String bookId, int quantity) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        String safeEmail = sanitizeEmail(userEmail);
    
        cartRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                boolean updated = false;
    
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartItem existingItem = child.getValue(CartItem.class);
                    if (existingItem != null && bookId.equals(existingItem.getBookId())) {
                        int updatedQuantity = existingItem.getQuantity() + quantity;
                        child.getRef().child("quantity").setValueAsync(updatedQuantity);
                        updated = true;
                        break;
                    }
                }
    
                if (!updated) {
                    String id = UUID.randomUUID().toString();
                    CartItem newItem = new CartItem();
                    newItem.setId(id);
                    newItem.setUserEmail(userEmail);
                    newItem.setBookId(bookId);
                    newItem.setQuantity(quantity);
                    newItem.setAddedAt(System.currentTimeMillis());
                    cartRef.child(safeEmail).child(id).setValueAsync(newItem);
                }
    
                future.complete(null);
            }
    
            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
    
        return future;
    }
    
    public CompletableFuture<Void> removeFromCart(String userEmail, String bookId) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        String safeEmail = sanitizeEmail(userEmail);
    
        cartRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                boolean found = false;
    
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartItem item = child.getValue(CartItem.class);
                    if (item != null && bookId.equals(item.getBookId())) {
                        int updatedQuantity = item.getQuantity() - 1;
    
                        if (updatedQuantity <= 0) {
                            child.getRef().removeValueAsync(); // Remove if quantity is 0
                        } else {
                            child.getRef().child("quantity").setValueAsync(updatedQuantity); // Just decrement
                        }
    
                        found = true;
                        break;
                    }
                }
    
                if (found) {
                    future.complete(null);
                } else {
                    future.completeExceptionally(new RuntimeException("Item with bookId not found in cart."));
                }
            }
    
            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
    
        return future;
    }
    


    // 📤 Get all cart items for a user
    public CompletableFuture<List<CartItem>> getCart(String userEmail) {
        CompletableFuture<List<CartItem>> future = new CompletableFuture<>();
        String safeEmail = sanitizeEmail(userEmail);
        cartRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<CartItem> items = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    CartItem item = child.getValue(CartItem.class);
                    items.add(item);
                }
                future.complete(items);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    
}
