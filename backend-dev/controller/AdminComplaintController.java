package com.example.demo.controller;

import com.example.demo.model.Complaint;
import com.example.demo.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/admin/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/pending")
    public CompletableFuture<ResponseEntity<List<Complaint>>> getPendingComplaints() {
        return complaintService.getPendingComplaints()
            .thenApply(ResponseEntity::ok)
            .exceptionally(e -> ResponseEntity.internalServerError().build());
    }

    @PostMapping("/impose-fine/{complaintId}")
    public CompletableFuture<ResponseEntity<String>> imposeFine(
            @PathVariable String complaintId,
            @RequestParam double fineAmount,
            @RequestParam double adminPercentage) {
        return complaintService.imposeFine(complaintId, fineAmount, adminPercentage)
            .thenApply(v -> ResponseEntity.ok("Fine imposed successfully"))
            .exceptionally(e -> ResponseEntity.internalServerError().body("Error: " + e.getMessage()));
    }

    @PostMapping("/resolve/{complaintId}")
    public CompletableFuture<ResponseEntity<String>> markComplaintAsResolved(@PathVariable String complaintId) {
        return complaintService.markComplaintAsResolved(complaintId)
            .thenApply(v -> ResponseEntity.ok("Complaint marked as resolved"))
            .exceptionally(e -> ResponseEntity.internalServerError().body("Error: " + e.getMessage()));
    }

    @GetMapping("/paid-fines")
    public CompletableFuture<ResponseEntity<List<Complaint>>> getPaidFines() {
        return complaintService.getPaidFines()
            .thenApply(ResponseEntity::ok)
            .exceptionally(e -> ResponseEntity.internalServerError().build());
    }
}
