package com.dt3.configs;

import com.dt3.filters.JwtFilter; // Bắt buộc phải import cái này
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired; // Bắt buộc import
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Bắt buộc import
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@Order(1)
public class ApiSecurityConfigs {
    
    // 👉 THÊM DÒNG NÀY: Bơm JwtFilter vào cấu hình
    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .securityMatcher("/api/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/login", "/api/users/login/", "/api/users/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/documents/**", "/api/categories/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.PUT, "/api/documents/**", "/api/categories/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/documents/**", "/api/categories/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // 👉 SỬA/THÊM DÒNG NÀY: Bắt buộc đăng nhập với các API thao tác dữ liệu cá nhân
                // 👉 Chỉ yêu cầu đăng nhập khi ĐĂNG đánh giá (POST)
                .requestMatchers(HttpMethod.POST, "/api/reviews/**", "/api/transactions/**", "/api/borrows/**").authenticated()

                // 👉 Đảm bảo dòng này nằm ở dưới cùng để mở cửa cho mọi người XEM đánh giá (GET)
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll() // Những API GET còn lại (lấy danh sách sách, danh mục...) thì được public
                .anyRequest().authenticated() 
            )
            // 👉 THÊM DÒNG NÀY: Bắt Spring Security phải quét qua Token Filter trước khi kiểm tra quyền
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}