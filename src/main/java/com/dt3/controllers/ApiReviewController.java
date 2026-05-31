/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.pojo.Review;
import com.dt3.service.ReviewService;
import jakarta.faces.annotation.RequestMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Admin
 */

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class ApiReviewController {
    @Autowired
    private ReviewService reviewService;
    
    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<Review>> getReviewByDocumentId(@PathVariable(value = "documentId") int documentId){
        List<Review> reviews = this.reviewService.getReviewByDocumentId(documentId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
    
    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addReview(@RequestBody Review review){
        try{
            this.reviewService.addReview(review);
            return new ResponseEntity<>("Đăng đánh giá thành công!", HttpStatus.CREATED);
        } catch(Exception ex){
            return new ResponseEntity<>("Không thể gửi đánh giá: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
