package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transactions") // สร้างตารางชื่อ transactions
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String transactionType; // ประเภทธุรกรรม เช่น "DEPOSIT"(ฝาก), "WITHDRAW"(ถอน), "TRANSFER"(โอน)

    @Column(nullable = false)
    private BigDecimal amount; // จำนวนเงินที่ทำรายการ

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now(); // บันทึกวัน-เวลาที่ทำรายการอัตโนมัติ

    // บัญชีต้นทาง (ใครเป็นคนกดฝาก/ถอน/โอน)
    @ManyToOne
    @JoinColumn(name = "source_account_id", nullable = false)
    private Account sourceAccount;

    // บัญชีปลายทาง (ใช้เฉพาะตอน "โอน" เงินเท่านั้น ถ้าแค่ฝาก/ถอน ให้เป็นค่าว่างได้)
    @ManyToOne
    @JoinColumn(name = "destination_account_id")
    private Account destinationAccount;

}