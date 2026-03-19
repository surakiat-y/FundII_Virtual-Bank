package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // หาบัญชีจากเลขบัญชี (เอาไว้ตรวจสอบตอนพิมพ์เลขบัญชีโอนเงิน)
    Optional<Account> findByAccountNumber(String accountNumber);

    // หาบัญชีทั้งหมดที่เป็นของ User คนนี้ (เอาไว้แสดงกระเป๋าย่อยทั้งหมดในหน้าหลัก)
    List<Account> findByUserId(Long userId);
}