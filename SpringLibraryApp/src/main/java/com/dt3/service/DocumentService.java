/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service;

import com.dt3.pojo.Document;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Admin
 */
public interface DocumentService {
    Map<String, Object> getDocuments(Map<String, String> params);
    Long countDocuments(Map<String,String> params);
    void saveOrUpdate(Document doc);
    Document getDocumentById(int id);
    void deleteDocument(int id);

    public void addDocument(Document document);
}
