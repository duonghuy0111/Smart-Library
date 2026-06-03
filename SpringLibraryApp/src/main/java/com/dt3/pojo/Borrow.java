package com.dt3.pojo;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "borrow")
public class Borrow implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    @OneToMany(mappedBy = "borrow", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    // 👉 ĐÃ XÓA @JsonIgnore Ở ĐÂY: Để API trả về đầy đủ danh sách sách đã mượn
    private Set<BorrowDetail> borrowDetails;

    // Getter và Setter
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public Set<BorrowDetail> getBorrowDetails() { return borrowDetails; }
    public void setBorrowDetails(Set<BorrowDetail> borrowDetails) { this.borrowDetails = borrowDetails; }
}