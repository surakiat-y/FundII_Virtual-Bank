package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // เวทมนตร์ของ Spring Boot: แค่ตั้งชื่อ Method ตามกฏ มันจะสร้าง SQL หา User จาก Username ให้เลย! (เอาไว้ใช้ตอน Login)
    Optional<User> findByUsername(String username);
}