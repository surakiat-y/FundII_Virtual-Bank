package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // 1. ระบบฝากเงิน
    @Transactional // ป้องกันเงินหายถ้าระบบล่มระหว่างทำรายการ
    public Transaction deposit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("ไม่พบบัญชีนี้ในระบบ"));

        // เพิ่มเงิน
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // บันทึกประวัติ
        Transaction tx = new Transaction();
        tx.setTransactionType("DEPOSIT");
        tx.setAmount(amount);
        
        // --- แก้บั๊ก: ฐานข้อมูลบังคับห้าม sourceAccount ว่าง ---
        tx.setSourceAccount(account); 
        tx.setDestinationAccount(account); 
        
        return transactionRepository.save(tx);
    }

    // 2. ระบบถอนเงิน
    @Transactional
    public Transaction withdraw(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("ไม่พบบัญชีนี้ในระบบ"));

        // เช็คยอดเงินว่าพอไหม? (compareTo: ถ้าค่าน้อยกว่าจะคืนค่า -1)
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินในบัญชีไม่เพียงพอ!");
        }

        // หักเงิน
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // บันทึกประวัติ
        Transaction tx = new Transaction();
        tx.setTransactionType("WITHDRAW");
        tx.setAmount(amount);
        tx.setSourceAccount(account); // ถอนออกจากบัญชีตัวเอง (ต้นทาง)

        return transactionRepository.save(tx);
    }

    // 3. ระบบโอนเงิน (Transfer)
    @Transactional
    public Transaction transfer(Long sourceId, Long destinationId, BigDecimal amount) {
        // เช็คว่าไม่ได้โอนเข้าบัญชีตัวเอง
        if (sourceId.equals(destinationId)) {
            throw new RuntimeException("ไม่สามารถโอนเงินเข้าบัญชีตัวเองซ้ำได้");
        }

        Account sourceAccount = accountRepository.findById(sourceId)
                .orElseThrow(() -> new RuntimeException("ไม่พบบัญชีต้นทาง"));
        
        Account destAccount = accountRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("ไม่พบบัญชีปลายทาง"));

        // เช็คยอดเงินต้นทาง
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินในบัญชีไม่เพียงพอสำหรับการโอน!");
        }

        // หักเงินต้นทาง และ เพิ่มเงินปลายทาง
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destAccount.setBalance(destAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destAccount);

        // บันทึกประวัติการโอน
        Transaction tx = new Transaction();
        tx.setTransactionType("TRANSFER");
        tx.setAmount(amount);
        tx.setSourceAccount(sourceAccount);
        tx.setDestinationAccount(destAccount);

        return transactionRepository.save(tx);
    }
}