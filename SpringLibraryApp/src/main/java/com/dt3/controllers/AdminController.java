package com.dt3.controllers;

import com.dt3.pojo.Category;
import com.dt3.pojo.Document;
import com.dt3.dto.KpiDTO;
import com.dt3.dto.ReviewRequestDTO;
import com.dt3.dto.RoiDTO;

import com.dt3.pojo.User;
import com.dt3.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private StatsService statsService;
    
     @GetMapping("/login")
    public String loginPage() {
        return "login";
    }


    // ==================== DASHBOARD ====================

    @GetMapping
    public String dashboard(Model model) {
        // Tổng số liệu
        model.addAttribute("totalUsers", userService.countAll());
        model.addAttribute("totalDocuments", documentService.countAll());
        model.addAttribute("totalBorrows", borrowService.countAll());
        model.addAttribute("totalRevenue", transactionService.getTotalRevenue());

        // Thống kê tài liệu theo danh mục
        model.addAttribute("docsByCategory", statsService.countDocumentsByCategory());

        // Top tài liệu mượn nhiều nhất
        model.addAttribute("topDocuments", documentService.getTopBorrowed(5));

        // Người dùng mới nhất
        model.addAttribute("recentUsers", userService.getRecentUsers(5));

        // Thủ thư chờ duyệt
        model.addAttribute("pendingLibrarians", userService.getPendingLibrarians());

        return "admin/dashboard";
    }

    // ==================== QUẢN LÝ NGƯỜI DÙNG ====================

    @GetMapping("/users")
    public String listUsers(@RequestParam(defaultValue = "") String keyword,
                            @RequestParam(defaultValue = "") String role,
                            @RequestParam(defaultValue = "1") int page,
                            Model model) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("role", role);
        params.put("page", page);
        params.put("pageSize", 10);

        model.addAttribute("users", userService.getUsers(params));
        model.addAttribute("totalPages", userService.countPages(params, 10));
        model.addAttribute("currentPage", page);
        model.addAttribute("keyword", keyword);
        model.addAttribute("role", role);
        return "admin/users/list";
    }

    @GetMapping("/users/{id}")
    public String viewUser(@PathVariable Integer id, Model model) {
        model.addAttribute("user", userService.getUserById(id));
        model.addAttribute("borrows", borrowService.getByUserId(id));
        return "admin/users/detail";
    }

    @PostMapping("/users/{id}/approve")
    public String approveUser(@PathVariable Integer id, RedirectAttributes ra) {
        userService.approveUser(id);
        ra.addFlashAttribute("successMsg", "Đã duyệt tài khoản thủ thư thành công!");
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/reject")
    public String rejectUser(@PathVariable Integer id, RedirectAttributes ra) {
        userService.rejectUser(id);
        ra.addFlashAttribute("successMsg", "Đã từ chối tài khoản thủ thư.");
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable Integer id, RedirectAttributes ra) {
        userService.deleteUser(id);
        ra.addFlashAttribute("successMsg", "Đã xóa người dùng thành công!");
        return "redirect:/admin/users";
    }

    @GetMapping("/users/{id}/edit")
    public String editUserForm(@PathVariable Integer id, Model model) {
        model.addAttribute("user", userService.getUserById(id));
        return "admin/users/edit";
    }

    @PostMapping("/users/{id}/edit")
    public String editUser(@PathVariable Integer id,
                           @ModelAttribute User user,
                           RedirectAttributes ra) {
        user.setId(id);
        userService.updateUser(user);
        ra.addFlashAttribute("successMsg", "Cập nhật người dùng thành công!");
        return "redirect:/admin/users";
    }

    // ==================== QUẢN LÝ TÀI LIỆU ====================

    @GetMapping("/documents")
    public String listDocuments(@RequestParam(defaultValue = "") String keyword,
                                @RequestParam(required = false) Integer categoryId,
                                @RequestParam(defaultValue = "1") int page,
                                Model model) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("categoryId", categoryId);
        params.put("page", page);
        params.put("pageSize", 10);

        model.addAttribute("documents", documentService.getDocuments(params));
        model.addAttribute("totalPages", documentService.countPages(params, 10));
        model.addAttribute("currentPage", page);
        model.addAttribute("categories", categoryService.getAllCategories());
        model.addAttribute("keyword", keyword);
        model.addAttribute("selectedCategory", categoryId);
        return "admin/documents/list";
    }

    @GetMapping("/documents/add")
    public String addDocumentForm(Model model) {
        model.addAttribute("document", new Document());
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/documents/form";
    }

    @PostMapping("/documents/add")
    public String addDocument(@ModelAttribute Document document,
                              @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
                              @RequestParam(value = "docFile", required = false) MultipartFile docFile,
                              RedirectAttributes ra) {
        try {
            documentService.addOrUpdate(document, coverFile, docFile);
            ra.addFlashAttribute("successMsg", "Thêm tài liệu thành công!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", "Lỗi: " + e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @GetMapping("/documents/{id}/edit")
    public String editDocumentForm(@PathVariable Integer id, Model model) {
        model.addAttribute("document", documentService.getById(id));
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/documents/form";
    }

    @PostMapping("/documents/{id}/edit")
    public String editDocument(@PathVariable Integer id,
                               @ModelAttribute Document document,
                               @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
                               @RequestParam(value = "docFile", required = false) MultipartFile docFile,
                               RedirectAttributes ra) {
        try {
            document.setId(id);
            documentService.addOrUpdate(document, coverFile, docFile);
            ra.addFlashAttribute("successMsg", "Cập nhật tài liệu thành công!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", "Lỗi: " + e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @PostMapping("/documents/{id}/delete")
    public String deleteDocument(@PathVariable Integer id, RedirectAttributes ra) {
        documentService.softDelete(id);
        ra.addFlashAttribute("successMsg", "Đã xóa tài liệu thành công!");
        return "redirect:/admin/documents";
    }

    @PostMapping("/documents/{id}/restore")
    public String restoreDocument(@PathVariable Integer id, RedirectAttributes ra) {
        documentService.restore(id);
        ra.addFlashAttribute("successMsg", "Đã khôi phục tài liệu!");
        return "redirect:/admin/documents";
    }

    // ==================== QUẢN LÝ DANH MỤC ====================

    @GetMapping("/categories")
    public String listCategories(Model model) {
        model.addAttribute("categories", categoryService.getAllCategories());
        model.addAttribute("newCategory", new Category());
        return "admin/categories/list";
    }

    @PostMapping("/categories/add")
    public String addCategory(@ModelAttribute Category category, RedirectAttributes ra) {
        categoryService.addOrUpdate(category);
        ra.addFlashAttribute("successMsg", "Thêm danh mục thành công!");
        return "redirect:/admin/categories";
    }

    @PostMapping("/categories/{id}/edit")
    public String editCategory(@PathVariable Integer id,
                               @ModelAttribute Category category,
                               RedirectAttributes ra) {
        category.setId(id);
        categoryService.addOrUpdate(category);
        ra.addFlashAttribute("successMsg", "Cập nhật danh mục thành công!");
        return "redirect:/admin/categories";
    }

    @PostMapping("/categories/{id}/delete")
    public String deleteCategory(@PathVariable Integer id, RedirectAttributes ra) {
        try {
            categoryService.delete(id);
            ra.addFlashAttribute("successMsg", "Đã xóa danh mục!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", "Không thể xóa danh mục đang có tài liệu!");
        }
        return "redirect:/admin/categories";
    }

    // ==================== QUẢN LÝ GIAO DỊCH ====================

    @GetMapping("/transactions")
    public String listTransactions(@RequestParam(defaultValue = "") String status,
                                   @RequestParam(defaultValue = "1") int page,
                                   Model model) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("page", page);
        params.put("pageSize", 15);

        model.addAttribute("transactions", transactionService.getTransactions(params));
        model.addAttribute("totalPages", transactionService.countPages(params, 15));
        model.addAttribute("currentPage", page);
        model.addAttribute("status", status);
        model.addAttribute("totalRevenue", transactionService.getTotalRevenue());
        return "admin/transactions/list";
    }

    // ==================== THỐNG KÊ / BÁO CÁO ====================

    @GetMapping("/stats")
    public String stats(@RequestParam(defaultValue = "month") String period, Model model) {
        model.addAttribute("period", period);
        model.addAttribute("borrowStats", statsService.getBorrowStats(period));
        model.addAttribute("revenueStats", statsService.getRevenueStats(period));
        model.addAttribute("topDocs", documentService.getTopBorrowed(10));
        model.addAttribute("categoryStats", statsService.countDocumentsByCategory());
        return "admin/stats/index";
    }
}