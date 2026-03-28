package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.repositories.TransactionRepository;
import com.fundii.virtualbank.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin("*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    // 1. ดึงประวัติธุรกรรม (Statement)
    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getStatement(@PathVariable Long accountId) {
        try {
            List<Transaction> transactions = transactionRepository.findBySourceAccountIdOrDestinationAccountId(accountId, accountId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. โอนเงินให้คนอื่น พร้อมข้อมูลสลิป
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> request) {
        try {
            Long sourceId = Long.valueOf(request.get("sourceAccountId").toString());
            Long destId = Long.valueOf(request.get("destinationAccountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            // เรียก Service คืนค่าเป็น Transaction Object
            Transaction tx = transactionService.transfer(sourceId, destId, amount);

            // 🔥 สร้างก้อนข้อมูล JSON ส่งกลับไปให้ React ทำสลิป
            Map<String, Object> slip = new HashMap<>();
            slip.put("transactionId", tx.getId());
            slip.put("amount", tx.getAmount());
            slip.put("date", tx.getTransactionDate()); // ✅ แก้จาก getTimestamp เป็น getTransactionDate
            slip.put("type", tx.getTransactionType());
            
            // ข้อมูลคนโอน (From)
            slip.put("fromName", tx.getSourceAccount().getUser().getFirstName() + " " + tx.getSourceAccount().getUser().getLastName());
            slip.put("fromAccount", tx.getSourceAccount().getAccountNumber());
            
            // ข้อมูลคนรับ (To)
            slip.put("toName", tx.getDestinationAccount().getUser().getFirstName() + " " + tx.getDestinationAccount().getUser().getLastName());
            slip.put("toAccount", tx.getDestinationAccount().getAccountNumber());
            slip.put("toPocket", tx.getDestinationAccount().getAccountName());

            return ResponseEntity.ok(slip); 
        } catch (Exception e) {
            // แก้ไขการส่ง Error ให้ React อ่านง่ายขึ้น
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 3. ฝากเงิน (เสกเงินโดยแอดมิน)
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.deposit(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. ถอนเงิน
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.withdraw(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. ย้ายเงินตัวเอง (Move Money)
    @PostMapping("/move-money")
    public ResponseEntity<?> moveMoney(@RequestBody Map<String, Object> payload) {
        try {
            Long sourceId = Long.valueOf(payload.get("sourceAccountId").toString());
            Long destId = Long.valueOf(payload.get("destinationAccountId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            transactionService.transfer(sourceId, destId, amount);
           
            return ResponseEntity.ok(Map.of("message", "ย้ายเงินสำเร็จ!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}