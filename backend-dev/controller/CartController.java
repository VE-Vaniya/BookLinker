package com.example.demo.controller;

import com.example.demo.model.CartItem;
import com.example.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")

public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public CompletableFuture<ResponseEntity<String>> addToCart(@RequestParam String userEmail,
                                                                @RequestParam String bookId,
                                                                @RequestParam int quantity) {
        return cartService.addToCart(userEmail, bookId, quantity)
                .thenApply(unused -> ResponseEntity.ok("Book added to cart."))
                .exceptionally(e -> ResponseEntity.status(500).body("Error: " + e.getMessage()));
    }

    @DeleteMapping("/remove")
    public CompletableFuture<ResponseEntity<String>> removeFromCart(@RequestParam String userEmail,
                                                                     @RequestParam String bookId) {
        return cartService.removeFromCart(userEmail, bookId)
                .thenApply(unused -> ResponseEntity.ok("Book removed from cart."))
                .exceptionally(e -> ResponseEntity.status(500).body("Error: " + e.getMessage()));
    }
    

    @GetMapping("/get")
    public CompletableFuture<ResponseEntity<List<CartItem>>> getCart(@RequestParam String userEmail) {
        return cartService.getCart(userEmail)
                .thenApply(ResponseEntity::ok)
                .exceptionally(e -> ResponseEntity.status(500).build());
    }
}
