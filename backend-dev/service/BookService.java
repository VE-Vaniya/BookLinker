package com.example.demo.service;

import com.example.demo.model.Book;
import com.example.demo.model.WishlistItem;
import com.google.firebase.database.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import javax.annotation.PostConstruct;
import com.google.firebase.FirebaseApp;

@Service
public class BookService {

    private DatabaseReference databaseReference;
    private final ImageUploadService imageUploadService;
    private final FirebaseApp firebaseApp;

    @Autowired
    private final NotificationService notificationService;
   

public BookService(ImageUploadService imageUploadService, FirebaseApp firebaseApp, NotificationService notificationService) {
    this.imageUploadService = imageUploadService;
    this.firebaseApp = firebaseApp;
    this.notificationService = notificationService;
}

    @PostConstruct
    private void init() {
        this.databaseReference = FirebaseDatabase.getInstance(firebaseApp).getReference("books");
    }

    private String sanitizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.replace(".", ",")
                .replace("#", ",")
                .replace("$", ",")
                .replace("[", ",")
                .replace("]", ",");
    }
    

    public String addBook(Book bookRequest, MultipartFile imageFile, boolean isSeller) throws Exception {
        CompletableFuture<String> future = new CompletableFuture<>();
    
        databaseReference.orderByChild("userEmail").equalTo(bookRequest.getUserEmail())
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        boolean bookExists = false;
    
                        for (DataSnapshot bookSnapshot : snapshot.getChildren()) {
                            Book existingBook = bookSnapshot.getValue(Book.class);
    
                            if (existingBook != null
                                    && existingBook.getName().equalsIgnoreCase(bookRequest.getName())
                                    && existingBook.getAuthor().equalsIgnoreCase(bookRequest.getAuthor())
                                    && existingBook.getIsbn().equalsIgnoreCase(bookRequest.getIsbn())
                                    && existingBook.getPrice().equals(bookRequest.getPrice())) {
    
                                // Update quantity
                                int updatedQuantity = existingBook.getQuantity() + bookRequest.getQuantity();
                                databaseReference.child(existingBook.getBookId()).child("quantity")
                                        .setValueAsync(updatedQuantity);
    
                                // Update status to available
                                databaseReference.child(existingBook.getBookId()).child("status")
                                        .setValueAsync("available");
    
                                // Notify users with this book in wishlist
                                DatabaseReference wishlistRef = FirebaseDatabase.getInstance(firebaseApp)
                                        .getReference("wishlists");
    
                                wishlistRef.addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot wishlistSnapshot) {
                                        for (DataSnapshot userSnap : wishlistSnapshot.getChildren()) {
                                            for (DataSnapshot wishSnap : userSnap.getChildren()) {
                                                WishlistItem item = wishSnap.getValue(WishlistItem.class);
                                                if (item == null) continue;
    
                                                Book wishBook = item.getBook();
                                                if (wishBook == null) continue;
    
                                                if (wishBook.getName().equalsIgnoreCase(bookRequest.getName())
                                                        && wishBook.getAuthor().equalsIgnoreCase(bookRequest.getAuthor())
                                                        && wishBook.getIsbn().equalsIgnoreCase(bookRequest.getIsbn())) {
    
                                                    String message = "The book \"" + wishBook.getName() +
                                                            "\" by " + wishBook.getAuthor() + " is now available!";
                                                  
                                                    notificationService.sendNotification(item.getUserEmail(), message);
                                                   
                                                }
                                            }
                                        }
                                        future.complete(existingBook.getBookId());
                                    }
    
                                    @Override
                                    public void onCancelled(DatabaseError error) {
                                        future.completeExceptionally(error.toException());
                                    }
                                });
    
                                bookExists = true;
                                return;
                            }
                        }
    
                        // If book does not exist
                        if (!bookExists) {
                            try {
                                String bookId = UUID.randomUUID().toString();
                                bookRequest.setBookId(bookId);
    
                                String imageUrl = imageUploadService.uploadImage(imageFile);
                                bookRequest.setImageUrl(imageUrl);
    
                                if (!isSeller) {
                                    bookRequest.setPrice(0.0);
                                }
    
                                databaseReference.child(bookId).setValueAsync(bookRequest);
    
                                DatabaseReference wishlistRef = FirebaseDatabase.getInstance(firebaseApp)
                                        .getReference("wishlists");
    
                                wishlistRef.addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot wishlistSnapshot) {
                                        for (DataSnapshot userSnap : wishlistSnapshot.getChildren()) {
                                            for (DataSnapshot wishSnap : userSnap.getChildren()) {
                                                WishlistItem item = wishSnap.getValue(WishlistItem.class);
                                                if (item == null) continue;
    
                                                Book wishBook = item.getBook();
                                                if (wishBook == null) continue;
    
                                                if (wishBook.getName().equalsIgnoreCase(bookRequest.getName())
                                                        && wishBook.getAuthor().equalsIgnoreCase(bookRequest.getAuthor())
                                                        && wishBook.getIsbn().equalsIgnoreCase(bookRequest.getIsbn())) {
    
                                                    databaseReference.child(bookId)
                                                            .child("status").setValueAsync("available");
    
                                                    String message = "The book \"" + wishBook.getName() +
                                                            "\" by " + wishBook.getAuthor() + " is now available!";
                                                    notificationService.sendNotification(item.getUserEmail(), message);
                                                }
                                            }
                                        }
    
                                        future.complete(bookId);
                                    }
    
                                    @Override
                                    public void onCancelled(DatabaseError error) {
                                        future.completeExceptionally(error.toException());
                                    }
                                });
    
                            } catch (Exception e) {
                                future.completeExceptionally(e);
                            }
                        }
                    }
    
                    @Override
                    public void onCancelled(DatabaseError error) {
                        future.completeExceptionally(error.toException());
                    }
                });
    
        return future.get();
    }
    


    public CompletableFuture<List<Book>> getBooksByRole(String role, String userEmail) {
        CompletableFuture<List<Book>> future = new CompletableFuture<>();

        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<Book> filteredBooks = new ArrayList<>();
                String sanitizedEmail = sanitizeEmail(userEmail);

                for (DataSnapshot bookSnapshot : snapshot.getChildren()) {
                    Book book = bookSnapshot.getValue(Book.class);
                    if (book == null) continue;

                    String status = book.getStatus() != null ? book.getStatus().toLowerCase() : "";
                    String email = book.getUserEmail() != null ? sanitizeEmail(book.getUserEmail()).toLowerCase() : "";

                    switch (role.toLowerCase()) {
                        case "buyer":
                            if ("available".equals(status) || "donatable".equals(status)) {
                                filteredBooks.add(book);
                            }
                            break;
                        case "borrower":
                            if ("lending".equals(status)) {
                                filteredBooks.add(book);
                            }
                            break;
                        case "donator":
                            if ("donating".equals(status)) {
                                filteredBooks.add(book);
                            }
                            break;
                        case "seller":
                        case "lender":
                            if (sanitizedEmail != null && email.equals(sanitizedEmail)) {
                                filteredBooks.add(book);
                            }
                            break;
                        case "exchanger":
                            if ("exchangeable".equals(status)) {
                                filteredBooks.add(book);
                            }
                            break;
                        default:
                            break;
                    }
                }

                future.complete(filteredBooks);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    public CompletableFuture<Void> deleteBook(String userEmail, String bookId) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        String sanitizedEmail = sanitizeEmail(userEmail);

        databaseReference.child(bookId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Book book = snapshot.getValue(Book.class);

                if (book != null && sanitizedEmail.equals(sanitizeEmail(book.getUserEmail()))) {
                    databaseReference.child(bookId).removeValueAsync();
                    future.complete(null);
                } else {
                    future.completeExceptionally(new RuntimeException("Book not found or unauthorized access."));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }
    public CompletableFuture<List<Book>> searchBooks(String query, String userEmail) {
        CompletableFuture<List<Book>> future = new CompletableFuture<>();
        
        // Log the incoming search parameters
        System.out.println("Searching for: '" + query + "', userEmail: " + (userEmail != null ? userEmail : "null"));
        
        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<Book> matchedBooks = new ArrayList<>();
                String lowerQuery = query.toLowerCase().trim();
                
                System.out.println("Total books in database: " + snapshot.getChildrenCount());
                
                for (DataSnapshot bookSnapshot : snapshot.getChildren()) {
                    Book book = bookSnapshot.getValue(Book.class);
                    
                    if (book != null) {
                        // Check if book matches the search query
                        boolean matchesQuery = 
                            (book.getName() != null && book.getName().toLowerCase().contains(lowerQuery)) ||
                            (book.getAuthor() != null && book.getAuthor().toLowerCase().contains(lowerQuery)) ||
                            (book.getGenre() != null && book.getGenre().toLowerCase().contains(lowerQuery));
                        
                        // Only filter by user if userEmail is provided
                        boolean shouldIncludeBasedOnUser = true;
                        if (userEmail != null && !userEmail.isEmpty()) {
                            String sanitizedUserEmail = sanitizeEmail(userEmail).toLowerCase();
                            String bookUserEmail = book.getUserEmail() != null ? 
                                sanitizeEmail(book.getUserEmail()).toLowerCase() : "";
                            shouldIncludeBasedOnUser = bookUserEmail.equals(sanitizedUserEmail);
                        }
                        
                        // For buyer view, we only want available or donatable books
                        boolean isAvailableForBuyer = 
                            book.getStatus() != null && 
                            (book.getStatus().equalsIgnoreCase("available") || 
                             book.getStatus().equalsIgnoreCase("donatable"));
                        
                        // Check if the book should be included in results
                        if (matchesQuery && (userEmail == null || shouldIncludeBasedOnUser) && isAvailableForBuyer) {
                            matchedBooks.add(book);
                            System.out.println("Found matching book: " + book.getName());
                        }
                    }
                }
                
                System.out.println("Search complete. Found " + matchedBooks.size() + " matching books.");
                future.complete(matchedBooks);
            }
            
            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Search error: " + error.getMessage());
                future.completeExceptionally(error.toException());
            }
        });
        
        return future;
    }
    
    

    public CompletableFuture<Book> getBookById(String bookId) {
        CompletableFuture<Book> future = new CompletableFuture<>();

        databaseReference.child(bookId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Book book = snapshot.getValue(Book.class);
                if (book != null) {
                    future.complete(book);
                } else {
                    future.completeExceptionally(new RuntimeException("Book not found"));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }

    public CompletableFuture<Void> updateBookStatus(String bookId, String userEmail, String newStatus) {
        CompletableFuture<Void> future = new CompletableFuture<>();

        // Check if book exists
        databaseReference.child(bookId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Book book = snapshot.getValue(Book.class);

                if (book != null) {
                    // Update status
                    book.setStatus(newStatus);
                    databaseReference.child(bookId).setValueAsync(book);

                    future.complete(null);
                } else {
                    future.completeExceptionally(new RuntimeException("Book not found or unauthorized access."));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        return future;
    }
}
