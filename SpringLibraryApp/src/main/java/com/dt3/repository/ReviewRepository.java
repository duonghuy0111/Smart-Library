package com.dt3.repository;

import com.dt3.pojo.Review;
import java.util.List;

public interface ReviewRepository {
    List<Review> getReviewByDocumentId(int documentId);
    void addReview(Review review);
}
