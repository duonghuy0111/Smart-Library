package com.dt3.service;

import com.dt3.pojo.Transaction;
import java.math.BigDecimal;


public interface TransactionService {
    void saveTransaction(Transaction transaction);
    boolean checkUserPaid(int userId, int documentId);
    
    BigDecimal getTotalRevenue();   
    BigDecimal getRevenueByMonthAndYear(int month, int year);
}
