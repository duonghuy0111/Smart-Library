/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.dto.ReviewRequestDTO;
import com.dt3.pojo.Document;
import com.dt3.pojo.Review;
import com.dt3.pojo.User;
import com.dt3.service.DocumentService;
import com.dt3.service.ReviewService;
import com.dt3.service.UserService;
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
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserService userService;

    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addReview(@RequestBody ReviewRequestDTO payload) { // (Hoặc Map<String, Object> nếu bạn đang dùng cách Map)
        try {
            Review review = new Review();
            review.setComment(payload.getContent()); // Nếu dùng Map thì là payload.get("content").toString()
            review.setRating(payload.getRating());   // Nếu dùng Map thì là Integer.parseInt(...)
            
            // 👉 2. Bốc Object thật từ Database lên thay vì tự "new"
            User u = this.userService.getUserById(payload.getUserId());
            review.setUser(u);
            
            Document d = this.documentService.getDocumentById(payload.getDocumentId());
            review.setDocument(d);
            
            this.reviewService.addReview(review);
            
            return new ResponseEntity<>("Đăng đánh giá thành công!", HttpStatus.CREATED);
        } catch(Exception ex){
            return new ResponseEntity<>("Không thể gửi đánh giá: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
