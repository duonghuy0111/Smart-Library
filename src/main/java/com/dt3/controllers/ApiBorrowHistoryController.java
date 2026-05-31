/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.pojo.BorrowHistory;
import com.dt3.service.BorrowHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Admin
 */
@RestController
@RequestMapping("/api/histories")
@CrossOrigin
public class ApiBorrowHistoryController {

    @Autowired
    private BorrowHistoryService borrowHistoryService;

    // API ghi nhận lượt xem/mượn tài liệu
    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> logAction(@RequestBody BorrowHistory history) {
        try {
            this.borrowHistoryService.logAction(history);
            return new ResponseEntity<>("Ghi nhận lịch sử thành công!", HttpStatus.CREATED);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi ghi nhận: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
