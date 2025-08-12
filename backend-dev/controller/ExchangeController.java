package com.example.demo.controller;

import com.example.demo.model.ExchangeRequest;
import com.example.demo.service.ExchangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/exchange")
@CrossOrigin(origins = "http://localhost:5173")
public class ExchangeController {
    @Autowired
    private ExchangeService exchangeService;

    @PostMapping("/request")
    public CompletableFuture<ResponseEntity<String>> createExchangeRequest(
            @RequestBody ExchangeRequest request) {
        return exchangeService.createExchangeRequest(request)
                .thenApply(requestId -> ResponseEntity.ok(requestId))
                .exceptionally(e -> ResponseEntity.badRequest().body("Failed to create exchange request"));
    }

    @PostMapping("/{requestId}/status")
    public CompletableFuture<ResponseEntity<String>> updateRequestStatus(
            @PathVariable String requestId,
            @RequestParam String status) {
        
        return exchangeService.updateRequestStatus(requestId, status)
                .thenApply(task -> ResponseEntity.ok("Status updated"))
                .exceptionally(e -> ResponseEntity.badRequest().body("Failed to update status"));
    }
    
    // New endpoint to fetch exchange requests
    @GetMapping("/requests")
    public CompletableFuture<ResponseEntity<List<ExchangeRequest>>> getExchangeRequests(
            @RequestParam String userEmail, 
            @RequestParam(defaultValue = "true") boolean asTarget) {
        
        return exchangeService.getExchangeRequestsByUserEmail(userEmail, asTarget)
                .thenApply(requests -> ResponseEntity.ok(requests))
                .exceptionally(e -> {
                    e.printStackTrace();
                    return ResponseEntity.badRequest().body(null);
                });
    }
}