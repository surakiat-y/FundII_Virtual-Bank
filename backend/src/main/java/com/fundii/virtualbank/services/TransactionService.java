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

    @Transactional
    public Transaction deposit(Long accountId, BigDecimal amount) {
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
        Account account = accountRepository.findById(accountId).orElseThrow();
        validateStatus(account, "บัญชีของคุณ");
        
        if (account.getBalance().compareTo(amount) < 0) throw new RuntimeException("ยอดเงินไม่เพียงพอ");

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
        Account source = accountRepository.findById(sourceId).orElseThrow();
        Account dest = accountRepository.findById(destinationId).orElseThrow();
        
        validateStatus(source, "บัญชีของคุณ");
        validateStatus(dest, "บัญชีปลายทาง");

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
        tx.setTransactionDate(LocalDateTime.now());
        tx.setStatus("SUCCESSFUL");
        return transactionRepository.save(tx);
    }

    @Transactional
    public void transferMoney(Long sourceId, Long destId, BigDecimal amount) {
        transfer(sourceId, destId, amount);
    }

    @Transactional
    public void invest(Long accountId, Long fundId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId).orElseThrow();
        Fund fund = fundRepository.findById(fundId).orElseThrow();
        
        validateStatus(account, "บัญชีของคุณ");
        
        if (!"ACTIVE".equalsIgnoreCase(fund.getMarketStatus())) {
            throw new RuntimeException("กองทุนนี้ปิดรับการลงทุนชั่วคราว (PAUSED)");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("ยอดเงินไม่เพียงพอสำหรับการลงทุน");
        }

        // หักเงิน
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // คำนวณหน่วยและบันทึกพอร์ต
        Double unitsToBuy = amount.doubleValue() / fund.getNav();
        UserFund userFund = userFundRepository.findByUserIdAndFundId(account.getUser().getId(), fundId)
                .orElse(new UserFund(account.getUser().getId(), fundId, 0.0, fund.getNav()));

        userFund.setUnits(userFund.getUnits() + unitsToBuy);
        userFundRepository.save(userFund);

        // บันทึกประวัติ
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
        Account account = accountRepository.findById(accountId).orElseThrow();
        Fund fund = fundRepository.findById(fundId).orElseThrow();
        
        validateStatus(account, "บัญชีของคุณ");

        UserFund userFund = userFundRepository.findByUserIdAndFundId(account.getUser().getId(), fundId)
                .orElseThrow(() -> new RuntimeException("คุณไม่มีหน่วยลงทุนในกองทุนนี้"));

        if (userFund.getUnits() < unitsToSell) {
            throw new RuntimeException("หน่วยลงทุนไม่พอขาย");
        }

        // คำนวณเงินที่จะได้รับ
        BigDecimal moneyReceived = BigDecimal.valueOf(unitsToSell * fund.getNav());

        // หักหน่วยลงทุน
        userFund.setUnits(userFund.getUnits() - unitsToSell);
        if (userFund.getUnits() <= 0) {
            userFundRepository.delete(userFund);
        } else {
            userFundRepository.save(userFund);
        }

        // เอาเงินเข้ากระเป๋า
        account.setBalance(account.getBalance().add(moneyReceived));
        accountRepository.save(account);

        // บันทึก Statement
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

        // Check for BANNED / BAN
        if ("BANNED".equalsIgnoreCase(userStatus) || "BAN".equalsIgnoreCase(userStatus) || "BANNED".equalsIgnoreCase(accStatus)) {
            throw new RuntimeException(label + "ถูกระงับการใช้งานถาวร (BANNED)");
        }
        
        // Check for SUSPENDED
        if ("SUSPENDED".equalsIgnoreCase(userStatus) || "SUSPENDED".equalsIgnoreCase(accStatus)) {
            throw new RuntimeException(label + "ถูกระงับการทำธุรกรรมชั่วคราว (SUSPENDED)");
        }
    }
}