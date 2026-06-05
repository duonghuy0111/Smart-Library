package com.dt3.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

@Configuration
@EnableWebSecurity
@EnableTransactionManagement
@ComponentScan(basePackages = "com.dt3")
@Order(2)
public class SpringSecurityConfigs {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
        return new HandlerMappingIntrospector();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/admin/**", "/", "/login")
            .csrf(c -> c.disable())
            .authorizeHttpRequests((requests) -> requests
                // 1. Mở cửa tự do cho trang chủ và trang hiển thị form đăng nhập
                .requestMatchers("/", "/admin/login").permitAll()
                
                // 2. 👉 SỬA LẠI: Khóa TOÀN BỘ các trang có chữ /admin/ ở đầu (dashboard, documents, users...)
                // Bắt buộc phải đăng nhập và có quyền ADMIN mới được vào
                .requestMatchers("/admin/**").hasRole("ADMIN")
                
                .anyRequest().permitAll()
        ).formLogin(form -> form
                .loginPage("/admin/login") 
                
                // 👉 SỬA LẠI: Khớp tuyệt đối với th:action="@{/admin/login}" trong form HTML
                .loginProcessingUrl("/admin/login") 
                
                // 👉 SỬA LẠI: Đăng nhập thành công thì đá thẳng vào Dashboard thay vì trang chủ "/"
                .defaultSuccessUrl("/admin/dashboard", true) 
                
                .failureUrl("/admin/login?error=true") 
                .permitAll()
        ).logout((logout) -> logout
                // 👉 THÊM: Bắt chính xác link th:href="@{/admin/logout}" trên thanh Header
                .logoutUrl("/admin/logout") 
                .logoutSuccessUrl("/admin/login?logout=true")
                .permitAll()
        );

        return http.build();
    }

    @Bean
    public Cloudinary cloudinary() {
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", "dxxwcby8l",
                        "api_key", "792844686918347",
                        "api_secret", "T8ys_Z9zaKSqmKWa4K1RY6DXUJg",
                        "secure", true));
        return cloudinary;
    }
    
    // ĐÃ COMMENT LẠI THEO ĐÚNG CHUẨN CỦA THẦY: Tránh lỗi trùng lặp cấu hình CORS
    /*
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
    
    */
    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
}