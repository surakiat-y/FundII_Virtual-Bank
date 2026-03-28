package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String accountNumber; 

    private String accountName; 

    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO; 

    private BigDecimal savingsGoal = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "ACTIVE"; 

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔥 ส่วนที่เพิ่มเข้ามาเพื่อให้ลบได้ (Cascade Delete)
    // สั่งให้ลบประวัติการโอนที่เกี่ยวข้องทิ้งทันทีถ้ากระเป๋านี้โดนลบ
    
    @JsonIgnore // กันบั๊ก Infinite Loop ตอนคืนค่า JSON
    @OneToMany(mappedBy = "sourceAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> sentTransactions;

    @JsonIgnore
    @OneToMany(mappedBy = "destinationAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> receivedTransactions;
}