package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.UserRepository;
import com.fundii.virtualbank.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;

    // 1. สมัครสมาชิก
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.registerUser(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. เข้าสู่ระบบ (Login) แบบเบื้องต้น
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByUsername(loginData.getUsername());
        
        // เช็คว่ามี User ไหม และ Password ตรงไหม (ตอนนี้เช็คแบบ String ธรรมดาก่อน ค่อยใส่ Hash ทีหลัง)
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginData.getPassword())) {
            return ResponseEntity.ok(userOpt.get()); // ส่งข้อมูล User กลับไปให้หน้าเว็บ
        } else {
            return ResponseEntity.badRequest().body("Username หรือ Password ไม่ถูกต้อง!");
        }
    }
}