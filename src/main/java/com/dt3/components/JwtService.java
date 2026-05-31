/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.components;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm; // THÊM DÒNG NÀY VÀO

import java.util.Date;
import java.util.function.Function;
import org.springframework.stereotype.Component;
import java.security.Key;

/**
 *
 * @author Admin
 */
@Component
public class JwtService {

    // Tạo một Khóa bí mật (Secret Key) đủ độ dài và an toàn để ký token
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Thời gian sống của Token: 24 giờ (tính bằng mili giây)
    private static final long EXPIRE_TIME = 86400000L; 

    // 1. Hàm tạo ra Token từ tên đăng nhập (Username)
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // 2. Lấy Username từ trong chuỗi Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Kiểm tra xem Token đã hết hạn chưa
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 4. Kiểm tra xem Token có hợp lệ với User đang đăng nhập không
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // --- CÁC HÀM PHỤ TRỢ GIẢI MÃ (BÓC TÁCH) DỮ LIỆU TOKEN ---
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
