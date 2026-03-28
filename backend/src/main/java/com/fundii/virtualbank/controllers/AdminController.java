package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.UserRepository;
import com.fundii.virtualbank.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> safeUsers = userRepository.findAll().stream().map(user -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
            userData.put("lastName", user.getLastName() != null ? user.getLastName() : "");
            userData.put("role", user.getRole());
            userData.put("status", user.getStatus());
            return userData;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(safeUsers);
    }

    // 🔥 ระบบอัปเดตสถานะ (รองรับ ACTIVE, SUSPENDED, BANNED)
    @PostMapping("/user/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้งานนี้"));

            user.setStatus(newStatus);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "อัปเดตสถานะสำเร็จ");
            response.put("newStatus", newStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/mint-money")
    public ResponseEntity<?> mintMoney(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.deposit(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}