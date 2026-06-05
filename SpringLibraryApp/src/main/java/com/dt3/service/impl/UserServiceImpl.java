package com.dt3.service.impl;

import com.dt3.pojo.User;
import com.dt3.repository.UserRepository;
import com.dt3.service.UserService;
import java.util.HashSet;
import java.util.List;
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
    public User getUserByUsername(String username){
        return this.userRepository.getUserByUsername(username);
    }
    
    @Override
    public User getUserById(int id){
        return this.userRepository.getUserById(id);
    }
    
    @Override
    public void registerUser(User user){
        //1. Băm mật khẩu người dùng nhập vào trước khi lưu
        String rawPassword = user.getPassword();
        user.setPassword(this.passwordEncoder.encode(rawPassword));
        
        //2. Phân quyền mặc định 
        if(user.getRole() == null || user.getRole().isEmpty()){
            user.setRole("ROLE_USER");
        }
      
        //3. Lúc này mới gọi Repository để lưu vào db
        this.userRepository.saveOrUpdate(user);
    }
    
    @Override
    public List<User> getUsers(String role){
        return this.userRepository.getUsers(role);
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        User user = this.userRepository.getUserByUsername(username);
        if(user == null){
            throw new UsernameNotFoundException("Không tìm thấy tài khoản!");
        }
        // Cấp quyền cho user khi đăng nhập thành công
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(user.getRole()));
        
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), authorities);
    }
    @Override
    public void approveUser(int id) {
    User user = this.userRepository.getUserById(id);
    if (user != null) {
        user.setIsApproved(true);
        // Gọi thẳng xuống Repo, không đi qua bước băm mật khẩu
        this.userRepository.saveOrUpdate(user); 
    }
}
}