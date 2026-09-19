package com.dt3.repository;

import com.dt3.pojo.Category;
import java.util.List;

public interface CategoryRepository {
    List<Category> getCategories();
    Category getCategoryById(int id);
    
    void addCategory(Category category);
    void deleteCategory(int id);
    
    // Bổ sung 
    void updateCategory(Category category);
}
