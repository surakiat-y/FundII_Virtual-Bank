package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String firstName;
    
    private String lastName;

    @Column(nullable = false)
    private String role = "USER"; // กำหนดสิทธิ์: USER หรือ ADMIN

    @Column(nullable = false)
    private String status = "ACTIVE"; // สถานะบัญชี: ACTIVE, SUSPENDED, BANNED

    private String pin; // รหัส PIN 4 หลัก ยืนยันธุรกรรม
}