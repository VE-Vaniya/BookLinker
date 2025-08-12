package com.example.demo.service;

import com.example.demo.model.Book;
import com.example.demo.model.WishlistItem;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class WishlistService {
    private final DatabaseReference wishlistRef;

    public WishlistService(FirebaseApp firebaseApp) {
        this.wishlistRef = FirebaseDatabase.getInstance(firebaseApp).getReference("wishlists");
    }

    public CompletableFuture<Void> addToWishlist(String userEmail, String bookId) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        String safeEmail = userEmail.replace(".", "_");

        // Fetch the book details
        DatabaseReference booksRef = FirebaseDatabase.getInstance().getReference("books");
        booksRef.child(bookId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Book book = snapshot.getValue(Book.class);
                if (book == null) {
                    future.completeExceptionally(new RuntimeException("Book not found."));
                    return;
                }

                // Check if already in wishlist
                wishlistRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        for (DataSnapshot child : snapshot.getChildren()) {
                            WishlistItem existingItem = child.getValue(WishlistItem.class);
                            if (existingItem != null && bookId.equals(existingItem.getBookId())) {
                                future.complete(null); // Already exists
                                return;
                            }
                        }

                        // Add new wishlist item
                        String id = UUID.randomUUID().toString();
                        WishlistItem newItem = new WishlistItem();
                        newItem.setId(id);
                        newItem.setUserEmail(userEmail);
                        newItem.setBook(book);
                        newItem.setBookId(bookId); // Set bookId separately
                        newItem.setAddedAt(System.currentTimeMillis());

                        wishlistRef.child(safeEmail).child(id).setValue(newItem, (error, ref) -> {
                            if (error != null) {
                                future.completeExceptionally(error.toException());
                            } else {
                                future.complete(null);
                            }
                        });
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        future.completeExceptionally(error.toException());
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

    public CompletableFuture<Void> removeFromWishlist(String userEmail, String bookId) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        String safeEmail = userEmail.replace(".", "_");

        wishlistRef.child(safeEmail).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                boolean found = false;
                for (DataSnapshot child : snapshot.getChildren()) {
                    WishlistItem item = child.getValue(WishlistItem.class);
                    if (item != null && bookId.equals(item.getBookId())) {
                        child.getRef().removeValue((error, ref) -> {
                            if (error != null) {
                                future.completeExceptionally(error.toException());
                            } else {
                                future.complete(null);
                            }
                        });
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    future.completeExceptionally(new RuntimeException("Book not found in wishlist."));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    public CompletableFuture<List<WishlistItem>> getWishlist(String userEmail) {
        CompletableFuture<List<WishlistItem>> future = new CompletableFuture<>();
        wishlistRef.child(userEmail.replace(".", "_")).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<WishlistItem> items = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    WishlistItem item = child.getValue(WishlistItem.class);
                    if (item != null) {
                        items.add(item);
                    }
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
