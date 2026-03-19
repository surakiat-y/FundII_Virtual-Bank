package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // ดึงประวัติธุรกรรมทั้งหมดที่บัญชีนี้เข้าไปเกี่ยวข้อง (ไม่ว่าจะเป็นคนโอนออก หรือคนรับโอนเข้า)
    List<Transaction> findBySourceAccountIdOrDestinationAccountId(Long sourceId, Long destinationId);
}