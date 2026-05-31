package com.dt3.repository.impl;

import com.dt3.pojo.BorrowHistory;
import com.dt3.repository.BorrowHistoryRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class BorrowHistoryRepositoryImpl implements BorrowHistoryRepository{
    
    @Autowired
    private LocalSessionFactoryBean factory;
    
    @Override
    public void logAction(BorrowHistory history){
        Session session = this.factory.getObject().getCurrentSession();
        if (history.getId() != null && history.getId() > 0) {
            session.merge(history); // Cập nhật nếu đã có ID
        } else {
            session.persist(history); // Thêm mới nếu chưa có ID
        }
    }

    // 👉 THÊM HÀM NÀY ĐỂ TRANG PROFILE LẤY ĐƯỢC LỊCH SỬ
    @Override
    public List<BorrowHistory> getHistoryByUser(int userId) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<BorrowHistory> query = builder.createQuery(BorrowHistory.class);
        Root<BorrowHistory> root = query.from(BorrowHistory.class);
        query.select(root);
        
        // Lọc theo user_id
        query.where(builder.equal(root.get("user").get("id"), userId));
        
        // Sắp xếp ngày mượn giảm dần (mới nhất lên trên)
        query.orderBy(builder.desc(root.get("borrowDate")));
        
        Query<BorrowHistory> q = session.createQuery(query);
        return q.getResultList();
    }
}