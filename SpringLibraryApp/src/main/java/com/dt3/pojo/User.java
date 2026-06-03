package com.dt3.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "user")
public class User implements Serializable {

    private static long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    
    @Column(name = "username", nullable=false, unique=true, length=50)
    private String username;
    
    @Column(name = "password", nullable=false, length=255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) 
    private String password;

    @Column(name = "role", nullable=false, length=20)
    private String role;

    @Column(name="full_name", nullable=false, length=100)
    private String fullName;
    
    @Column(name = "is_approved")
    private Boolean isApproved = false;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "avatar")
    private String avatar;
    
    @Column(name = "created_at", insertable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // 👉 CHỐT CHẶN VÒNG LẶP Ở ĐÂY
    @OneToMany(mappedBy = "uploaderBy", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Document> uploaderDocuments;

    public User() {}

    // --- GETTERS & SETTERS (Đã khôi phục đầy đủ) ---
    public static long getSerialVersionUID() { return serialVersionUID; }
    public static void setSerialVersionUID(long aSerialVersionUID) { serialVersionUID = aSerialVersionUID; }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Set<Document> getUploaderDocuments() { return uploaderDocuments; }
    public void setUploaderDocuments(Set<Document> uploaderDocuments) { this.uploaderDocuments = uploaderDocuments; }
}