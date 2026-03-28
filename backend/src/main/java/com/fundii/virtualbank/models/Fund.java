package com.fundii.virtualbank.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data; // ถ้าโบรใช้ Lombok สำหรับ Getter/Setter

@Entity
@Data // ถ้าใช้ Lombok แดงที่คำว่า Getter/Setter จะหายไปเอง
public class Fund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fundCode;
    private String fundName;
    private Double nav;
    private String type;
}