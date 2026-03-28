package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

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
    private BigDecimal balance = BigDecimal.ZERO; // เริ่มต้นที่ 0 เสมอ

    @Column(nullable = false)
    private String status = "ACTIVE"; // สถานะกระเป๋า: ACTIVE, SUSPENDED

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}