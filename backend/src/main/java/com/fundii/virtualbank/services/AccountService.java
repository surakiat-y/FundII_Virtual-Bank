package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    // ฟังก์ชันเปิดบัญชีใหม่ให้ผู้ใช้
    public Account createAccount(Long userId, String accountName) {
        // 1. หาตัว User ก่อนว่ามีจริงไหม
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้งานนี้ในระบบ"));

        // 2. สร้างบัญชีใหม่
        Account newAccount = new Account();
        newAccount.setUser(user);
        newAccount.setAccountName(accountName); // เช่น "บัญชีหลัก" หรือ "เงินออม"
        newAccount.setBalance(BigDecimal.ZERO); // เริ่มต้นมีเงิน 0 บาท
        
        // สุ่มเลขบัญชี 10 หลัก (แบบง่ายๆ ไปก่อน)
        String randomAccNum = String.valueOf((long) (Math.random() * 10000000000L));
        newAccount.setAccountNumber(randomAccNum);

        // 3. บันทึกลงฐานข้อมูล
        return accountRepository.save(newAccount);
    }
}