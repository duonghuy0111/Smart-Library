package com.dt3.repository.impl;

import com.dt3.pojo.Borrow;
import com.dt3.pojo.BorrowDetail;
import com.dt3.pojo.Document;
import com.dt3.pojo.User;
import com.dt3.repository.BorrowRepository;
import com.dt3.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class BorrowRepositoryImpl implements BorrowRepository {

    @Autowired
    private LocalSessionFactoryBean factory;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean addBorrow(Map<String, Object> cart, int userId) {
        Session session = this.factory.getObject().getCurrentSession();
        try {
            // 1. Tạo Phiếu mượn tổng (Borrow)
            Borrow borrow = new Borrow();
            User user = this.userRepository.getUserById(userId);
            borrow.setUser(user);
            session.persist(borrow);

            // 2. Duyệt qua giỏ hàng (Cart) từ ReactJS gửi xuống
            for (Object cartItemData : cart.values()) {
                Map<String, Object> item = (Map<String, Object>) cartItemData;
                
                int documentId = Integer.parseInt(item.get("id").toString());
                
                // Mặc định mượn 14 ngày nếu không có tham số duration
                int durationDays = item.containsKey("durationDays") ? Integer.parseInt(item.get("durationDays").toString()) : 14;
                
                Document doc = session.get(Document.class, documentId);
                
                if (doc != null) {
                    // a. Tạo BorrowDetail
                    BorrowDetail detail = new BorrowDetail();
                    detail.setBorrow(borrow);
                    detail.setDocument(doc);
                    
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(new Date());
                    cal.add(Calendar.DATE, durationDays);
                    detail.setDueDate(cal.getTime());
                    
                    session.persist(detail);
                    
                    // b. Cập nhật lượt mượn (borrow_count) như đã bàn luận
                    int currentCount = doc.getBorrowCount() == null ? 0 : doc.getBorrowCount();
                    doc.setBorrowCount(currentCount + 1);
                    session.merge(doc); // Lưu đè lại sách
                }
            }
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    private static final int PAGE_SIZE = 10; // 1 trang hiển thị 10 phiếu mượn

    // 1. LẤY TOÀN BỘ PHIẾU (CHO THỦ THƯ)
    @Override
    public Map<String, Object> getAllBorrows(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        int page = 1;
        if(params != null && params.containsKey("page")) {
            page = Integer.parseInt(params.get("page"));
        }

        // Cắt dữ liệu
        Query<Borrow> q = session.createQuery("FROM Borrow b ORDER BY b.createdDate DESC", Borrow.class);
        q.setFirstResult((page - 1) * PAGE_SIZE);
        q.setMaxResults(PAGE_SIZE);
        List<Borrow> content = q.getResultList();

        // Tính tổng số trang
        Query<Long> countQuery = session.createQuery("SELECT COUNT(b.id) FROM Borrow b", Long.class);
        long totalRecords = countQuery.uniqueResult();
        int totalPages = (int) Math.ceil((double) totalRecords / PAGE_SIZE);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("content", content);
        result.put("totalPages", totalPages);
        return result;
    }

    // 2. LẤY LỊCH SỬ CỦA RIÊNG 1 USER (CHO SINH VIÊN)
    @Override
    public Map<String, Object> getMyBorrows(String username, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        int page = 1;
        if(params != null && params.containsKey("page")) {
            page = Integer.parseInt(params.get("page"));
        }

        Query<Borrow> q = session.createQuery("FROM Borrow b WHERE b.user.username = :un ORDER BY b.createdDate DESC", Borrow.class);
        q.setParameter("un", username);
        q.setFirstResult((page - 1) * PAGE_SIZE);
        q.setMaxResults(PAGE_SIZE);
        List<Borrow> content = q.getResultList();

        Query<Long> countQuery = session.createQuery("SELECT COUNT(b.id) FROM Borrow b WHERE b.user.username = :un", Long.class);
        countQuery.setParameter("un", username);
        long totalRecords = countQuery.uniqueResult();
        int totalPages = (int) Math.ceil((double) totalRecords / PAGE_SIZE);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("content", content);
        result.put("totalPages", totalPages);
        return result;
    }

    // 👉 ĐÃ THÊM MỚI: Cập nhật hạn trả sách
    @Override
    public void extendDueDate(int detailId, String newDateStr) {
        Session session = this.factory.getObject().getCurrentSession();
        // Tìm chi tiết cuốn sách đang mượn
        com.dt3.pojo.BorrowDetail detail = session.get(com.dt3.pojo.BorrowDetail.class, detailId);
        
        if (detail != null) {
            try {
                // Parse chuỗi ngày ISO 8601 gửi từ ReactJS (VD: "2026-06-15T17:00:00.000Z") thành Date của Java
                java.time.Instant instant = java.time.Instant.parse(newDateStr);
                detail.setDueDate(java.util.Date.from(instant));
                
                session.merge(detail); // Lưu lại thay đổi
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
    // 👉 ĐÃ SỬA LẠI LƯỢT NÀY: Dùng câu lệnh DELETE trực tiếp để vượt qua khóa ngoại của Hibernate
    @Override
    public void revokeBorrow(int detailId) {
        Session session = this.factory.getObject().getCurrentSession();
        
        try {
            jakarta.persistence.Query query = session.createQuery("DELETE FROM BorrowDetail WHERE id = :id");
            query.setParameter("id", detailId);
            query.executeUpdate(); // Ra lệnh Database xóa ngay lập tức
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}