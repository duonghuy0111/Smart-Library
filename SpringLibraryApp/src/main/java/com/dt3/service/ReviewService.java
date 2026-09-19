package com.dt3.service;

import com.dt3.pojo.Review;
import java.util.List;

public interface ReviewService {
    List<Review> getReviewByDocumentId(int documentId);
    void addReview(Review review);
}
