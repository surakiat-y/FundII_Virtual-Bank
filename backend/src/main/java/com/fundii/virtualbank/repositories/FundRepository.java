package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE Fund f SET f.nav = :nav WHERE f.id = :id")
    void updateNav(Long id, Double nav);
}