package com.dt3.controllers;

import com.dt3.dto.KpiDTO;
import com.dt3.service.StatsService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class ApiStatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/kpis")
    public ResponseEntity<KpiDTO> getKPIs() {
        KpiDTO kpi = this.statsService.getGeneralKPIs();
        return new ResponseEntity<>(kpi, HttpStatus.OK);
    }
    @GetMapping("/category-stats")
    public ResponseEntity<List<Object[]>> getCategoryStats() {
        List<Object[]> stats = this.statsService.getDocumentCountByCategory();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<Object[]>> getRevenueStats(
            @RequestParam(value = "year", defaultValue = "2026") int year) {
        List<Object[]> stats = this.statsService.getRevenueByYear(year);
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
    @GetMapping("/roi")
    public ResponseEntity<List<com.dt3.dto.RoiDTO>> getRoiStats() {
        // Gọi xuống tầng service để lấy dữ liệu
        List<com.dt3.dto.RoiDTO> list = this.statsService.getDocumentROI();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }
    @GetMapping("/usage")
    public ResponseEntity<List<Object[]>> getUsageStats(
            @RequestParam(value = "viewMode", defaultValue = "MONTHS") String viewMode,
            @RequestParam(value = "year", defaultValue = "2026") int year) {
        List<Object[]> stats = this.statsService.getBorrowFrequency(viewMode, year);
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
}