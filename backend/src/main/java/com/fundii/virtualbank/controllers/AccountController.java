package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.services.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    // 1. ดึงบัญชีทั้งหมดของ User คนนั้น (เอาไปโชว์ใน Dashboard)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Account>> getUserAccounts(@PathVariable Long userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    // 2. สร้างบัญชีใหม่ / บัญชีย่อย
    @PostMapping("/user/{userId}/create")
    public ResponseEntity<?> createSubAccount(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String accountName = request.get("accountName"); // หน้าเว็บต้องส่ง JSON: {"accountName": "เงินออม"}
            Account newAccount = accountService.createAccount(userId, accountName);
            return ResponseEntity.ok(newAccount);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}