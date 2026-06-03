package com.dt3.dto;

import java.math.BigDecimal;

public class RoiDTO {
    private Integer id;
    private String documentName;
    private BigDecimal capitalCost;
    private BigDecimal totalRevenue;
    private double roiPercentage;

    // Tự generate Getter và Setter cho 5 biến trên nhé
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public BigDecimal getCapitalCost() { return capitalCost; }
    public void setCapitalCost(BigDecimal capitalCost) { this.capitalCost = capitalCost; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public double getRoiPercentage() { return roiPercentage; }
    public void setRoiPercentage(double roiPercentage) { this.roiPercentage = roiPercentage; }
}