package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_funds")
public class UserFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long fundId;
    
    // จำนวนหน่วยลงทุน (เช่น 50.1234 Units)
    private Double units = 0.0; 
    
    // ราคาทุนเฉลี่ย เอาไว้ดูว่ากำไรหรือขาดทุน
    private Double avgPrice = 0.0; 

    // คอนสตรัคเตอร์สำหรับตอนสร้างพอร์ตครั้งแรก
    public UserFund(Long userId, Long fundId, Double units, Double avgPrice) {
        this.userId = userId;
        this.fundId = fundId;
        this.units = units;
        this.avgPrice = avgPrice;
    }
}