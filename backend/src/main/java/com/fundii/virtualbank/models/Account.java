package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "accounts") // สร้างตารางชื่อ accounts
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String accountNumber; // เลขบัญชีธนาคาร (ห้ามซ้ำ)

    private String accountName; // ชื่อบัญชี (เช่น "บัญชีหลัก", "เงินออม", "ค่าขนม")

    @Column(nullable = false)
    private BigDecimal balance; // ยอดเงิน (ใช้ BigDecimal เพราะคำนวณเงินได้แม่นยำกว่า Double ครับ)

    // การเชื่อมความสัมพันธ์: บัญชีนี้เป็นของใคร?
    @ManyToOne // Many Accounts to One User (1 คนมีได้หลายบัญชี)
    @JoinColumn(name = "user_id", nullable = false) // สร้างคอลัมน์ user_id เพื่อเชื่อมกับตาราง users
    private User user;

}