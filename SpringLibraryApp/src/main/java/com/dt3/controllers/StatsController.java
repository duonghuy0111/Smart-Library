package com.dt3.controllers;

import com.dt3.dto.RoiDTO;
import com.dt3.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Year;
import java.util.List;

@Controller
public class StatsController {

    @Autowired
    private StatsService statsService;

    // ==========================================
    // TRANG THỐNG KÊ (Dashboard Báo cáo)
    // ==========================================
    @GetMapping("/admin/stats")
    public String statsDashboard(
            @RequestParam(value = "period", defaultValue = "MONTHS") String period,
            @RequestParam(value = "year", required = false) Integer year, 
            Model model) {

        // Nếu không có tham số year trên URL, mặc định lấy năm hiện tại (2026)
        int currentYear = (year != null) ? year : Year.now().getValue();

        // Gọi các hàm thống kê, truyền chính xác period (MONTHS/YEARS) và năm được chọn vào
        List<Object[]> borrowStats = statsService.getBorrowFrequency(period, currentYear);
        List<Object[]> revenueStats = statsService.getRevenueByYear(currentYear);
        List<Object[]> categoryStats = statsService.getDocumentCountByCategory();
        List<RoiDTO> roiStats = statsService.getDocumentROI();

        // Đẩy dữ liệu sang View
        model.addAttribute("borrowStats", borrowStats);
        model.addAttribute("revenueStats", revenueStats);
        model.addAttribute("categoryStats", categoryStats);
        model.addAttribute("roiStats", roiStats);

        // Đẩy lại cấu hình bộ lọc sang View để HTML "nhớ" trạng thái người dùng vừa chọn
        model.addAttribute("period", period);
        model.addAttribute("selectedYear", currentYear);

        return "stats_index";
    }
}