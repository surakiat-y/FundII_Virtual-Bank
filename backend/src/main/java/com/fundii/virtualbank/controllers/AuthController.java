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
            Map<String, Object> result = userService.registerUser(user);
            return ResponseEntity.ok(Map.of(
                "message", "Registration successful!",
                "accountNumber", result.get("accountNumber")
            ));
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
                return ResponseEntity.status(403).body(Map.of("error", "Your account is banned! Please contact support."));
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
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid username or password!"));
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("status", userOpt.get().getStatus()));
        }
        return ResponseEntity.notFound().build();
    }
}