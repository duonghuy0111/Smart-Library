/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository.impl;


import com.dt3.repository.CategoryRepository;
import jakarta.persistence.Query;
import java.util.List;
import com.dt3.pojo.Category;
import org.hibernate.Session;
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
public class CategoryRepositoryImpl implements CategoryRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public List<Category> getCategories() {
        Session session = this.factory.getObject().getCurrentSession();
        Query query = session.createQuery("FROM Category", Category.class);
        return query.getResultList();

    }

    @Override
    public Category getCategoryById(int id){
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(Category.class, id);
    }
    
   @Override
    public void addCategory(Category category) {
       // Lấy session hiện tại ra để dùng
        Session session = this.factory.getObject().getCurrentSession();
        // Gọi session để lưu trực tiếp vào DB
        session.saveOrUpdate(category);
    }
}

