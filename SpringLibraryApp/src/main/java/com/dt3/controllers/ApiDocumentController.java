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

@RestController
@RequestMapping("/api/documents")
@CrossOrigin
public class ApiDocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private Cloudinary cloudinary;
    
    @Autowired
    private UserService userService; 

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getDocuments(@RequestParam Map<String, String> params){
        // 👉 ĐÃ SỬA: Đón Map dữ liệu thay vì List
        Map<String, Object> response = this.documentService.getDocuments(params);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/count/")
    public ResponseEntity<Long> countDocuments(@RequestParam Map<String,String> params){
        Long count = this.documentService.countDocuments(params);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable(value = "id") int id){
        Document document = this.documentService.getDocumentById(id);
        if (document != null) {
            return new ResponseEntity<>(document, HttpStatus.OK);
        } 
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    @PostMapping(path = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addDocument(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) { 
        
        try {
            Document doc = new Document();
            
            // 👉 ĐÃ SỬA: Kiểm tra an toàn dữ liệu chuỗi nhập vào
            String name = params.get("name");
            if (name == null || name.trim().isEmpty()) {
                return new ResponseEntity<>("Tiêu đề tài liệu không được để trống!", HttpStatus.BAD_REQUEST);
            }
            doc.setTitle(name);
            doc.setAuthor(params.get("author"));
            doc.setDescription(params.get("description"));
            
            // 👉 ĐÃ SỬA: Ép kiểu số nguyên và số thực an toàn tránh sập luồng hệ thống
            String publishYearStr = params.get("publishYear");
            int publishYear = (publishYearStr != null && !publishYearStr.trim().isEmpty()) ? Integer.parseInt(publishYearStr.trim()) : 2026;
            doc.setPublishYear(publishYear);
            
            String priceStr = params.get("price");
            BigDecimal price = (priceStr != null && !priceStr.trim().isEmpty()) ? new BigDecimal(priceStr.trim()) : BigDecimal.ZERO;
            doc.setPrice(price);
            doc.setIsPremium(price.compareTo(BigDecimal.ZERO) > 0); 

            String categoryIdStr = params.get("categoryId");
            if (categoryIdStr != null && !categoryIdStr.trim().isEmpty()) {
                Category c = new Category();
                c.setId(Integer.parseInt(categoryIdStr.trim()));
                doc.setCategory(c);
            } else {
                return new ResponseEntity<>("Danh mục bắt buộc phải chọn!", HttpStatus.BAD_REQUEST);
            }
            
            if (principal != null) {
                User uploader = this.userService.getUserByUsername(principal.getName());
                doc.setUploaderBy(uploader);
            }

            
            

            // Upload Ảnh bìa
            // 1. Upload Ảnh bìa (Luôn là image)
            // 2. Upload File Tài liệu (Phân loại tự động & BẢO TOÀN ĐUÔI FILE)
            if (file != null && !file.isEmpty()) {
                String originalName = file.getOriginalFilename().toLowerCase();
                
                // 1. Nếu là Video hoặc Audio -> Lưu dạng "video"
                if (originalName.endsWith(".mp4") || originalName.endsWith(".webm") || originalName.endsWith(".mp3") || originalName.endsWith(".wav")) {
                    Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "video"));
                    doc.setFileUrl(res.get("secure_url").toString());
                } 
                // 2. Nếu là PDF, DOCX, EPUB... -> Giữ nguyên cách "raw" cũ của bạn
                else {
                    Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "raw"));
                    doc.setFileUrl(res.get("secure_url").toString());
                }
            }

            this.documentService.saveOrUpdate(doc); 
            return new ResponseEntity<>("Thêm sách thành công!", HttpStatus.CREATED);
            
        } catch (NumberFormatException ex) {
            return new ResponseEntity<>("Sai định dạng số ở các trường dữ liệu năm hoặc giá!", HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi hệ thống: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable(value = "id") int id) {
        try {
            this.documentService.deleteDocument(id); 
            return new ResponseEntity<>("Xóa tài liệu thành công!", HttpStatus.NO_CONTENT);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi xóa tài liệu: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDocument(
            @PathVariable(value = "id") int id,
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            Document doc = this.documentService.getDocumentById(id);
            if (doc == null) {
                return new ResponseEntity<>("Không tìm thấy tài liệu!", HttpStatus.NOT_FOUND);
            }

            // 👉 ĐÃ SỬA: Cập nhật phòng thủ cục bộ, chỉ ghi đè trường có truyền và hợp lệ dữ liệu
            if (params.containsKey("name")) {
                String name = params.get("name");
                if (name == null || name.trim().isEmpty()) {
                    return new ResponseEntity<>("Tiêu đề tài liệu không được để trống!", HttpStatus.BAD_REQUEST);
                }
                doc.setTitle(name);
            }
            if (params.containsKey("author")) doc.setAuthor(params.get("author"));
            if (params.containsKey("description")) doc.setDescription(params.get("description"));
            
            if (params.containsKey("publishYear")) {
                String publishYearStr = params.get("publishYear");
                if (publishYearStr != null && !publishYearStr.trim().isEmpty()) {
                    doc.setPublishYear(Integer.parseInt(publishYearStr.trim()));
                }
            }
            
            if (params.containsKey("price")) {
                String priceStr = params.get("price");
                if (priceStr != null && !priceStr.trim().isEmpty()) {
                    BigDecimal price = new BigDecimal(priceStr.trim());
                    doc.setPrice(price);
                    doc.setIsPremium(price.compareTo(BigDecimal.ZERO) > 0);
                }
            }

            if (params.containsKey("categoryId")) {
                String categoryIdStr = params.get("categoryId");
                if (categoryIdStr != null && !categoryIdStr.trim().isEmpty()) {
                    Category c = new Category();
                    c.setId(Integer.parseInt(categoryIdStr.trim()));
                    doc.setCategory(c);
                }
            }

            

            // 2. Upload File Tài liệu (Phân loại tự động & BẢO TOÀN ĐUÔI FILE)
            if (file != null && !file.isEmpty()) {
                String originalName = file.getOriginalFilename().toLowerCase();
                
                // 1. Nếu là Video hoặc Audio -> Lưu dạng "video"
                if (originalName.endsWith(".mp4") || originalName.endsWith(".webm") || originalName.endsWith(".mp3") || originalName.endsWith(".wav")) {
                    Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "video"));
                    doc.setFileUrl(res.get("secure_url").toString());
                } 
                // 2. Nếu là PDF, DOCX, EPUB... -> Giữ nguyên cách "raw" cũ của bạn
                else {
                    Map res = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "raw"));
                    doc.setFileUrl(res.get("secure_url").toString());
                }
            }

            this.documentService.saveOrUpdate(doc); 
            return new ResponseEntity<>("Cập nhật sách thành công!", HttpStatus.OK);
            
        } catch (NumberFormatException ex) {
            return new ResponseEntity<>("Dữ liệu cập nhật không đúng định dạng số!", HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi cập nhật sách: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}