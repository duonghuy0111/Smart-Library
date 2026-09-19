package com.dt3.repository;

import com.dt3.pojo.User;

import java.util.List;
import java.util.Map;

public interface UserRepository {

    User getUserByUsername(String username);

    User getUserById(int id);

    void saveOrUpdate(User user);

    List<User> getUsers(String role);

    Long countUsers(String role);

    List<User> getUsers(Map<String, Object> params);

    Long countUsers(Map<String, Object> params);

    List<User> getRecentUsers(int limit);

    List<User> getPendingLibrarians();

    void deleteUser(int id);
}