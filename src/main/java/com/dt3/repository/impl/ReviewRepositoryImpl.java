/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository.impl;

import com.dt3.pojo.Review;
import com.dt3.repository.ReviewRepository;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Admin
 */

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
        session.persist(review);
    }
}
