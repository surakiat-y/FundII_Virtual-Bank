package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.services.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin("*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    // 1. ดึงบัญชีที่ยังใช้งานได้ของ User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Account>> getUserAccounts(@PathVariable Long userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    // 2. สร้างบัญชีย่อยพร้อมเป้าหมายการออม
    @PostMapping("/user/{userId}/create")
    public ResponseEntity<?> createSubAccount(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            String accountName = request.get("accountName").toString();
            
            BigDecimal savingsGoal = BigDecimal.ZERO;
            if (request.containsKey("savingsGoal") && request.get("savingsGoal") != null) {
                savingsGoal = new BigDecimal(request.get("savingsGoal").toString());
            }

            Account newAccount = accountService.createAccount(userId, accountName, savingsGoal);
            return ResponseEntity.ok(newAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. ค้นหาบัญชีจากเลขบัญชี (โอนเงิน)
    @GetMapping("/search")
    public ResponseEntity<?> searchAccount(@RequestParam String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. ลบบัญชีย่อย (ลบจริงแบบกวาดล้างประวัติธุรกรรมพ่วงท้าย)
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long accountId) {
        try {
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลบัญชี"));

            // 🚫 ดัก 1: เช็คยอดเงินต้องเป็น 0 เท่านั้นถึงจะยอมให้ลบ
            if (account.getBalance().compareTo(BigDecimal.ZERO) > 0) {
                return ResponseEntity.badRequest().body("ไม่สามารถลบได้: กรุณาย้ายเงินออกให้หมดก่อน (ยอดคงเหลือต้องเป็น 0)");
            }

            // 🚫 ดัก 2: ห้ามลบบัญชีหลัก (ถ้าเหลือบัญชีเดียวห้ามลบ)
            List<Account> userAccounts = accountRepository.findByUserId(account.getUser().getId());
            if (userAccounts.size() <= 1) {
                return ResponseEntity.badRequest().body("ไม่สามารถลบบัญชีหลักได้ ต้องมีอย่างน้อย 1 บัญชีในระบบ");
            }

            // ✅ สั่งลบ (ถ้าใน Model Account ใส่ CascadeType.ALL ไว้แล้ว มันจะลบ Transaction ที่พ่วงอยู่ให้เอง)
            accountRepository.delete(account);
            
            return ResponseEntity.ok(Map.of("message", "ลบกระเป๋าเงินและประวัติธุรกรรมเรียบร้อยแล้ว"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("ลบไม่สำเร็จ: " + e.getMessage());
        }
    }
}