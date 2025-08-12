package com.example.demo.model;

import java.util.List;

public class Order {
    private String orderId;
    private String userEmail;
    private List<OrderItem> items;
    private double totalAmount;
    private long orderTimestamp;
    private String status; // e.g., "Pending", "Paid", "Shipped"

    public Order() {}

    public Order(String orderId, String userEmail, List<OrderItem> items, double totalAmount, long orderTimestamp, String status) {
        this.orderId = orderId;
        this.userEmail = userEmail;
        this.items = items;
        this.totalAmount = totalAmount;
        this.orderTimestamp = orderTimestamp;
        this.status = status;
    }
    

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public long getOrderTimestamp() { return orderTimestamp; }
    public void setOrderTimestamp(long orderTimestamp) { this.orderTimestamp = orderTimestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
