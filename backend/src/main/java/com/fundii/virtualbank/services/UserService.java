package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository; // เพิ่ม Repository ของบัญชี

    @Transactional // ถ้าสร้าง User สำเร็จแต่สร้าง Account พลาด ระบบจะ Rollback ให้ (ไม่สมัคร User ให้)
    public User registerUser(User user) {
        // 1. เช็คว่ามี Username นี้ซ้ำในระบบหรือยัง
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Username นี้มีคนใช้แล้วครับ!");
        }

        // 2. ตั้งค่าเริ่มต้นให้ User
        user.setRole("USER");
        user.setStatus("ACTIVE");

        // 3. บันทึก User ลง Database
        User savedUser = userRepository.save(user);

        // 4. 🔥 สร้างบัญชีหลัก (Main Account) ให้ User ทันที
        Account mainAccount = new Account();
        mainAccount.setAccountName("Main Account");
        mainAccount.setBalance(new BigDecimal("0.00"));
        mainAccount.setStatus("ACTIVE");
        mainAccount.setUser(savedUser); // ผูกบัญชีเข้ากับ User ที่เพิ่งบันทึก

        // สุ่มเลขบัญชี 10 หลัก
        String accNum = String.valueOf((long) (Math.random() * 9000000000L) + 1000000000L);
        mainAccount.setAccountNumber(accNum);

        // 5. บันทึก Account ลง Database
        accountRepository.save(mainAccount);

        return savedUser;
    }
}