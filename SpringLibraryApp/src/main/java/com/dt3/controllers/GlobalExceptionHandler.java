package com.dt3.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // Đánh dấu đây là "Lưới hứng lỗi" cho tất cả các @RestController
public class GlobalExceptionHandler {

    // 1. Bắt tất cả các lỗi chung (Exception)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        ex.printStackTrace(); // In lỗi ra console để dev dễ fix
        return new ResponseEntity<>("Lỗi hệ thống: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. Bắt lỗi định dạng số (VD: Nhập chữ vào ô nhập số)
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<String> handleNumberFormatException(NumberFormatException ex) {
        return new ResponseEntity<>("Dữ liệu gửi lên không đúng định dạng số!", HttpStatus.BAD_REQUEST);
    }
}