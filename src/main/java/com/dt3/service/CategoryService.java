/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service;

import java.util.List;
import com.dt3.pojo.Category;
/**
 *
 * @author Admin
 */
public interface CategoryService {
    List<Category> getCategories();
    Category getCategoryById(int id);
    void deleteCategory(int id);
    public void addCategory(Category category);
}
