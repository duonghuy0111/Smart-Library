package com.dt3.service.impl;

import com.dt3.repository.CategoryRepository;
import com.dt3.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.dt3.pojo.Category;

@Service
public class CategoryServiceImpl implements CategoryService{
   
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Override
    public List<Category> getCategories(){
        return this.categoryRepository.getCategories();
    }
    
    @Override
    public Category getCategoryById(int id){
        return this.categoryRepository.getCategoryById(id);
    }

    @Override
    public void addCategory(Category category) {
         this.categoryRepository.addCategory(category);
    }

    // 👉 ĐÃ THÊM MỚI: Xóa danh mục
    @Override
    public void deleteCategory(int id) {
        this.categoryRepository.deleteCategory(id);
    }
}