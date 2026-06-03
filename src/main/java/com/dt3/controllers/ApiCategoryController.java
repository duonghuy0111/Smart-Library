/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.pojo.Category;
import com.dt3.service.CategoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Admin
 */

@RestController
@RequestMapping("/api/categories")
@CrossOrigin  // Cho phép ReactJS gọi qua
public class ApiCategoryController {
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping("/")
    public ResponseEntity<List<Category>> getCategories(){
        List<Category> categories = this.categoryService.getCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }
    @PostMapping(path = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addCategory(@RequestBody Category category) {
        try {
            // Lưu ý: Nếu trong CategoryService của em hàm thêm tên là khác (ví dụ saveCategory, createCategory...) thì em sửa lại chữ addCategory cho khớp nhé!
            this.categoryService.addCategory(category); 
            return new ResponseEntity<>("Thêm danh mục thành công!", HttpStatus.CREATED);
        } catch (Exception ex) {
            return new ResponseEntity<>("Lỗi khi thêm danh mục: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable(value = "id") int id) {
        try {
            // Lưu ý: Đảm bảo trong CategoryService và CategoryRepository của bạn đã có hàm deleteCategory(id)
            // Nếu chưa có, bạn chỉ cần dùng: session.remove(session.get(Category.class, id)); ở Repository
            this.categoryService.deleteCategory(id);
            return new ResponseEntity<>("Xóa danh mục thành công!", HttpStatus.NO_CONTENT);
        } catch (Exception ex) {
            return new ResponseEntity<>("Không thể xóa do danh mục này đang chứa tài liệu!", HttpStatus.BAD_REQUEST);
        }
    }
}
