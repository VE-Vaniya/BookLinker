package com.example.demo.model;
import jakarta.validation.constraints.NotBlank;

public class Book {
    private String bookId;
    private String userId;

    @NotBlank(message = "User Email is required")
    private String userEmail;

    @NotBlank(message = "Book name is required")
    private String name;

    @NotBlank(message = "Author name is required")
    private String author;

    private Double price;
    private String isbn;
    private String status; 
    private String genre; 
    private String condition;
    private String description;
    private String imageUrl;
    private int quantity;

    // Empty Constructor (for Firebase)
    public Book() {
    }

    // Constructor with all fields
    public Book(String bookId, String userId,String userEmail, String name, String author, Double price,
                String isbn, String status,String genre, String condition, String description, String imageUrl , int quantity) {
        this.bookId = bookId;
        this.userId = userId;
        this.userEmail=userEmail;
        this.name = name;
        this.author = author;
        this.price = price;
        this.isbn = isbn;
        this.status=status;
        this.genre=genre;
        this.condition = condition;
        this.description = description;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
    }

    // Getters and Setters
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
