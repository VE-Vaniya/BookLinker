package com.example.demo.model;

public class WishlistItem {
    private String id;
    private String userEmail;
    private Book book;
    private String bookId; // Added this
    private long addedAt;

    public WishlistItem() {}

    public WishlistItem(String id, String userEmail, Book book,String bookId, long addedAt) {
        this.id=id;
        this.userEmail=userEmail;
        this.book=book;
        this.bookId=bookId;
        this.addedAt=addedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public String getBookId() { return bookId; } // New getter
    public void setBookId(String bookId) { this.bookId = bookId; } // New setter

    public long getAddedAt() { return addedAt; }
    public void setAddedAt(long addedAt) { this.addedAt = addedAt; }
}
