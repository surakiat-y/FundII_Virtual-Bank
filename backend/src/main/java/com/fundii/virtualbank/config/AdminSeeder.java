package com.fundii.virtualbank.config;

import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // เช็คว่าในฐานข้อมูลมีคนใช้ Username ว่า "admin" หรือยัง
        if (userRepository.findByUsername("admin").isEmpty()) {
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123"); // รหัสผ่านของแอดมิน
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setRole("ADMIN"); 
            admin.setStatus("ACTIVE");

            userRepository.save(admin);
            
            System.out.println("✅ สร้างบัญชี Admin เริ่มต้นสำเร็จ! (Username: admin / Password: admin123)");
        }
    }
}