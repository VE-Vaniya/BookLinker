package com.example.demo.model;

public class OrderItem {
    private String bookId;
    private String bookName;
    private int quantity;
    private double pricePerUnit;
    private double totalPrice;

    public OrderItem() {}

    public OrderItem(String bookId, String bookName, int quantity, double pricePerUnit) {
        this.bookId = bookId;
        this.bookName = bookName;
        this.quantity = quantity;
        this.pricePerUnit = pricePerUnit;
        this.totalPrice = pricePerUnit * quantity;
    }

    // Getters & Setters
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getBookName() { return bookName; }
    public void setBookName(String bookName) { this.bookName = bookName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(double pricePerUnit) { this.pricePerUnit = pricePerUnit; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
}
