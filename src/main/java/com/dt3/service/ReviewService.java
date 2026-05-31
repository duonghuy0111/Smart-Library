/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service;

import com.dt3.pojo.Review;
import java.util.List;

/**
 *
 * @author Admin
 */
public interface ReviewService {
    List<Review> getReviewByDocumentId(int documentId);
    void addReview(Review review);
}
