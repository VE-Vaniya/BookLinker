package com.example.demo.model;

public class CartItem {
    private String id;
    private String userEmail;
    private String bookId;
    private int quantity;
    private long addedAt;

    public CartItem() {}

    public CartItem(String id, String userEmail, String bookId, int quantity, long addedAt ) {
        this.id=id;
        this.userEmail= userEmail;
        this.bookId=bookId;
        this.quantity=quantity;
        this.addedAt=addedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public long getAddedAt() { return addedAt; }
    public void setAddedAt(long addedAt) { this.addedAt = addedAt; }
}
