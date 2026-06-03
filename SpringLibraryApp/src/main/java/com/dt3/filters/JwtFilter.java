package com.dt3.filters;

import com.dt3.components.JwtService;
import com.dt3.pojo.User;
import com.dt3.repository.UserRepository; // Nhớ import cái này
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class JwtFilter implements Filter {
    
    @Autowired
    private JwtService jwtService; 

    // Bơm UserRepository vào để lấy Role từ DB
    @Autowired
    private UserRepository userRepository; 

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String header = httpRequest.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String username = jwtService.extractUsername(token);
                
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (jwtService.validateToken(token, username)) {
                        httpRequest.setAttribute("username", username);
                        
                        // 👉 LẤY USER TỪ DB ĐỂ LẤY ROLE THẬT
                        User user = userRepository.getUserByUsername(username);
                        Set<GrantedAuthority> authorities = new HashSet<>();
                        if (user != null) {
                            // user.getRole() sẽ lấy ra chuỗi "ROLE_ADMIN" từ DB
                            authorities.add(new SimpleGrantedAuthority(user.getRole())); 
                        }
                        
                        // 👉 TRUYỀN DANH SÁCH QUYỀN (authorities) VÀO ĐÂY, THAY VÌ ĐỂ NULL
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                System.err.println("Lỗi giải mã token: " + e.getMessage());
            }
        }
        
        chain.doFilter(request, response);
    }
}