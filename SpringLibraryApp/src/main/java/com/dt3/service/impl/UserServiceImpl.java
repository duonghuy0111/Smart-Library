package com.dt3.service.impl;

import com.dt3.pojo.User;
import com.dt3.repository.UserRepository;
import com.dt3.service.UserService;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service("userDetailsService")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public User getUserByUsername(String username) {
        return this.userRepository.getUserByUsername(username);
    }

    @Override
    public User getUserById(int id) {
        return this.userRepository.getUserById(id);
    }

    @Override
    public void registerUser(User user) {
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("ROLE_USER");
        }

        if (user.getIsApproved() == null) {
            user.setIsApproved(true);
        }

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        this.userRepository.saveOrUpdate(user);
    }

    @Override
    public List<User> getUsers(String role) {
        return this.userRepository.getUsers(role);
    }

    @Override
    public Long countUsers(String role) {
        return this.userRepository.countUsers(role);
    }

    @Override
    public void saveOrUpdate(User user) {
        this.userRepository.saveOrUpdate(user);
    }

    @Override
    public Long countAll() {
        return this.userRepository.countUsers((String) null);
    }

    @Override
    public List<User> getRecentUsers(int limit) {
        return this.userRepository.getRecentUsers(limit);
    }

    @Override
    public List<User> getPendingLibrarians() {
        return this.userRepository.getPendingLibrarians();
    }

    @Override
    public Map<String, Object> getUsers(Map<String, Object> params) {
    List<User> users = this.userRepository.getUsers(params);
    Map<String, Object> result = new HashMap<>();
    result.put("users", users);
    result.put("total", this.userRepository.countUsers(params));
    return result;
}

    @Override
    public int countPages(Map<String, Object> params, int pageSize) {
        Long total = this.userRepository.countUsers(params);

        if (total == null || total == 0) {
            return 0;
        }

        return (int) Math.ceil((double) total / pageSize);
    }

    @Override
    public void approveUser(int id) {
        User user = this.userRepository.getUserById(id);

        if (user != null) {
            user.setIsApproved(true);
            this.userRepository.saveOrUpdate(user);
        }
    }

    @Override
    public void rejectUser(int id) {
        User user = this.userRepository.getUserById(id);

        if (user != null) {
            user.setIsApproved(false);
            this.userRepository.saveOrUpdate(user);
        }
    }

    @Override
    public void deleteUser(int id) {
        this.userRepository.deleteUser(id);
    }

    @Override
    public void updateUser(User user) {
        this.userRepository.saveOrUpdate(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = this.userRepository.getUserByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException(
                    "Không tìm thấy tài khoản!"
            );
        }

        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(user.getRole()));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}