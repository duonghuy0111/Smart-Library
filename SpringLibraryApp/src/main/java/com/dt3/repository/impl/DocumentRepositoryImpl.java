/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.repository.impl;

import com.dt3.pojo.Document;
import com.dt3.repository.DocumentRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
public class DocumentRepositoryImpl implements DocumentRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    private static final int PAGE_SIZE = 12;

    // Hàm TÌM KIẾM SÁCH nâng cao (Theo từ khóa, khoảng giá mượn/thế chân, chuyên ngành)
    @Override
    public Map<String, Object> getDocuments(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Document> query = builder.createQuery(Document.class);
        Root<Document> root = query.from(Document.class);
        query.select(root);

        // Lọc dữ liệu động
        List<Predicate> predicates = getDocumentPredicates(builder,root,params);
        query.where(predicates.toArray(Predicate[]::new));
        
        // Sắp xếp động theo yêu cầu của giao diện
        if (params != null && params.containsKey("sortBy")) {
            String sortBy = params.get("sortBy");
            if (sortBy.equals("popularity")) {
                query.orderBy(builder.desc(root.get("borrowCount"))); 
            } else if (sortBy.equals("year")) {
                query.orderBy(builder.desc(root.get("publishYear"))); 
            } else if (sortBy.equals("name")) {
                query.orderBy(builder.asc(root.get("title"))); 
            } else {
                query.orderBy(builder.desc(root.get("createdAt")));
            }
        } else {
            query.orderBy(builder.desc(root.get("createdAt")));
        }
        
        Query q = session.createQuery(query);
        
        // 👉 ĐÃ SỬA: Xử lý PHÂN TRANG và ĐÓNG GÓI DỮ LIỆU
        int page = 1;
        if(params != null){
            String pageStr = params.get("page");
            if(pageStr != null && !pageStr.isEmpty()){
                page = Integer.parseInt(pageStr);
            }
        }
        
        q.setFirstResult((page - 1) * PAGE_SIZE);
        q.setMaxResults(PAGE_SIZE);
        List<Document> content = q.getResultList(); // Lấy 6 cuốn sách của trang hiện tại
        
        // Tính tổng số trang bằng cách gọi lại hàm countDocuments của bạn
        long totalRecords = this.countDocuments(params);
        int totalPages = (int) Math.ceil((double) totalRecords / PAGE_SIZE);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("content", content); // Mảng sách
        result.put("totalPages", totalPages); // Tổng số trang
        
        return result;
    }
    @Override
    public Long countDocuments(Map<String,String>params){
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<Document> root = query.from(Document.class);
        
        query.select(builder.count(root));
        
        List<Predicate> predicates = getDocumentPredicates(builder,root,params);
        query.where(predicates.toArray(Predicate[]::new));
        
        return session.createQuery(query).getSingleResult();
    }

    private List<Predicate> getDocumentPredicates(CriteriaBuilder builder, Root<Document> root, Map<String,String> params){
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.isTrue(root.get("isActive")));
        if(params != null){
            // 1. Tìm theo từ khóa (tiêu đề hoặc tác giả) - Từ thanh Search Header
            String kw = params.get("kw");
            if(kw != null && !kw.isEmpty()){
                Predicate titleLike = builder.like(root.get("title"), String.format("%%%s%%",kw));
                Predicate authorLike = builder.like(root.get("author"), String.format("%%%s%%",kw));
                predicates.add(builder.or(titleLike,authorLike));
            }
            
            // 2. Lọc theo chuyên ngành (categoryId)
            String cateId = params.get("categoryId");
            if (cateId != null && !cateId.isEmpty()) {
                predicates.add(builder.equal(root.get("category").get("id"), Integer.parseInt(cateId)));
            }
            
            // 3. Lọc theo Tác giả (Từ bộ lọc trang Kho Học Liệu)
            String author = params.get("author");
            if (author != null && !author.isEmpty()) {
                predicates.add(builder.like(root.get("author"), String.format("%%%s%%", author)));
            }

            // 4. Lọc theo Năm xuất bản (Từ bộ lọc trang Kho Học Liệu)
            String publishYear = params.get("publishYear");
            if (publishYear != null && !publishYear.isEmpty()) {
                predicates.add(builder.equal(root.get("publishYear"), Integer.parseInt(publishYear)));
            }

            // 5. Lọc theo trạng thái thu phí / miễn phí
            String isPremium = params.get("isPremium");
            if(isPremium != null && !isPremium.isEmpty()){
                predicates.add(builder.equal(root.get("isPremium"), Boolean.parseBoolean(isPremium)));
            }
        }
        return predicates;
    }
    
    @Override
    public Document getDocumentById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(Document.class, id);
    }
    
    @Override
    public void saveOrUpdate(Document doc) {
        Session session = this.factory.getObject().getCurrentSession();
        if (doc.getId() != null && doc.getId() > 0) {
            session.merge(doc); // Cập nhật sách cũ
        } else {
            session.persist(doc); // Thêm sách mới
        }
    }

    @Override
    public void deleteDocument(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        Document doc = this.getDocumentById(id);
        if (doc != null) {
            // Thay vì dùng session.remove(doc) gây mất dữ liệu lịch sử
            doc.setIsActive(false); // Đánh dấu là đã xóa
            session.merge(doc);     // Cập nhật lại vào Database
        }
    }
}
