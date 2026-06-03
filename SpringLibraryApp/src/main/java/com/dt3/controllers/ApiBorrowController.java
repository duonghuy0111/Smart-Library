package com.dt3.controllers;

import com.dt3.pojo.Borrow;
import com.dt3.pojo.User;
import com.dt3.service.BorrowService;
import com.dt3.service.UserService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/borrows")
@CrossOrigin
public class ApiBorrowController {

    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private UserService userService;

    // API nhận toàn bộ Giỏ hàng (Cart) từ ReactJS và lưu xuống DB
    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addBorrow(@RequestBody Map<String, Object> cart, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>("Bạn chưa đăng nhập!", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            User user = this.userService.getUserByUsername(principal.getName());
            boolean isSuccess = this.borrowService.addBorrow(cart, user.getId());
            
            if (isSuccess) {
                return new ResponseEntity<>("Thanh toán giỏ hàng thành công!", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Lưu giỏ hàng thất bại!", HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // API lấy lịch sử các Phiếu mượn (kèm chi tiết sách) của User đang đăng nhập
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBorrows(@RequestParam Map<String, String> params) {
        return new ResponseEntity<>(this.borrowService.getAllBorrows(params), HttpStatus.OK);
    }

    @GetMapping("/my-borrows")
    public ResponseEntity<?> getMyBorrows(@RequestParam Map<String, String> params, Principal principal) {
        // 👉 THÊM ĐOẠN KIỂM TRA NÀY:
        if (principal == null) {
            return new ResponseEntity<>("Vui lòng đăng nhập để xem lịch sử mượn!", HttpStatus.UNAUTHORIZED);
        }
        
        return new ResponseEntity<>(this.borrowService.getMyBorrows(principal.getName(), params), HttpStatus.OK);
    }

    // API gia hạn sách (Cập nhật lại DueDate cho một BorrowDetail cụ thể)
    @PostMapping("/extend/{detailId}")
    public ResponseEntity<?> extendBorrow(@PathVariable("detailId") int detailId, @RequestBody Map<String, String> payload) {
        try {
            // Lấy ngày hạn mới từ payload gửi lên
            String newDateStr = payload.get("newDueDate"); 
            // Bạn viết logic tìm BorrowDetail theo ID và cập nhật setDueDate(newDateStr) vào Database ở đây
            this.borrowService.extendDueDate(detailId, newDateStr); 
            
            return new ResponseEntity<>("Gia hạn thành công!", HttpStatus.OK);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi gia hạn: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/revoke/{detailId}")
    public ResponseEntity<?> revokeBorrow(@PathVariable("detailId") int detailId) {
        try {
            this.borrowService.revokeBorrow(detailId);
            return new ResponseEntity<>("Thu hồi thành công!", HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>("Lỗi thu hồi: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}