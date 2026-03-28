package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.UserFund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // 🔥 อย่าลืม import
import java.util.Optional;

public interface UserFundRepository extends JpaRepository<UserFund, Long> {
    Optional<UserFund> findByUserIdAndFundId(Long userId, Long fundId);
    
    // 🔥 เพิ่มบรรทัดนี้ครับโบร เพื่อดึงพอร์ตทั้งหมดของ User คนเดียว
    List<UserFund> findByUserId(Long userId); 
}