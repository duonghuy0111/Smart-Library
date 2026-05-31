/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository;

import com.dt3.pojo.User;
import java.util.List;

/**
 *
 * @author Admin
 */
public interface UserRepository {
    // Tìm người dùng bằng username 
    User getUserByUsername(String username);
    // Tìm người dùng bằng ID
    User getUserById(int id);
    // Lưu thông tin (đăng ký mới hoặc admin duyệt/cập nhật quyền)
    void saveOrUpdate(User user);
    // Lấy danh sách tài khoản theo vai trò (để admin dễ quản lý)
    List<User> getUsers(String role);
}
