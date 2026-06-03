package com.dt3.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "borrow_detail")
public class BorrowDetail implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "borrow_id", nullable = false)
    @JsonIgnore // 👉 ĐÃ THÊM VÀO ĐÂY: Chặn lỗi lặp vòng vô hạn (Infinite Recursion) của JSON
    private Borrow borrow;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "due_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueDate;

    // Getter và Setter
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Borrow getBorrow() { return borrow; }
    public void setBorrow(Borrow borrow) { this.borrow = borrow; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
}