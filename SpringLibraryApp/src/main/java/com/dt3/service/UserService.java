package com.dt3.service;

import com.dt3.pojo.User;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {

    User getUserByUsername(String username);

    User getUserById(int id);

    void registerUser(User user);

    List<User> getUsers(String role);

    Long countUsers(String role);

    void saveOrUpdate(User user);

    // Admin
    Long countAll();

    List<User> getRecentUsers(int limit);

    List<User> getPendingLibrarians();

    Map<String, Object> getUsers(Map<String, Object> params);

    int countPages(Map<String, Object> params, int pageSize);

    void approveUser(int id);

    void rejectUser(int id);

    void deleteUser(int id);

    void updateUser(User user);
}