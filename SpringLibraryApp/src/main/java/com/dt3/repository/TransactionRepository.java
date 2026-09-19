package com.dt3.repository;

import com.dt3.pojo.Transaction;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface TransactionRepository {

    void saveTransaction(Transaction transaction);

    boolean checkUserPaid(int userId, int documentId);

    BigDecimal getTotalRevenue();

    BigDecimal getRevenueByMonthAndYear(int month, int year);

    BigDecimal getRevenueByTime(Integer month, Integer year);

    List<Transaction> getTransactions(Map<String, Object> params);

    Long countTransactions(Map<String, Object> params);
}