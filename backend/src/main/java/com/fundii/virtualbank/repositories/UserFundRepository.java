package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.UserFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface UserFundRepository extends JpaRepository<UserFund, Long> {
    Optional<UserFund> findByUserIdAndFundId(Long userId, Long fundId);
    
    // 🔥 เพิ่มบรรทัดนี้ครับโบร เพื่อดึงพอร์ตทั้งหมดของ User คนเดียว
    List<UserFund> findByUserId(Long userId); 
    
    boolean existsByFundId(Long fundId);

    @Modifying
    @Transactional
    void deleteByFundId(Long fundId);
}