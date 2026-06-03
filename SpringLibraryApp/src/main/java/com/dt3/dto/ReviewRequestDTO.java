package com.dt3.dto;

public class ReviewRequestDTO {
    // Chỉ khai báo đúng 4 biến phẳng mà Frontend gửi lên
    private String content;
    private int rating;
    private int documentId;
    private int userId;

    // --- Generate Getter và Setter cho cả 4 biến này ---
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    
    public int getDocumentId() { return documentId; }
    public void setDocumentId(int documentId) { this.documentId = documentId; }
    
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
}