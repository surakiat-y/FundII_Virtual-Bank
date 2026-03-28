package com.fundii.virtualbank.repositories;

import com.fundii.virtualbank.models.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId); // ดึงเฉพาะของ User คนนั้นๆ
}