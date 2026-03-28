package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public Transaction deposit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId).orElseThrow();
        checkAccountStatus(account);
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setTransactionType("DEPOSIT");
        tx.setAmount(amount);
        tx.setSourceAccount(account);
        tx.setDestinationAccount(account);
        tx.setTransactionDate(LocalDateTime.now()); // 🔥 แก้เป็นชื่อใหม่แล้ว
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction withdraw(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId).orElseThrow();
        if ("SUSPENDED".equals(account.getUser().getStatus())) throw new RuntimeException("บัญชีถูกระงับธุรกรรม (SUSPENDED)");
        checkAccountStatus(account);
        if (account.getBalance().compareTo(amount) < 0) throw new RuntimeException("ยอดเงินไม่เพียงพอ");

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setTransactionType("WITHDRAW");
        tx.setAmount(amount);
        tx.setSourceAccount(account);
        tx.setDestinationAccount(account);
        tx.setTransactionDate(LocalDateTime.now()); // 🔥 แก้เป็นชื่อใหม่แล้ว
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction transfer(Long sourceId, Long destinationId, BigDecimal amount) {
        Account source = accountRepository.findById(sourceId).orElseThrow();
        Account dest = accountRepository.findById(destinationId).orElseThrow();
        if ("SUSPENDED".equals(source.getUser().getStatus())) throw new RuntimeException("บัญชีถูกระงับธุรกรรม (SUSPENDED)");
        checkAccountStatus(source);
        if (source.getBalance().compareTo(amount) < 0) throw new RuntimeException("ยอดเงินไม่เพียงพอ");

        source.setBalance(source.getBalance().subtract(amount));
        dest.setBalance(dest.getBalance().add(amount));
        accountRepository.save(source);
        accountRepository.save(dest);

        Transaction tx = new Transaction();
        tx.setTransactionType("TRANSFER");
        tx.setAmount(amount);
        tx.setSourceAccount(source);
        tx.setDestinationAccount(dest);
        tx.setTransactionDate(LocalDateTime.now()); // 🔥 แก้เป็นชื่อใหม่แล้ว
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    // 🔥 เพิ่ม Method สำหรับ Move Money (ย้ายเงินตัวเอง) เพื่อไม่ให้หน้า Dashboard Error
    @Transactional
    public void transferMoney(Long sourceId, Long destId, BigDecimal amount) {
        transfer(sourceId, destId, amount);
    }

    private void checkAccountStatus(Account account) {
        if ("BANNED".equals(account.getStatus()) || "BANNED".equals(account.getUser().getStatus())) {
            throw new RuntimeException("บัญชีถูกระงับการใช้งาน (BANNED)");
        }
    }
}