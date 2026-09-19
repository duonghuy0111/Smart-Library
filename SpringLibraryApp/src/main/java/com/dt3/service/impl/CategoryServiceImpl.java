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
    @Override
    public List<Category> getAllCategories() {
        return this.categoryRepository.getCategories();
    }

    @Override
    public void addOrUpdate(Category category) {
        if (category == null) {
            return;
        }

        if (category.getId() != null && category.getId() > 0) {
            this.categoryRepository.updateCategory(category);
        } else {
            this.categoryRepository.addCategory(category);
        }
    }

    @Override
    public void delete(Integer id) {
        if (id != null) {
            this.categoryRepository.deleteCategory(id);
        }
    }

    // 👉 ĐÃ THÊM MỚI: Xóa danh mục
    @Override
    public void deleteCategory(int id) {
        this.categoryRepository.deleteCategory(id);
    }

    @Override
    public void updateCategory(Category category) {
                this.categoryRepository.updateCategory(category);

    }
}