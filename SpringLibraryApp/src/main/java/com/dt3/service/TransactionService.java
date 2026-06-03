/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service;

import com.dt3.pojo.Transaction;

/**
 *
 * @author Admin
 */
public interface TransactionService {
    void saveTransaction(Transaction transaction);
    boolean checkUserPaid(int userId, int documentId);
}
