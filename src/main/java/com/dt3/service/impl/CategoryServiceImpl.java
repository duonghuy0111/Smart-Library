/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service.impl;

import com.dt3.repository.CategoryRepository;
import com.dt3.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.dt3.pojo.Category;
/**
 *
 * @author Admin
 */

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
}

