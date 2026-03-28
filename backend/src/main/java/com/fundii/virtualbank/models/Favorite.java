package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;      // ชื่อเล่น เช่น "แม่", "ค่าหอ"
    private String accountNumber; // เลขบัญชี 10 หลัก
    private String ownerName;     // ชื่อเจ้าของบัญชีจริง (เก็บไว้โชว์สวยๆ)

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // เจ้าของรายชื่อโปรดคนนี้คือใคร
}