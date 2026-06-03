package com.dt3.components;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.function.Function;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.nio.charset.StandardCharsets;

@Component
public class JwtService {

    // 👉 ĐÃ SỬA: Khóa bí mật cố định đạt chuẩn độ dài HS256 để không bị mất phiên đăng nhập khi restart server
    private static final String SECRET_STRING = "9a8b7c6d5e4f3g2h1i0j9k8l7m6n5b4v3c2x1z0a9s8d7f6g5h4j3k2l1m0n9b8v";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    
    // Thời gian sống của Token: 24 giờ (tính bằng mili giây)
    private static final long EXPIRE_TIME = 86400000L; 

    // 1. Hàm tạo ra Token từ tên đăng nhập (Username)
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
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