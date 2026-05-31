package com.dt3.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtUtils {

    // Tạo secret key an toàn cho thuật toán HS256
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Thời gian hết hạn của token: 24 giờ
    private static final long EXPIRE_TIME = 86400000L;

    // Hàm sinh Token (Dùng khi User đăng nhập thành công ở ApiUserController)
    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Hàm thầy gọi trong JwtFilter: Vừa kiểm tra hợp lệ, vừa bóc tách lấy Username
    public static String validateTokenAndGetUsername(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Kiểm tra nếu token chưa hết hạn thì trả về Username
            if (claims.getExpiration().after(new Date())) {
                return claims.getSubject();
            }
        } catch (Exception e) {
            System.err.println("Token xác thực thất bại: " + e.getMessage());
        }
        return null; // Trả về null nếu token lởm hoặc hết hạn
    }
}