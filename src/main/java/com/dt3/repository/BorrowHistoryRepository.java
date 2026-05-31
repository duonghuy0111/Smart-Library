/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository;

import com.dt3.pojo.BorrowHistory;

/**
 *
 * @author Admin
 */

public interface BorrowHistoryRepository {
    void logAction(BorrowHistory history); // Lưu vết dấu thao tác người dùng
}
