package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/security")
@CrossOrigin("*")
public class SecurityController {

    @Autowired
    private UserService userService;

    @PostMapping("/setup-pin")
    public ResponseEntity<?> setupPin(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String pin = payload.get("pin").toString();
            userService.updatePin(userId, pin);
            return ResponseEntity.ok(Map.of("message", "ตั้งค่า PIN สำเร็จ!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String pin = payload.get("pin").toString();
            boolean isValid = userService.verifyPin(userId, pin);
            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "PIN ถูกต้อง"));
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "รหัส PIN ไม่ถูกต้อง"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
