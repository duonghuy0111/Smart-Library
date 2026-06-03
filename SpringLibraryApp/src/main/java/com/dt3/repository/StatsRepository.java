package com.dt3.repository;

import com.dt3.dto.KpiDTO;
import java.util.List;

public interface StatsRepository {
    KpiDTO getGeneralKPIs();
    List<Object[]> getDocumentCountByCategory();
    List<Object[]> getRevenueByYear(int year);
    List<com.dt3.dto.RoiDTO> getDocumentROI();
    List<Object[]> getBorrowFrequency(String viewMode, int year);
}
