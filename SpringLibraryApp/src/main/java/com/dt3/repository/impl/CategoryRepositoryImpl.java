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
        Session session = this.factory.getObject().getCurrentSession();
        // 👉 ĐÃ SỬA: Chuyển đổi sang chuẩn persist/merge thay cho saveOrUpdate cũ
        if (category.getId() != null && category.getId() > 0) {
            session.merge(category); 
        } else {
            session.persist(category); 
        }
    }
    @Override
    public void deleteCategory(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        Category cat = session.get(Category.class, id);
        if (cat != null) {
            session.remove(cat); // Xóa khỏi Database
        }
    }
}