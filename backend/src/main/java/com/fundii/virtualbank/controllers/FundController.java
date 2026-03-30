package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Fund;
import com.fundii.virtualbank.repositories.FundRepository;
import com.fundii.virtualbank.repositories.UserFundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funds")
@CrossOrigin(origins = "http://localhost:5173")
public class FundController {

    @Autowired
    private FundRepository fundRepository;

    @Autowired
    private UserFundRepository userFundRepository;

    @GetMapping
    public List<Fund> getAllFunds() {
        return fundRepository.findAll();
    }

    @PostMapping("/add")
    public Fund addFund(@RequestBody Fund fund) {
        return fundRepository.save(fund);
    }

    // Toggle Fund Status (ACTIVE <-> PAUSED)
    @PutMapping("/{id}/status")
    @Transactional
    public Fund toggleStatus(@PathVariable Long id) {
        Fund fund = fundRepository.findById(id).orElseThrow();
        fund.setMarketStatus("ACTIVE".equals(fund.getMarketStatus()) ? "PAUSED" : "ACTIVE");
        return fundRepository.save(fund);
    }

    // Delete Fund (Guard: Cannot delete if investors exist)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteFund(@PathVariable Long id) {
        // 1. Check if ANY user is holding this fund
        if (userFundRepository.existsByFundId(id)) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Cannot delete fund with active investors. Please ask users to liquidate first."));
        }

        // 2. Clear associations and delete
        userFundRepository.deleteByFundId(id);
        fundRepository.deleteById(id);
        
        return ResponseEntity.ok(Map.of("message", "Fund deleted successfully"));
    }
}