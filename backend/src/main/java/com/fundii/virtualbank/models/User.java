package com.fundii.virtualbank.models;

import jakarta.persistence.*;
import lombok.Data;

@Data // ช่วยสร้าง Getter, Setter อัตโนมัติ
@Entity // บอกให้ Spring Boot สร้างตารางในฐานข้อมูล
@Table(name = "users") // ตั้งชื่อตารางว่า users
public class User {

    @Id // กำหนดให้เป็น Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ให้ฐานข้อมูลรันเลข ID 1, 2, 3... อัตโนมัติ
    private Long id;

    @Column(unique = true, nullable = false) // ชื่อผู้ใช้ห้ามซ้ำ และห้ามว่าง
    private String username;

    @Column(nullable = false) // รหัสผ่านห้ามว่าง
    private String password;

    private String firstName;
    
    private String lastName;

}