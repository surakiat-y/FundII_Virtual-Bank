package com.fundii.virtualbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // 🔥 เพิ่มบรรทัดนี้

@SpringBootApplication
@EnableScheduling // 🔥 เพิ่มบรรทัดนี้
public class VirtualbankApplication {

    public static void main(String[] args) {
        SpringApplication.run(VirtualbankApplication.class, args);
    }

}