package com.example.demo.model;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.firebase.database.Exclude;

public class TransactionHistory {
    private String id;
    private String bookId;
    private String bookName;
    private String imageUrl;
    private String userEmail;
    private String status; // sold, purchased, exchanged_out, exchanged_in
    private String otherPartyEmail;  // email of buyer/seller/exchange partner
    private String exchangeBookId;  // ID of the book received in exchange (if applicable)
    private String exchangeBookName;  // Name of the book received in exchange
    private String exchangeBookImage; // Image of the book received in exchange
    private Date transactionDate;

    public TransactionHistory() {
        // Default constructor required for Firebase
    }

    // Constructor for sale/purchase transactions
    public TransactionHistory(String bookId, String bookName, String imageUrl, 
                             String userEmail, String status, String otherPartyEmail) {
        this.bookId = bookId;
        this.bookName = bookName;
        this.imageUrl = imageUrl;
        this.userEmail = userEmail;
        this.status = status;
        this.otherPartyEmail = otherPartyEmail;
        this.transactionDate = new Date();
    }

    // Constructor for exchange transactions
    public TransactionHistory(String bookId, String bookName, String imageUrl, 
                             String userEmail, String status, String otherPartyEmail,
                             String exchangeBookId, String exchangeBookName, String exchangeBookImage) {
        this(bookId, bookName, imageUrl, userEmail, status, otherPartyEmail);
        this.exchangeBookId = exchangeBookId;
        this.exchangeBookName = exchangeBookName;
        this.exchangeBookImage = exchangeBookImage;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOtherPartyEmail() {
        return otherPartyEmail;
    }

    public void setOtherPartyEmail(String otherPartyEmail) {
        this.otherPartyEmail = otherPartyEmail;
    }

    public String getExchangeBookId() {
        return exchangeBookId;
    }

    public void setExchangeBookId(String exchangeBookId) {
        this.exchangeBookId = exchangeBookId;
    }

    public String getExchangeBookName() {
        return exchangeBookName;
    }

    public void setExchangeBookName(String exchangeBookName) {
        this.exchangeBookName = exchangeBookName;
    }

    public String getExchangeBookImage() {
        return exchangeBookImage;
    }

    public void setExchangeBookImage(String exchangeBookImage) {
        this.exchangeBookImage = exchangeBookImage;
    }

    public Date getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(Date transactionDate) {
        this.transactionDate = transactionDate;
    }

    @Exclude
    public Map<String, Object> toMap() {
        HashMap<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("bookId", bookId);
        result.put("bookName", bookName);
        result.put("imageUrl", imageUrl);
        result.put("userEmail", userEmail);
        result.put("status", status);
        result.put("otherPartyEmail", otherPartyEmail);
        result.put("transactionDate", transactionDate.getTime());
        
        // Include exchange fields only if they're not null
        if (exchangeBookId != null) {
            result.put("exchangeBookId", exchangeBookId);
        }
        if (exchangeBookName != null) {
            result.put("exchangeBookName", exchangeBookName);
        }
        if (exchangeBookImage != null) {
            result.put("exchangeBookImage", exchangeBookImage);
        }
        
        return result;
    }
}
