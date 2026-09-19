package com.dt3.service;

import com.dt3.pojo.Transaction;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface TransactionService {

    void saveTransaction(Transaction transaction);

    boolean checkUserPaid(int userId, int documentId);

    BigDecimal getTotalRevenue();

    BigDecimal getRevenueByMonthAndYear(int month, int year);

    List<Transaction> getTransactions(Map<String, Object> params);

    int countPages(Map<String, Object> params, int pageSize);
}