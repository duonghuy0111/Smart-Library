/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.pojo.Document;
import com.dt3.service.DocumentService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
 import com.cloudinary.Cloudinary;
 import com.cloudinary.utils.ObjectUtils;
 import java.math.BigDecimal;
 import org.springframework.web.multipart.MultipartFile;
 import com.dt3.pojo.Category;
 import com.dt3.pojo.User;
 import com.dt3.service.UserService;
 import java.security.Principal;
import org.springframework.web.bind.annotation.DeleteMapping;

/**
 *
 * @author Admin
 */

@RestController
@RequestMapping("/api/documents")
@CrossOrigin
public class ApiDocumentController {
    @Autowired
    private DocumentService documentService;
    
    // API lấy danh sách tài liệu(có hỗ trợ tìm kiếm và phân trang)
    @GetMapping("/")
    public ResponseEntity<List<Document>> getDocuments(@RequestParam Map<String, String> params){
        List<Document> documents = this.documentService.getDocuments(params);
        return new ResponseEntity<>(documents,HttpStatus.OK);
    }
    
    // API đếm tổng số tài liệu(Để ReactJS chia số trang 1,2,3)
    @GetMapping("/count/")
    public ResponseEntity<Long> countDocuments(@RequestParam Map<String,String> params){
        Long count = this.documentService.countDocuments(params);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
    
    // API lấy chi tiết 1 cuốn sách khi click vào
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable(value = "id") int id){
        Document document = this.documentService.getDocumentById(id);
        if (document != null) {
            return new ResponseEntity<>(document,HttpStatus.OK);
        } 
        return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Báo lỗi 404 nếu không tìm thấy
    }
    
    
    @Autowired
    private Cloudinary cloudinary;
    
    @Autowired
    private UserService userService; // Để lấy thông tin người đang upload

    // Đổi consumes thành MULTIPART_FORM_DATA_VALUE
    @PostMapping(path = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addDocument(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) { 
        
        try {
            Document doc = new Document();
            
            // 1. Nhận các dữ liệu chữ từ ReactJS gửi lên
            doc.setTitle(params.get("name")); // React gửi 'name', DB lưu 'title'
            doc.setAuthor(params.get("author"));
            doc.setPublishYear(Integer.parseInt(params.get("publishYear")));
            
            BigDecimal price = new BigDecimal(params.get("price"));
            doc.setPrice(price);
            doc.setIsPremium(price.compareTo(BigDecimal.ZERO) > 0); // Tự động set Premium nếu giá > 0
            doc.setDescription(params.get("description"));

            // Set Danh mục
            Category c = new Category();
            c.setId(Integer.parseInt(params.get("categoryId")));
            doc.setCategory(c);
            
            // Set Người đăng (Lấy từ Token của người đang đăng nhập)
            if (principal != null) {
                User uploader = this.userService.getUserByUsername(principal.getName());
                doc.setUploaderBy(uploader);
            }

            // 2. Xử lý Upload Ảnh bìa lên Cloudinary
            if (image != null && !image.isEmpty()) {
                Map res = this.cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                doc.setCoverImage(res.get("secure_url").toString());
            }

            // 3. Xử lý Upload File nội dung (PDF/Docx) lên Cloudinary
            if (file != null && !file.isEmpty()) {
                // "resource_type", "auto" cực kỳ quan trọng để Cloudinary nhận diện PDF
                Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                doc.setFileUrl(res.get("secure_url").toString());
            }

            // 4. Lưu vào Database
            this.documentService.saveOrUpdate(doc); 
            return new ResponseEntity<>("Thêm sách thành công!", HttpStatus.CREATED);
            
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi thêm sách: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // API XÓA TÀI LIỆU
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable(value = "id") int id) {
        try {
            // Giả định bạn đã có hàm deleteDocument trong DocumentService
            this.documentService.deleteDocument(id); 
            return new ResponseEntity<>("Xóa tài liệu thành công!", HttpStatus.NO_CONTENT);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi xóa tài liệu: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // API CẬP NHẬT TÀI LIỆU (Tương tự như Thêm mới, nhưng dùng id có sẵn)
    @PostMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDocument(
            @PathVariable(value = "id") int id,
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            // 1. Lấy cuốn sách cũ ra từ Database
            Document doc = this.documentService.getDocumentById(id);
            if (doc == null) {
                return new ResponseEntity<>("Không tìm thấy tài liệu!", HttpStatus.NOT_FOUND);
            }

            // 2. Cập nhật các trường Text
            doc.setTitle(params.get("name")); 
            doc.setAuthor(params.get("author"));
            doc.setPublishYear(Integer.parseInt(params.get("publishYear")));
            
            BigDecimal price = new BigDecimal(params.get("price"));
            doc.setPrice(price);
            doc.setIsPremium(price.compareTo(BigDecimal.ZERO) > 0);
            doc.setDescription(params.get("description"));

            Category c = new Category();
            c.setId(Integer.parseInt(params.get("categoryId")));
            doc.setCategory(c);

            // 3. Nếu Thủ thư có chọn Ảnh MỚI thì mới up lên Cloudinary và thay đổi
            if (image != null && !image.isEmpty()) {
                Map res = this.cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                doc.setCoverImage(res.get("secure_url").toString());
            }

            // 4. Nếu Thủ thư có chọn File nội dung MỚI thì mới thay đổi
            if (file != null && !file.isEmpty()) {
                Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                doc.setFileUrl(res.get("secure_url").toString());
            }

            // 5. Lưu lại vào Database
            this.documentService.saveOrUpdate(doc); 
            return new ResponseEntity<>("Cập nhật sách thành công!", HttpStatus.OK);
            
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi cập nhật sách: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
