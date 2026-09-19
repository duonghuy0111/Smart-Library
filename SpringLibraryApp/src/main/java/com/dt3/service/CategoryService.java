package com.dt3.service;

import java.util.List;
import com.dt3.pojo.Category;

public interface CategoryService {

    List<Category> getCategories();

    Category getCategoryById(int id);

    void deleteCategory(int id);

    void addCategory(Category category);

    void updateCategory(Category category);

    // Admin compatibility methods
    List<Category> getAllCategories();

    void addOrUpdate(Category category);

    void delete(Integer id);
}