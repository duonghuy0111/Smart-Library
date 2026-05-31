/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository.impl;

import com.dt3.pojo.User;
import com.dt3.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.hibernate.Session;
import org.hibernate.query.Query;
import java.util.List;
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
public class UserRepositoryImpl implements UserRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public User getUserByUsername(String username) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root =  query.from(User.class);
        query.select(root);

        query.where(builder.equal(root.get("username"),username));
        
        Query q = session.createQuery(query);
        try{
            return(User) q.getSingleResult(); // Trả về 1 user duy nhất tìm được
        } catch(Exception ex){
            return null;
        }
    }

    @Override
    public User getUserById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(User.class, id);   
    }

    @Override
    public void saveOrUpdate(User user){
        Session session = this.factory.getObject().getCurrentSession();
        if(user.getId() != null && user.getId() > 0){
            session.merge(user); // Cập nhật( ví dụ: admin duyệt tài khoản , đổi is_approved = true
        } else{
            session.persist(user); // Thêm mới( ví dụ: sinh viên bấm đăng ký tài khoản)
        }
    }
    @Override
    public List<User> getUsers(String role){
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);
        query.select(root);
        
        if (role != null && !role.isEmpty()) {
            query.where(builder.equal(root.get("role"), role));
        }
        Query q = session.createQuery(query);
        return q.getResultList();
    }
}
