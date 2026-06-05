package com.dt3.service;

import com.dt3.pojo.User;
import java.util.List;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    User getUserByUsername(String username);
    User getUserById(int id);
    void registerUser(User user); // Hàm xử lý đăng ký
    List<User> getUsers(String role);
    public void approveUser(int id);
  
}   