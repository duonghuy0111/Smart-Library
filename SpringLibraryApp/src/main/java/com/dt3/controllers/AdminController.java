package com.dt3.controllers;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dt3.dto.KpiDTO;
import com.dt3.pojo.Borrow;
import com.dt3.pojo.Category;
import com.dt3.pojo.Document;
import com.dt3.pojo.User;
import com.dt3.pojo.Transaction;
import com.dt3.service.*;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes; // 👉 Thư viện dùng để gửi thông báo an toàn

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private DocumentService documentService;
    @Autowired private CategoryService categoryService;
    @Autowired private BorrowService borrowService;
    @Autowired private StatsService statsService;
    @Autowired private Cloudinary cloudinary;
    
    @Autowired private LocalSessionFactoryBean factory; 

    // ==========================================
    // 0. TRANG ĐĂNG NHẬP ADMIN (login.html)
    // ==========================================
    @GetMapping("/login")
    public String login() {
        return "login";
    }

    // ==========================================
    // 1. TRANG DASHBOARD CHÍNH (admin_dashboard.html)
    // ==========================================
    @GetMapping("")
    public String dashboard(Model model) {
        KpiDTO kpis = statsService.getGeneralKPIs();
        model.addAttribute("totalUsers", kpis.getTotalUsers());
        model.addAttribute("totalDocuments", kpis.getTotalDocuments());
        model.addAttribute("totalBorrows", kpis.getTotalBorrows());
        model.addAttribute("totalRevenue", kpis.getTotalRevenue());

        List<User> librarians = userService.getUsers("ROLE_LIBRARIAN");
        List<User> pendingLibrarians = librarians.stream()
                .filter(u -> u.getIsApproved() == null || !u.getIsApproved())
                .collect(Collectors.toList());
        model.addAttribute("pendingLibrarians", pendingLibrarians);

        Map<String, String> params = new HashMap<>();
        params.put("sortBy", "popularity");
        params.put("page", "1");
        Map<String, Object> docResult = documentService.getDocuments(params);
        List<Document> documents = (List<Document>) docResult.get("content");
        List<Document> topDocuments = documents.stream().limit(5).collect(Collectors.toList());
        model.addAttribute("topDocuments", topDocuments);

        return "admin_dashboard";
    }

    @PostMapping("/users/{id}/approve")
    public String approveLibrarian(@PathVariable("id") int id) { 
        userService.approveUser(id);
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/reject")
    @Transactional 
    public String rejectLibrarian(@PathVariable("id") int id) { 
        Session session = factory.getObject().getCurrentSession();
        User user = session.get(User.class, id);
        if (user != null) {
            session.remove(user); 
        }
        return "redirect:/admin";
    }

    // ==========================================
    // 2. QUẢN LÝ TÀI LIỆU
    // ==========================================
    @GetMapping("/documents")
    public String listDocuments(@RequestParam Map<String, String> params, Model model) {
        Map<String, Object> result = documentService.getDocuments(params);
        
        model.addAttribute("documents", result.get("content"));
        model.addAttribute("totalPages", result.get("totalPages"));
        
        int page = 1;
        if (params.containsKey("page") && !params.get("page").isEmpty()) {
            page = Integer.parseInt(params.get("page"));
        }
        model.addAttribute("currentPage", page);
        model.addAttribute("keyword", params.getOrDefault("keyword", ""));
        model.addAttribute("selectedCategory", params.getOrDefault("categoryId", ""));
        model.addAttribute("categories", categoryService.getCategories());
        
        return "document_list";
    }

    @GetMapping("/documents/add")
    public String addDocumentForm(Model model) {
        Document doc = new Document();
        doc.setCategory(new Category()); 
        model.addAttribute("document", doc);
        model.addAttribute("categories", categoryService.getCategories());
        return "documents_form";
    }

    // 👉 FIX: Sử dụng RedirectAttributes để truyền thông báo Tiếng Việt
    @PostMapping("/documents/add")
    public String addDocument(@ModelAttribute("document") Document doc,
                              @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
                              @RequestParam(value = "docFile", required = false) MultipartFile docFile,
                              RedirectAttributes redirectAttributes) {
        try {
            if (coverFile != null && !coverFile.isEmpty()) {
                doc.setCoverImage(uploadToCloudinary(coverFile));
            }
            if (docFile != null && !docFile.isEmpty()) {
                doc.setFileUrl(uploadToCloudinary(docFile));
            }
            documentService.saveOrUpdate(doc);
            redirectAttributes.addFlashAttribute("successMsg", "Thêm tài liệu mới thành công");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMsg", "Có lỗi xảy ra khi thêm tài liệu");
        }
        return "redirect:/admin/documents";
    }

    @GetMapping("/documents/{id}/edit")
    public String editDocumentForm(@PathVariable("id") int id, Model model) { 
        Document doc = documentService.getDocumentById(id);
        model.addAttribute("document", doc);
        model.addAttribute("categories", categoryService.getCategories());
        return "documents_form";
    }

    // 👉 FIX: Sử dụng RedirectAttributes
    @PostMapping("/documents/{id}/edit")
    public String editDocument(@PathVariable("id") int id, 
                               @ModelAttribute("document") Document docForm,
                               @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
                               @RequestParam(value = "docFile", required = false) MultipartFile docFile,
                               RedirectAttributes redirectAttributes) {
        try {
            Document existingDoc = documentService.getDocumentById(id);
            if (existingDoc != null) {
                existingDoc.setTitle(docForm.getTitle());
                existingDoc.setAuthor(docForm.getAuthor());
                existingDoc.setPublishYear(docForm.getPublishYear());
                existingDoc.setDescription(docForm.getDescription());
                existingDoc.setIsPremium(docForm.isIsPremium());
                
                if (docForm.getCategory() != null) {
                    existingDoc.setCategory(categoryService.getCategoryById(docForm.getCategory().getId()));
                }
                if (coverFile != null && !coverFile.isEmpty()) {
                    existingDoc.setCoverImage(uploadToCloudinary(coverFile));
                }
                if (docFile != null && !docFile.isEmpty()) {
                    existingDoc.setFileUrl(uploadToCloudinary(docFile));
                }
                documentService.saveOrUpdate(existingDoc);
                redirectAttributes.addFlashAttribute("successMsg", "Cập nhật tài liệu thành công");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "redirect:/admin/documents";
    }

    // 👉 FIX: Sử dụng RedirectAttributes
    @PostMapping("/documents/{id}/delete")
    public String deleteDocument(@PathVariable("id") int id, RedirectAttributes redirectAttributes) { 
        documentService.deleteDocument(id);
        redirectAttributes.addFlashAttribute("successMsg", "Đã xóa tài liệu khỏi hệ thống");
        return "redirect:/admin/documents";
    }

    // ==========================================
    // 3. QUẢN LÝ NGƯỜI DÙNG
    // ==========================================
    @GetMapping("/users")
    @Transactional 
    public String listUsers(@RequestParam Map<String, String> params, Model model) {
        Session session = factory.getObject().getCurrentSession();
        String keyword = params.getOrDefault("keyword", "");
        String role = params.getOrDefault("role", "");
        int page = Integer.parseInt(params.getOrDefault("page", "1"));
        int pageSize = 10;

        // 👉 FIX: Tách phần HQL nền tảng ra để tái sử dụng chuẩn xác cho cả lệnh truy vấn và lệnh COUNT
        String baseHql = "FROM User u WHERE 1=1";
        if (!keyword.isEmpty()) {
            baseHql += " AND (u.fullName LIKE :kw OR u.email LIKE :kw OR u.username LIKE :kw)";
        }
        if (!role.isEmpty()) {
            baseHql += " AND u.role = :role";
        }

        // Lệnh lấy danh sách (Cần sắp xếp)
        var query = session.createQuery(baseHql + " ORDER BY u.id DESC", User.class);
        
        // Lệnh đếm tổng số dòng (Bỏ qua ORDER BY, truy vấn an toàn)
        var countQuery = session.createQuery("SELECT COUNT(u.id) " + baseHql, Long.class);

        if (!keyword.isEmpty()) {
            query.setParameter("kw", "%" + keyword + "%");
            countQuery.setParameter("kw", "%" + keyword + "%");
        }
        if (!role.isEmpty()) {
            query.setParameter("role", role);
            countQuery.setParameter("role", role);
        }

        query.setFirstResult((page - 1) * pageSize);
        query.setMaxResults(pageSize);

        List<User> users = query.getResultList();
        long totalRecords = countQuery.uniqueResult();
        int totalPages = (int) Math.ceil((double) totalRecords / pageSize);

        model.addAttribute("users", users);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("currentPage", page);
        model.addAttribute("keyword", keyword);
        model.addAttribute("role", role);

        return "users_list";
    }

    @GetMapping("/users/{id}")
    public String detailUser(@PathVariable("id") int id, Model model) { 
        User user = userService.getUserById(id);
        model.addAttribute("user", user);
        if (user != null) {
            Map<String, Object> borrowData = borrowService.getMyBorrows(user.getUsername(), new HashMap<>());
            model.addAttribute("borrows", borrowData.get("content"));
        }
        return "users_detail";
    }

    @GetMapping("/users/{id}/edit")
    public String editUserForm(@PathVariable("id") int id, Model model) { 
        User user = userService.getUserById(id);
        model.addAttribute("user", user);
        return "users_edit";
    }

    @PostMapping("/users/{id}/edit")
    @Transactional 
    public String editUser(@PathVariable("id") int id, @ModelAttribute("user") User userForm, RedirectAttributes redirectAttributes) { 
        User existingUser = userService.getUserById(id);
        if (existingUser != null) {
            existingUser.setFullName(userForm.getFullName());
            existingUser.setEmail(userForm.getEmail());
            existingUser.setRole(userForm.getRole());
            
            Session session = factory.getObject().getCurrentSession();
            session.merge(existingUser);
            
            redirectAttributes.addFlashAttribute("successMsg", "Cập nhật thành viên thành công!");
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/users/{id}/delete")
    @Transactional 
    public String deleteUser(@PathVariable("id") int id, RedirectAttributes redirectAttributes) { 
        Session session = factory.getObject().getCurrentSession();
        User user = session.get(User.class, id);
        if (user != null) {
            session.remove(user);
        }
        redirectAttributes.addFlashAttribute("successMsg", "Đã xóa thành viên khỏi hệ thống");
        return "redirect:/admin/users";
    }

    // ==========================================
    // 4. QUẢN LÝ DANH MỤC
    // ==========================================
    @GetMapping("/categories")
    public String listCategories(Model model) {
        model.addAttribute("categories", categoryService.getCategories());
        model.addAttribute("newCategory", new Category());
        return "categories_list";
    }

    @PostMapping("/categories/add")
    public String addCategory(@ModelAttribute("newCategory") Category category, RedirectAttributes redirectAttributes) {
        categoryService.addCategory(category);
        redirectAttributes.addFlashAttribute("successMsg", "Thêm danh mục mới thành công");
        return "redirect:/admin/categories";
    }

    @PostMapping("/categories/{id}/edit")
    public String editCategory(@PathVariable("id") int id, @RequestParam("name") String name, RedirectAttributes redirectAttributes) { 
        Category cat = categoryService.getCategoryById(id);
        if (cat != null) {
            cat.setName(name);
            categoryService.addCategory(cat);
            redirectAttributes.addFlashAttribute("successMsg", "Cập nhật tên danh mục thành công");
        }
        return "redirect:/admin/categories";
    }

    @PostMapping("/categories/{id}/delete")
    public String deleteCategory(@PathVariable("id") int id, RedirectAttributes redirectAttributes) { 
        try {
            categoryService.deleteCategory(id);
            redirectAttributes.addFlashAttribute("successMsg", "Xóa danh mục thành công");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMsg", "Không thể xóa! Danh mục này chứa tài liệu ràng buộc.");
        }
        return "redirect:/admin/categories";
    }

    // ==========================================
    // 5. QUẢN LÝ MƯỢN SÁCH
    // ==========================================
    @GetMapping("/borrows")
    @Transactional 
    public String listBorrows(@RequestParam Map<String, String> params, Model model) {
        String keyword = params.getOrDefault("keyword", "");
        int page = Integer.parseInt(params.getOrDefault("page", "1"));
        int pageSize = 10;
        
        Session session = factory.getObject().getCurrentSession();
        
        // 👉 FIX: Tương tự như Users, cấu trúc lệnh HQL đếm phiếu mượn chuẩn xác
        String baseHql = "FROM Borrow b";
        if (!keyword.isEmpty()) {
            baseHql += " WHERE b.user.fullName LIKE :kw OR b.user.username LIKE :kw";
        }
        
        var query = session.createQuery(baseHql + " ORDER BY b.createdDate DESC", Borrow.class);
        var countQuery = session.createQuery("SELECT COUNT(b.id) " + baseHql, Long.class);
        
        if (!keyword.isEmpty()) {
            query.setParameter("kw", "%" + keyword + "%");
            countQuery.setParameter("kw", "%" + keyword + "%");
        }
        
        query.setFirstResult((page - 1) * pageSize);
        query.setMaxResults(pageSize);
        
        List<Borrow> content = query.getResultList();
        long totalRecords = countQuery.uniqueResult();
        int totalPages = (int) Math.ceil((double) totalRecords / pageSize);
        
        model.addAttribute("borrows", content);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("currentPage", page);
        model.addAttribute("keyword", keyword);
        
        return "borrows_list";
    }

    // ==========================================
    // 6. LỊCH SỬ GIAO DỊCH
    // ==========================================
    @GetMapping("/transactions")
    @Transactional 
    public String listTransactions(Model model) {
        Session session = factory.getObject().getCurrentSession();
        List<Transaction> transactions = session.createQuery(
                "FROM Transaction t ORDER BY t.transactionDate DESC", Transaction.class).getResultList();
        
        KpiDTO kpis = statsService.getGeneralKPIs();
        
        model.addAttribute("transactions", transactions);
        model.addAttribute("totalRevenue", kpis.getTotalRevenue());
        
        return "transactions_list";
    }

    // ==========================================
    // HÀM PHỤ TRỢ: UPLOAD FILE LÊN CLOUDINARY
    // ==========================================
    private String uploadToCloudinary(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("resource_type", "auto"));
        return (String) uploadResult.get("secure_url");
    }
}