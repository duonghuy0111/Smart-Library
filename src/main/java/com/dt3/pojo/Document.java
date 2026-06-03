/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Version;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;
import org.hibernate.annotations.NamedQueries;
import org.hibernate.annotations.NamedQuery;

/**
 *
 * @author Admin
 */
@Entity
@Table(name = "document")
@NamedQueries({
    @NamedQuery(name = "Document.countAll", query = "SELECT COUNT(d) FROM Document d"),
    @NamedQuery(name = "Document.countByCategory", query = "SELECT d.category.id, d.category.name, COUNT(d.id) FROM Document d GROUP BY d.category.id")
})
public class Document implements Serializable {

    private static long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "title", nullable=false, length=255)
    @JsonProperty("name") // Đổi title thành name khi xuất ra JSON
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "author", length=100)
    private String author;

    @Column(name = "publish_year")
    private Integer publishYear;

    @Column(name = "price")
    private BigDecimal price = BigDecimal.ZERO;
    
    @Column(name = "capital_cost")
    private BigDecimal capitalCost = BigDecimal.ZERO;

    public BigDecimal getCapitalCost() { return capitalCost; }
    public void setCapitalCost(BigDecimal capitalCost) { this.capitalCost = capitalCost; }
    
    @Column(name = "cover_image", length=255)
    @JsonProperty("image") // Đổi coverImage thành image
    private String coverImage;

    @Column(name = "file_url", nullable=false,length=255)
    @JsonProperty("filePath") // Đổi fileUrl thành filePath
    private String fileUrl;

    @Column(name="is_premium")
    private boolean isPremium=false;
    
    @JoinColumn(name = "category_id", referencedColumnName = "id")
    @ManyToOne(fetch = FetchType.EAGER)
    private Category category;

    @Column(name = "created_at",insertable = false,updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @JoinColumn(name = "uploaded_by", referencedColumnName = "id")
    @ManyToOne(fetch = FetchType.EAGER)
    private User uploaderBy;
    
    // 👉 1. Thêm trường quản lý Xóa mềm (Soft Delete)
    @Column(name = "is_active")
    private boolean isActive = true; // Mặc định sách mới thêm vào là True (chưa xóa)

    // 👉 2. Thêm trường quản lý Khóa lạc quan (Chống Race Condition)
    @Version
    @Column(name = "version")
    private Integer version;

    // ... Tạo Getter/Setter cho 2 trường này ...
    public boolean isIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    
    public Document() {
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (getId() != null ? getId().hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        if (!(object instanceof Document)) {
            return false;
        }
        Document other = (Document) object;
        if ((this.getId() == null && other.getId() != null) || (this.getId() != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.dt3.pojo.Document[ id=" + getId() + " ]";
    }

  

    /**
     * @return the serialVersionUID
     */
    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    /**
     * @param aSerialVersionUID the serialVersionUID to set
     */
    public static void setSerialVersionUID(long aSerialVersionUID) {
        serialVersionUID = aSerialVersionUID;
    }

    /**
     * @return the id
     */
    public Integer getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the author
     */
    public String getAuthor() {
        return author;
    }

    /**
     * @param author the author to set
     */
    public void setAuthor(String author) {
        this.author = author;
    }

    /**
     * @return the publishYear
     */
    public Integer getPublishYear() {
        return publishYear;
    }

    /**
     * @param publishYear the publishYear to set
     */
    public void setPublishYear(Integer publishYear) {
        this.publishYear = publishYear;
    }

    /**
     * @return the price
     */
    public BigDecimal getPrice() {
        return price;
    }

    /**
     * @param price the price to set
     */
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    /**
     * @return the coverImage
     */
    public String getCoverImage() {
        return coverImage;
    }

    /**
     * @param coverImage the coverImage to set
     */
    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    /**
     * @return the fileUrl
     */
    public String getFileUrl() {
        return fileUrl;
    }

    /**
     * @param fileUrl the fileUrl to set
     */
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    /**
     * @return the isPremium
     */
    public boolean isIsPremium() {
        return isPremium;
    }

    /**
     * @param isPremium the isPremium to set
     */
    public void setIsPremium(boolean isPremium) {
        this.isPremium = isPremium;
    }

    /**
     * @return the category
     */
    public Category getCategory() {
        return category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(Category category) {
        this.category = category;
    }

    /**
     * @return the createdAt
     */
    public Date getCreatedAt() {
        return createdAt;
    }

    /**
     * @param createdAt the createdAt to set
     */
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * @return the uploaderBy
     */
    public User getUploaderBy() {
        return uploaderBy;
    }

    /**
     * @param uploaderBy the uploaderBy to set
     */
    public void setUploaderBy(User uploaderBy) {
        this.uploaderBy = uploaderBy;
    }
    @Column(name = "borrow_count")
    private Integer borrowCount = 0;

    // Kéo xuống dưới cùng và thêm Getter / Setter:
    public Integer getBorrowCount() {
        return borrowCount;
    }

    public void setBorrowCount(Integer borrowCount) {
        this.borrowCount = borrowCount;
    }
}
