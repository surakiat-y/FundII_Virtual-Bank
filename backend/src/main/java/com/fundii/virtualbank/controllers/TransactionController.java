package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService; // เรียกใช้ Service ที่เพิ่งสร้าง

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> request) {
        try {
            Long sourceId = Long.valueOf(request.get("sourceAccountId").toString());
            Long destId = Long.valueOf(request.get("destinationAccountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // เรียกใช้ฟังก์ชันโอนเงิน
            return ResponseEntity.ok(transactionService.transfer(sourceId, destId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // เรียกใช้ฟังก์ชันฝากเงิน
            return ResponseEntity.ok(transactionService.deposit(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // เรียกใช้ฟังก์ชันถอนเงิน
            return ResponseEntity.ok(transactionService.withdraw(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}