package com.dt3.service.impl;

import com.dt3.pojo.Transaction;
import com.dt3.repository.TransactionRepository;
import com.dt3.service.TransactionService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public void saveTransaction(Transaction transaction) {
        this.transactionRepository.saveTransaction(transaction);
    }

    @Override
    public boolean checkUserPaid(int userId, int documentId) {
        return this.transactionRepository.checkUserPaid(userId, documentId);
    }

    @Override
    public BigDecimal getTotalRevenue() {
        return this.transactionRepository.getTotalRevenue();
    }

    @Override
    public BigDecimal getRevenueByMonthAndYear(int month, int year) {
        return this.transactionRepository.getRevenueByMonthAndYear(month, year);
    }

    @Override
    public List<Transaction> getTransactions(Map<String, Object> params) {
        return this.transactionRepository.getTransactions(params);
    }

    @Override
    public int countPages(Map<String, Object> params, int pageSize) {
        Long total = this.transactionRepository.countTransactions(params);

        if (total == null || total == 0 || pageSize <= 0) {
            return 0;
        }

        return (int) Math.ceil((double) total / pageSize);
    }
}