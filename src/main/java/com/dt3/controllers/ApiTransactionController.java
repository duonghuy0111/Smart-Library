/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.pojo.Transaction;
import com.dt3.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Admin
 */
@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class ApiTransactionController {

    @Autowired
    private TransactionService transactionService;

    // API lưu lịch sử thanh toán thành công
    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createTransaction(@RequestBody Transaction transaction) {
        try {
            this.transactionService.saveTransaction(transaction);
            return new ResponseEntity<>("Lưu giao dịch thành công!", HttpStatus.CREATED);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi lưu giao dịch: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // API kiểm tra xem User cụ thể đã từng mua cuốn sách này chưa
    // URL mẫu: /api/transactions/check?userId=2&documentId=5
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkUserPaid(@RequestParam int userId, @RequestParam int documentId) {
        boolean hasPaid = this.transactionService.checkUserPaid(userId, documentId);
        return new ResponseEntity<>(hasPaid, HttpStatus.OK);
    }
}
