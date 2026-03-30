package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.models.UserFund;
import com.fundii.virtualbank.repositories.TransactionRepository;
import com.fundii.virtualbank.repositories.UserFundRepository;
import com.fundii.virtualbank.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
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

    @Autowired
    private UserFundRepository userFundRepository;

    // ✅ 1. ดึงประวัติธุรกรรม (History/Statement)
    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getStatement(@PathVariable Long accountId) {
        try {
            List<Transaction> transactions = transactionRepository.findBySourceAccountIdOrDestinationAccountId(accountId, accountId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ 2. ถอนเงิน (Withdraw)
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.withdraw(accountId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ 3. ลงทุน (Invest)
    @PostMapping("/invest")
    public ResponseEntity<?> investInFund(@RequestBody Map<String, Object> payload) {
        try {
            Long accountId = Long.parseLong(payload.get("accountId").toString());
            Long fundId = Long.parseLong(payload.get("fundId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            transactionService.invest(accountId, fundId, amount);
            return ResponseEntity.ok(Map.of("message", "ลงทุนสำเร็จ! พอร์ตโบรขยับแล้ว"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ 4. โอนเงิน (Transfer)
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> request) {
        try {
            Long sourceId = Long.valueOf(request.get("sourceAccountId").toString());
            Long destId = Long.valueOf(request.get("destinationAccountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.transfer(sourceId, destId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ 5. ย้ายเงินตัวเอง (Move Money)
    @PostMapping("/move-money")
    public ResponseEntity<?> moveMoney(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Move Money Request: " + request);
            Long sourceId = Long.valueOf(request.get("sourceAccountId").toString());
            Long destId = Long.valueOf(request.get("destinationAccountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            return ResponseEntity.ok(transactionService.transfer(sourceId, destId, amount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔥 เพิ่มฟังก์ชันดึงพอร์ตลงทุน
  // 🔥 แก้ไขฟังก์ชันดึงพอร์ตลงทุนให้ดึงติดชัวร์ๆ
    @GetMapping("/portfolio/{userId}")
    public ResponseEntity<?> getUserPortfolio(@PathVariable Long userId) {
        try {
            List<UserFund> portfolio = userFundRepository.findAll()
                .stream()
                .filter(f -> f.getUserId() != null && f.getUserId().longValue() == userId.longValue()) // ✅ เช็คแบบ .longValue() ชัวร์สุดโบร
                .toList();
                
            return ResponseEntity.ok(portfolio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sellFund(@RequestBody Map<String, Object> payload) {
        try {
            Long accountId = Long.parseLong(payload.get("accountId").toString());
            Long fundId = Long.parseLong(payload.get("fundId").toString());
            Double unitsToSell = Double.parseDouble(payload.get("units").toString());

            transactionService.sell(accountId, fundId, unitsToSell);
            return ResponseEntity.ok(Map.of("message", "ขายสำเร็จ! เงินเข้ากระเป๋าแล้วโบร"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}