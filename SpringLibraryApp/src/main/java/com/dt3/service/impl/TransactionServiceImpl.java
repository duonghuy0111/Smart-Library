
package com.dt3.service.impl;

import com.dt3.pojo.Transaction;
import com.dt3.repository.TransactionRepository;
import com.dt3.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionServiceImpl implements TransactionService{
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Override
    public void saveTransaction(Transaction transaction){
        // Logic mở rộng tương lai: gọi api momo/vnpay có thể đặt ở đây
        this.transactionRepository.saveTransaction(transaction);
    }
    @Override
    public boolean checkUserPaid(int userId, int documentId){
        return this.transactionRepository.checkUserPaid(userId, documentId);
    }
}
