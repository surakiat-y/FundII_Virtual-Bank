package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service // บอก Spring Boot ว่านี่คือ Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;

    // ฟังก์ชันสมัครสมาชิก (Register)
    public User registerUser(User user) {
        // 1. เช็คว่ามี Username นี้ซ้ำในระบบหรือยัง
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Username นี้มีคนใช้แล้วครับ!"); // ถ้าซ้ำให้แจ้ง Error
        }

        // 2. เรื่องการเข้ารหัส Password (Hashing)
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. บันทึกข้อมูลลง Database
        return userRepository.save(user);
    }
}