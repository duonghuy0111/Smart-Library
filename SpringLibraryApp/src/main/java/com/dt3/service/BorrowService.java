package com.dt3.service;

import java.util.Map;

public interface BorrowService {
    boolean addBorrow(Map<String, Object> cart, int userId);
    Map<String, Object> getAllBorrows(Map<String, String> params); // Cho Thủ thư
    Map<String, Object> getMyBorrows(String username, Map<String, String> params); // Cho Sinh viên
    void extendDueDate(int detailId, String newDateStr);
    void revokeBorrow(int detailId);
}