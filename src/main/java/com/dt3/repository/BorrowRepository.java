package com.dt3.repository;

import com.dt3.pojo.Borrow;
import java.util.Map;
import java.util.List;

public interface BorrowRepository {
    // Trả về true nếu lưu thành công toàn bộ giỏ hàng
    boolean addBorrow(Map<String, Object> cart, int userId);
    Map<String, Object> getAllBorrows(Map<String, String> params); // Cho Thủ thư
    Map<String, Object> getMyBorrows(String username, Map<String, String> params); // Cho Sinh viên
    void extendDueDate(int detailId, String newDateStr);
    void revokeBorrow(int detailId);
        
}