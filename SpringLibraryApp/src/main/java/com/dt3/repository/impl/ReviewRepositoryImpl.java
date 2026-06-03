package com.dt3.repository.impl;

import com.dt3.pojo.Review;
import com.dt3.repository.ReviewRepository;
import java.util.Date;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class ReviewRepositoryImpl implements ReviewRepository{
    
    @Autowired
    private LocalSessionFactoryBean factory;
    
    @Override
    public List<Review> getReviewByDocumentId(int documentId){
        Session session = this.factory.getObject().getCurrentSession();
        Query query = session.createQuery("FROM Review r WHERE r.document.id = :dId ORDER BY r.createdAt DESC", Review.class);
        query.setParameter("dId", documentId);
        return query.getResultList();
    }
    
    @Override
    public void addReview(Review review){
        Session session = this.factory.getObject().getCurrentSession();
        
        // 1. Tìm xem User này đã từng đánh giá Document này chưa
        String hql = "FROM Review r WHERE r.user.id = :uId AND r.document.id = :dId";
        Query<Review> query = session.createQuery(hql, Review.class);
        query.setParameter("uId", review.getUser().getId());
        query.setParameter("dId", review.getDocument().getId());
        
        List<Review> existingReviews = query.getResultList();
        
        if (!existingReviews.isEmpty()) {
            // 2. NẾU CÓ RỒI -> Lấy bài cũ ra CẬP NHẬT lại nội dung và số sao
            Review existingReview = existingReviews.get(0);
            existingReview.setComment(review.getComment());
            existingReview.setRating(review.getRating());
            existingReview.setCreatedAt(new Date()); // Cập nhật lại thời gian sửa mới nhất
            session.merge(existingReview);
        } else {
            // 3. NẾU CHƯA CÓ -> Thêm bài đánh giá mới
            session.persist(review);
        }
    }
}