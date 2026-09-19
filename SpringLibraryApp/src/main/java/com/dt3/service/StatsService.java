package com.dt3.service;

import com.dt3.dto.KpiDTO;
import java.util.List;

public interface StatsService {

    KpiDTO getGeneralKPIs();

    List<Object[]> getDocumentCountByCategory();

    List<Object[]> getRevenueByYear(int year);

    List<com.dt3.dto.RoiDTO> getDocumentROI();

    List<Object[]> getBorrowFrequency(String viewMode, int year);

    // Admin compatibility methods
    List<Object[]> countDocumentsByCategory();

    List<Object[]> getBorrowStats(String period);

    List<Object[]> getRevenueStats(String period);
}