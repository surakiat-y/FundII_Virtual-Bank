package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.models.UserFund;
import com.fundii.virtualbank.models.Fund;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.TransactionRepository;
import com.fundii.virtualbank.repositories.UserFundRepository;
import com.fundii.virtualbank.repositories.FundRepository;
import com.fundii.virtualbank.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin("*")
public class TransactionController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserFundRepository userFundRepository;

    @Autowired
    private FundRepository fundRepository;

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
    @Transactional
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            Long accountId = Long.valueOf(request.get("accountId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            Account account = accountRepository.findById(accountId).orElseThrow();
            
            if (account.getBalance().compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "เงินไม่พอถอนนะโบร!"));
            }

            // หักเงินในบัญชี
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);

            // บันทึกธุรกรรมลง History
            Transaction tx = new Transaction();
            tx.setSourceAccount(account);
            tx.setAmount(amount);
            tx.setTransactionType("WITHDRAW");
            tx.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(tx);

            return ResponseEntity.ok(Map.of("message", "ถอนเงินสำเร็จ!", "newBalance", account.getBalance()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ 3. ลงทุน (Invest)
    @PostMapping("/invest")
    @Transactional
    public ResponseEntity<?> investInFund(@RequestBody Map<String, Object> payload) {
        try {
            Long accountId = Long.parseLong(payload.get("accountId").toString());
            Long fundId = Long.parseLong(payload.get("fundId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            Account account = accountRepository.findById(accountId).orElseThrow();
            Fund fund = fundRepository.findById(fundId).orElseThrow();
            
            if (account.getBalance().compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "เงินไม่พอลงทุนนะโบร!"));
            }

            // หักเงิน
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);

            // คำนวณหน่วยและบันทึกพอร์ต
            Double unitsToBuy = amount.doubleValue() / fund.getNav();
            UserFund userFund = userFundRepository.findByUserIdAndFundId(account.getUser().getId(), fundId)
                    .orElse(new UserFund(account.getUser().getId(), fundId, 0.0, fund.getNav()));

            userFund.setUnits(userFund.getUnits() + unitsToBuy);
            userFundRepository.save(userFund);

            // บันทึกประวัติ
            Transaction tx = new Transaction();
            tx.setSourceAccount(account);
            tx.setAmount(amount);
            tx.setTransactionType("INVESTMENT");
            tx.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(tx);

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
    @Transactional
    public ResponseEntity<?> sellFund(@RequestBody Map<String, Object> payload) {
        try {
            Long accountId = Long.parseLong(payload.get("accountId").toString());
            Long fundId = Long.parseLong(payload.get("fundId").toString());
            Double unitsToSell = Double.parseDouble(payload.get("units").toString());

            // 1. ดึงข้อมูลพอร์ต และ กองทุน (เพื่อเอาราคา NAV ปัจจุบันมาคูณเป็นเงิน)
            UserFund userFund = userFundRepository.findByUserIdAndFundId(
                accountRepository.findById(accountId).get().getUser().getId(), fundId)
                .orElseThrow(() -> new RuntimeException("โบรไม่มีกองทุนนี้นะ!"));
            
            Fund fund = fundRepository.findById(fundId).orElseThrow();
            Account account = accountRepository.findById(accountId).orElseThrow();

            // 2. เช็คว่ามีหน่วยลงทุนพอขายมั้ย
            if (userFund.getUnits() < unitsToSell) {
                return ResponseEntity.badRequest().body(Map.of("error", "หน่วยลงทุนไม่พอขายนะโบร!"));
            }

            // 3. คำนวณเงินที่จะได้รับ (หน่วยที่ขาย * ราคา NAV ปัจจุบัน)
            BigDecimal moneyReceived = BigDecimal.valueOf(unitsToSell * fund.getNav());

            // 4. หักหน่วยลงทุน (ถ้าขายหมดก็ลบแถวทิ้ง หรือเซตเป็น 0)
            userFund.setUnits(userFund.getUnits() - unitsToSell);
            if (userFund.getUnits() <= 0) {
                userFundRepository.delete(userFund);
            } else {
                userFundRepository.save(userFund);
            }

            // 5. เอาเงินเข้ากระเป๋า
            account.setBalance(account.getBalance().add(moneyReceived));
            accountRepository.save(account);

            // 6. บันทึก Statement
            Transaction tx = new Transaction();
            tx.setSourceAccount(account);
            tx.setAmount(moneyReceived);
            tx.setTransactionType("SELL_FUND");
            tx.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(tx);

            return ResponseEntity.ok(Map.of("message", "ขายสำเร็จ! เงินเข้ากระเป๋าแล้วโบร", "received", moneyReceived));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}