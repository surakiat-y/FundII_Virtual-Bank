package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Fund;
import com.fundii.virtualbank.repositories.FundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funds")
@CrossOrigin(origins = "http://localhost:5173") // ให้ React ดึงข้อมูลได้
public class FundController {

    @Autowired
    private FundRepository fundRepository;

    // ดึงรายการกองทุนทั้งหมด
    @GetMapping
    public List<Fund> getAllFunds() {
        return fundRepository.findAll();
    }
    // เพิ่มตัวนี้ใน FundController.java
    @PostMapping("/add")
    public Fund addFund(@RequestBody Fund fund) {
        // บันทึกกองทุนใหม่ที่ Admin ส่งมาจากหน้าบ้าน
        return fundRepository.save(fund);
    }
}