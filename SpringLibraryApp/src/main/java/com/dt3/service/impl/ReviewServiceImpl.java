
package com.dt3.service.impl;

import com.dt3.pojo.Review;
import com.dt3.repository.ReviewRepository;
import com.dt3.service.ReviewService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ReviewServiceImpl implements ReviewService{
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Override
    public List<Review> getReviewByDocumentId(int documentId){
        return this.reviewRepository.getReviewByDocumentId(documentId);
    }
    
    @Override
    public void addReview(Review review){
        this.reviewRepository.addReview(review);
    }
}
