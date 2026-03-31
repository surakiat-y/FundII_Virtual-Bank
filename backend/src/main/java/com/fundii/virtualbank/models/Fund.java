package com.fundii.virtualbank.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Fund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fundCode;
    private String fundName;
    private Double nav;
    private String type;
    private String marketStatus = "ACTIVE"; // ACTIVE or PAUSED
}