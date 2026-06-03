/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository.impl;

import com.dt3.pojo.Transaction;
import com.dt3.repository.TransactionRepository;
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
public class TransactionRepositoryImpl implements TransactionRepository{
    @Autowired
    private LocalSessionFactoryBean factory;
    
    @Override
    public void saveTransaction(Transaction transaction){
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(transaction);
    }
    
    @Override
    public boolean checkUserPaid(int userId, int documentId){
        Session session = this.factory.getObject().getCurrentSession();
        String sql = "SELECT count(t) FROM Transaction t WHERE t.user.id = :uId AND t.document.id = :dId AND t.status = 'SUCCESS'";
        Query query = session.createQuery(sql, Long.class);
        query.setParameter("uId", userId);
        query.setParameter("dId", documentId);
        
        Long count = (Long) query.getSingleResult();
        return count > 0;
    }
}