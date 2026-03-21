package com.fundii.virtualbank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // ปิด CSRF เพื่อให้ส่ง POST จาก Frontend ได้ง่ายๆ ในช่วงพัฒนา
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // อนุญาตทุก Request ก่อน เพื่อให้ทดสอบได้ง่าย
            );
        return http.build();
    }
}
