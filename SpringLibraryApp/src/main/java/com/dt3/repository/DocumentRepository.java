package com.dt3.repository;

import com.dt3.pojo.Document;
import java.util.List;
import java.util.Map;

public interface DocumentRepository {
    // Lấy danh sách tài liệu có bộ lọc tìm kiếm và phân trang
    // Đổi kiểu trả về thành Map để chứa cả Data và Tổng số trang
    Map<String, Object> getDocuments(Map<String, String> params);    // Đếm tổng số tài liệu theo bộ lọc(phục vụ hiển thị số trang ở frontend)
    Long countDocuments(Map<String, String>params);
    //Thêm hoặc cập nhật tài liệu
    void saveOrUpdate(Document doc);
    //Tìm tài liệu theo Id cụ thể
    Document getDocumentById(int id);
    //Xóa tài liệu
    void deleteDocument(int id);
    
    // Bổ sung
    List<Document> searchDocuments(String keyword, String sortBy);
    
}
