/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository;

import com.dt3.pojo.Transaction;

/**
 *
 * @author Admin
 */
public interface TransactionRepository {
    void saveTransaction(Transaction transaction);
    boolean checkUserPaid(int userId, int documentId); // kiểm tra xem user đã mua sách này chưa
}
