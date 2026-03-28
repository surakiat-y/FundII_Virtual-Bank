package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.UserRepository;
import com.fundii.virtualbank.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(Map.of("message", "สมัครสมาชิกสำเร็จ!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByUsername(loginData.getUsername());

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginData.getPassword())) {
            User user = userOpt.get();

            // 🔥 เพิ่มใหม่: เช็คสถานะการแบนก่อนให้เข้าสู่ระบบ
            if ("BANNED".equals(user.getStatus())) {
                return ResponseEntity.status(403).body(Map.of("error", "บัญชีของคุณถูกระงับการใช้งาน! กรุณาติดต่อแอดมิน"));
            }

            Map<String, Object> safeUserData = new HashMap<>();
            safeUserData.put("id", user.getId());
            safeUserData.put("username", user.getUsername());
            safeUserData.put("firstName", user.getFirstName());
            safeUserData.put("lastName", user.getLastName());
            safeUserData.put("role", user.getRole());
            safeUserData.put("status", user.getStatus());

            return ResponseEntity.ok(safeUserData);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Username หรือ Password ไม่ถูกต้อง!"));
        }
    }
}