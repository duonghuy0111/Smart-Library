package com.dt3.service.impl;

import com.dt3.dto.KpiDTO;
import com.dt3.dto.RoiDTO;
import com.dt3.repository.StatsRepository;
import com.dt3.service.StatsService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StatsServiceImpl implements StatsService {

    @Autowired
    private StatsRepository statsRepository;

    @Override
    public KpiDTO getGeneralKPIs() {
        return this.statsRepository.getGeneralKPIs();
    }
    @Override
    public List<Object[]> getDocumentCountByCategory() {
        return this.statsRepository.getDocumentCountByCategory();
    }

    @Override
    public List<Object[]> getRevenueByYear(int year) {
        return this.statsRepository.getRevenueByYear(year);
    }

    @Override
    public List<RoiDTO> getDocumentROI() {
        return this.statsRepository.getDocumentROI();
    }

    @Override
    public List<Object[]> getBorrowFrequency(String viewMode, int year) {
        return this.statsRepository.getBorrowFrequency(viewMode, year);
    }
}