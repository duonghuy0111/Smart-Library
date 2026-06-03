package com.dt3.utils;

import org.hibernate.query.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PaginationUtils {

    /**
     * Hàm đóng gói phân trang dùng chung cho mọi class
     * @param query: Câu lệnh lấy dữ liệu (HQL)
     * @param countQuery: Câu lệnh đếm tổng số dòng (HQL)
     * @param page: Trang hiện tại (từ React gửi lên)
     * @param pageSize: Số lượng item trên 1 trang
     * @return Map chứa "content" và "totalPages" chuẩn form cho ReactJS
     */
    public static <T> Map<String, Object> getPaginatedResult(Query<T> query, Query<Long> countQuery, int page, int pageSize) {
        
        // 1. Cắt dữ liệu (LIMIT / OFFSET)
        int startPosition = (page - 1) * pageSize;
        query.setFirstResult(startPosition);
        query.setMaxResults(pageSize);
        List<T> content = query.getResultList();

        // 2. Tính tổng số trang
        long totalRecords = countQuery.uniqueResult();
        int totalPages = (int) Math.ceil((double) totalRecords / pageSize);

        // 3. Đóng gói trả về
        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalPages", totalPages);
        result.put("totalRecords", totalRecords); // Gửi thêm tổng số record nếu UI cần hiển thị
        
        return result;
    }
}