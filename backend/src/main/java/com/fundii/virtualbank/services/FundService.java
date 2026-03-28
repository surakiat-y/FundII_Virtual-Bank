package com.fundii.virtualbank.services;

import com.fundii.virtualbank.models.Fund;
import com.fundii.virtualbank.repositories.FundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FundService {

    @Autowired
    private FundRepository fundRepository;

    // รันทุก 1 นาที (60,000 ms)
    @Scheduled(fixedRate = 60000)
    public void simulateMarket() {
        List<Fund> funds = fundRepository.findAll();
        for (Fund fund : funds) {
            // สุ่มราคาให้ขยับขึ้นลงไม่เกิน 1%
            double changePercent = (Math.random() * 0.02) - 0.01;
            double newNav = fund.getNav() * (1 + changePercent);
            
            // ปัดเศษ 4 ตำแหน่งให้เหมือนกองทุนจริง
            newNav = Math.round(newNav * 10000.0) / 10000.0;
            
            fund.setNav(newNav);
            fundRepository.save(fund);
        }
        System.out.println(">>> Market Updated: NAV prices shifted!");
    }
}