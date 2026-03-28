package com.fundii.virtualbank.controllers;

import com.fundii.virtualbank.models.Favorite;
import com.fundii.virtualbank.models.User;
import com.fundii.virtualbank.repositories.FavoriteRepository;
import com.fundii.virtualbank.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin("*")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    // ดึงรายชื่อโปรดทั้งหมดของ User
    @GetMapping("/user/{userId}")
    public List<Favorite> getFavorites(@PathVariable Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    // เพิ่มรายชื่อโปรดใหม่
    @PostMapping("/add")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String nickname = request.get("nickname").toString();
            String accNo = request.get("accountNumber").toString();
            String ownerName = request.get("ownerName").toString();

            User user = userRepository.findById(userId).orElseThrow();

            Favorite fav = new Favorite();
            fav.setUser(user);
            fav.setNickname(nickname);
            fav.setAccountNumber(accNo);
            fav.setOwnerName(ownerName);

            return ResponseEntity.ok(favoriteRepository.save(fav));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}