package com.dt3.controllers;

import com.dt3.pojo.Document;
import com.dt3.pojo.User;
import com.dt3.service.CategoryService;
import com.dt3.service.DocumentService;
import com.dt3.service.UserService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin")
public class AdminUIController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    // 1. Link tới trang chủ Admin
    @GetMapping({"", "/dashboard"})
    public String dashboard(Model model) {
        // Tạm thời để số giả, sau này thích thì nối StatsService vào
        model.addAttribute("totalDocuments", 125);
        model.addAttribute("totalAccess", 5400);
        model.addAttribute("totalRevenue", "15,000,000");
        return "dashboard"; 
    }

    // ================== QUẢN LÝ HỌC LIỆU ==================

    // 2. Danh sách Học liệu
    @GetMapping("/documents")
    public String manageDocuments(Model model, @RequestParam Map<String, String> params) {
        Map<String, Object> result = documentService.getDocuments(params);
        model.addAttribute("documents", result.get("content"));
        return "documents"; 
    }

    // 3. Form thêm mới Học liệu
    @GetMapping("/documents/add")
    public String showAddDocumentForm(Model model) {
        model.addAttribute("document", new Document());
        model.addAttribute("categories", categoryService.getCategories()); 
        return "document-form";
    }

    // 4. Form sửa Học liệu
    @GetMapping("/documents/{id}")
    public String showEditDocumentForm(@PathVariable("id") int id, Model model) {
        model.addAttribute("document", documentService.getDocumentById(id));
        model.addAttribute("categories", categoryService.getCategories());
        return "document-form";
    }

    // 5. Lưu Học liệu (Thêm hoặc Sửa)
    @PostMapping("/documents")
    public String saveDocument(@ModelAttribute("document") Document document) {
        documentService.addDocument(document); 
        return "redirect:/admin/documents";
    }

    // 6. Xóa Học liệu
    @GetMapping("/documents/delete/{id}")
    public String deleteDocument(@PathVariable("id") int id) {
        documentService.deleteDocument(id); 
        return "redirect:/admin/documents";
    }

    // ================== QUẢN LÝ USER / DUYỆT THỦ THƯ ==================

    // 7. Danh sách Thủ thư chờ duyệt
    @GetMapping("/users")
    public String manageUsers(Model model) {
        List<User> pendingUsers = userService.getUsers("ROLE_LIBRARIAN");
        model.addAttribute("pendingUsers", pendingUsers);
        return "users";
    }

    // 8. API gọi từ JS để duyệt Thủ thư
    @PostMapping("/users/approve/{id}")
    @ResponseBody
    public ResponseEntity<?> approveLibrarian(@PathVariable("id") int id) {
        try {
            userService.approveUser(id); // Gọi hàm bạn vừa thêm ở UserServiceImpl
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // 9. Trang Đăng nhập
    @GetMapping("/login")
    public String loginPage() {
        return "login"; 
    }
}