package com.dt3.service.impl;

import com.dt3.pojo.BorrowHistory;
import com.dt3.repository.BorrowHistoryRepository;
import com.dt3.service.BorrowHistoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BorrowHistoryServiceImpl implements BorrowHistoryService{
    
    @Autowired
    private BorrowHistoryRepository borrowHistoryRepository;
    
    @Override
    public void logAction(BorrowHistory history){
        this.borrowHistoryRepository.logAction(history);
    }

    // 👉 THÊM HÀM NÀY
    @Override
    public List<BorrowHistory> getHistoryByUser(int userId) {
        return this.borrowHistoryRepository.getHistoryByUser(userId);
    }
}