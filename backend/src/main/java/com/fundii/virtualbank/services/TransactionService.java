package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Account;
import com.fundii.virtualbank.models.Transaction;
import com.fundii.virtualbank.models.UserFund;
import com.fundii.virtualbank.models.Fund;
import com.fundii.virtualbank.repositories.AccountRepository;
import com.fundii.virtualbank.repositories.TransactionRepository;
import com.fundii.virtualbank.repositories.UserFundRepository;
import com.fundii.virtualbank.repositories.FundRepository;
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

    @Autowired
    private UserFundRepository userFundRepository;

    @Autowired
    private FundRepository fundRepository;

    // ✅ Helper Method สำหรับเช็กยอดเงินขั้นต่ำ 0.01
    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(new BigDecimal("0.01")) < 0) {
            throw new RuntimeException("จำนวนเงินต้องไม่น้อยกว่า 0.01 บาท");
        }
    }

    @Transactional
    public Transaction deposit(Long accountId, BigDecimal amount) {
        validateAmount(amount); // ดักยอดติดลบ/ศูนย์
        Account account = accountRepository.findById(accountId).orElseThrow();
        validateStatus(account, "บัญชี");
        
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setTransactionType("DEPOSIT");
        tx.setAmount(amount);
        tx.setSourceAccount(account);
        tx.setDestinationAccount(account);
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction withdraw(Long accountId, BigDecimal amount) {
        validateAmount(amount); // ดักยอดติดลบ/ศูนย์
        Account account = accountRepository.findById(accountId).orElseThrow();
        validateStatus(account, "บัญชีของคุณ");
        
        // เช็กยอดเงินคงเหลือ
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินไม่เพียงพอ (ยอดคงเหลือ: " + account.getBalance() + ")");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setTransactionType("WITHDRAW");
        tx.setAmount(amount);
        tx.setSourceAccount(account);
        tx.setDestinationAccount(account);
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction transfer(Long sourceId, Long destinationId, BigDecimal amount) {
        validateAmount(amount); // ดักยอดติดลบ/ศูนย์
        
        if (sourceId.equals(destinationId)) {
            throw new RuntimeException("ไม่สามารถโอนเงินเข้าบัญชีเดียวกันได้");
        }

        Account source = accountRepository.findById(sourceId).orElseThrow();
        Account dest = accountRepository.findById(destinationId).orElseThrow();
        
        validateStatus(source, "บัญชีของคุณ");
        validateStatus(dest, "บัญชีปลายทาง");

        // เช็กยอดเงินโอน
        if (source.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินไม่เพียงพอสำหรับการโอน");
        }

        source.setBalance(source.getBalance().subtract(amount));
        dest.setBalance(dest.getBalance().add(amount));
        
        accountRepository.save(source);
        accountRepository.save(dest);

        Transaction tx = new Transaction();
        tx.setTransactionType("TRANSFER");
        tx.setAmount(amount);
        tx.setSourceAccount(source);
        tx.setDestinationAccount(dest);
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public void invest(Long accountId, Long fundId, BigDecimal amount) {
        validateAmount(amount); // ดักยอดติดลบ/ศูนย์
        Account account = accountRepository.findById(accountId).orElseThrow();
        Fund fund = fundRepository.findById(fundId).orElseThrow();
        
        validateStatus(account, "บัญชีของคุณ");
        
        if (!"ACTIVE".equalsIgnoreCase(fund.getMarketStatus())) {
            throw new RuntimeException("กองทุนนี้ปิดรับการลงทุนชั่วคราว (PAUSED)");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินไม่เพียงพอสำหรับการลงทุน");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Double unitsToBuy = amount.doubleValue() / fund.getNav();
        UserFund userFund = userFundRepository.findByUserIdAndFundId(account.getUser().getId(), fundId)
                .orElse(new UserFund(account.getUser().getId(), fundId, 0.0, fund.getNav()));

        userFund.setUnits(userFund.getUnits() + unitsToBuy);
        userFundRepository.save(userFund);

        Transaction tx = new Transaction();
        tx.setSourceAccount(account);
        tx.setAmount(amount);
        tx.setTransactionType("INVESTMENT");
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        transactionRepository.save(tx);
    }

    @Transactional
    public void sell(Long accountId, Long fundId, Double unitsToSell) {
        if (unitsToSell == null || unitsToSell <= 0) {
            throw new RuntimeException("จำนวนหน่วยที่ขายต้องมากกว่า 0");
        }

        Account account = accountRepository.findById(accountId).orElseThrow();
        Fund fund = fundRepository.findById(fundId).orElseThrow();
        
        validateStatus(account, "บัญชีของคุณ");

        UserFund userFund = userFundRepository.findByUserIdAndFundId(account.getUser().getId(), fundId)
                .orElseThrow(() -> new RuntimeException("คุณไม่มีหน่วยลงทุนในกองทุนนี้"));

        if (userFund.getUnits() < unitsToSell) {
            throw new RuntimeException("หน่วยลงทุนไม่พอขาย (คุณมี: " + userFund.getUnits() + " หน่วย)");
        }

        BigDecimal moneyReceived = BigDecimal.valueOf(unitsToSell * fund.getNav());

        userFund.setUnits(userFund.getUnits() - unitsToSell);
        if (userFund.getUnits() <= 0.000001) { // เผื่อเศษทศนิยมเล็กน้อย
            userFundRepository.delete(userFund);
        } else {
            userFundRepository.save(userFund);
        }

        account.setBalance(account.getBalance().add(moneyReceived));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setSourceAccount(account);
        tx.setAmount(moneyReceived);
        tx.setTransactionType("SELL_FUND");
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        transactionRepository.save(tx);
    }

    private void validateStatus(Account account, String label) {
        String userStatus = account.getUser().getStatus();
        String accStatus = account.getStatus();

        if ("BANNED".equalsIgnoreCase(userStatus) || "BAN".equalsIgnoreCase(userStatus) || "BANNED".equalsIgnoreCase(accStatus)) {
            throw new RuntimeException(label + "ถูกระงับการใช้งานถาวร (BANNED)");
        }
        
        if ("SUSPENDED".equalsIgnoreCase(userStatus) || "SUSPENDED".equalsIgnoreCase(accStatus)) {
            throw new RuntimeException(label + "ถูกระงับการทำธุรกรรมชั่วคราว (SUSPENDED)");
        }
    }
}