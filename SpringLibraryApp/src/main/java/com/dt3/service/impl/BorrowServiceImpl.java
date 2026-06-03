package com.dt3.service.impl;

import com.dt3.pojo.Borrow;
import com.dt3.repository.BorrowRepository;
import com.dt3.service.BorrowService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BorrowServiceImpl implements BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    @Override
    public boolean addBorrow(Map<String, Object> cart, int userId) {
        if (cart != null && !cart.isEmpty()) {
            return this.borrowRepository.addBorrow(cart, userId);
        }
        return false;
    }

    @Override
    public Map<String, Object> getMyBorrows(String username, Map<String, String> params) {
        return this.borrowRepository.getMyBorrows(username, params);
    }

    // 👉 ĐÃ THÊM MỚI: Lấy danh sách toàn bộ phiếu mượn cho Thủ thư
    @Override
    public Map<String, Object> getAllBorrows(Map<String, String> params) {
        return this.borrowRepository.getAllBorrows(params);
    }

    @Override
    public void extendDueDate(int detailId, String newDateStr) {
        this.borrowRepository.extendDueDate(detailId, newDateStr);
    }
    @Override
    public void revokeBorrow(int detailId) {
        this.borrowRepository.revokeBorrow(detailId);
    }
}