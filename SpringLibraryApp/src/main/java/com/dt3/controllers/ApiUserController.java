package com.dt3.controllers;

import com.dt3.components.JwtService;
import com.dt3.pojo.User;
import com.dt3.service.UserService;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class ApiUserController {
    
    @Autowired
    private JwtService jwtService; 

    @Autowired
    private UserService userService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private Cloudinary cloudinary;

    // 👉 Đổi consumes thành MULTIPART_FORM_DATA_VALUE
    @PostMapping(path = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerUser(
            @RequestParam Map<String, String> params, 
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        
        // 1. Kiểm tra username đã tồn tại chưa
        if (this.userService.getUserByUsername(params.get("username")) != null) {
            return new ResponseEntity<>("Tên đăng nhập đã tồn tại!", HttpStatus.BAD_REQUEST);
        }   
        
        try {
            User user = new User();
            user.setUsername(params.get("username"));
            user.setPassword(params.get("password"));
            user.setEmail(params.get("email"));
            user.setPhone(params.get("phone"));
            
            // Dựa vào DB của bạn, ghép firstName và lastName thành full_name
            String fullName = params.get("lastName") + " " + params.get("firstName");
            user.setFullName(fullName.trim());
            
            // Xử lý Role 
            // Xử lý Role và Duyệt tài khoản
            String role = params.get("role");
            if (role != null && !role.isEmpty()) {
                user.setRole("ROLE_" + role.toUpperCase());
                
                // Nếu đăng ký là Thủ thư -> Ép chờ duyệt
                if (role.equalsIgnoreCase("LIBRARIAN")) {
                    user.setIsApproved(false);
                } else {
                    user.setIsApproved(true); // Các role khác (như Giảng viên) nếu có thì duyệt luôn
                }
            } else {
                user.setRole("ROLE_STUDENT");
                user.setIsApproved(true); // Học viên thì tự động được duyệt
            }

            // 2. Up ảnh đại diện lên Cloudinary (Nếu có)
            // 2. Up ảnh đại diện lên Cloudinary (Nếu có)
            if (avatar != null && !avatar.isEmpty()) {
                // 👉 ÁP DỤNG THAM SỐ THÔNG MINH
                Map res = this.cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "use_filename", true,
                    "unique_filename", true
                ));
                user.setAvatar(res.get("secure_url").toString());
            } else {
                // Ảnh mặc định nếu người dùng không up
                user.setAvatar("https://via.placeholder.com/150"); 
            }

            // 3. Lưu vào Database
            this.userService.registerUser(user);
            return new ResponseEntity<>("Đăng ký tài khoản thành công!", HttpStatus.CREATED);
            
        } catch (Exception ex) {
            return new ResponseEntity<>("Có lỗi xảy ra: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            User user = this.userService.getUserByUsername(loginRequest.getUsername());
            if (user == null) {
                return new ResponseEntity<>("Tài khoản hoặc mật khẩu không chính xác!", HttpStatus.UNAUTHORIZED);
            }

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new ResponseEntity<>("Tài khoản hoặc mật khẩu không chính xác!", HttpStatus.UNAUTHORIZED);
            }
            if (user.getRole().equals("ROLE_LIBRARIAN") && (user.getIsApproved() == null || !user.getIsApproved())) {
                Map<String, String> errorRes = new HashMap<>();
                errorRes.put("status", "pending_approval");
                errorRes.put("message", "Tài khoản của bạn đang chờ Admin duyệt. Vui lòng quay lại sau!");
                
                // Trả về mã 403 (Forbidden - Cấm truy cập)
                return new ResponseEntity<>(errorRes, HttpStatus.FORBIDDEN); 
            }

            String token = this.jwtService.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("status","success");
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi đăng nhập: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable(value = "id") int id) {
        User user = this.userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // API lấy thông tin người dùng đang đăng nhập (BẮT BUỘC PHẢI CÓ CHO REACTJS)
    @GetMapping(path = "/current-user", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User user = this.userService.getUserByUsername(principal.getName());
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}