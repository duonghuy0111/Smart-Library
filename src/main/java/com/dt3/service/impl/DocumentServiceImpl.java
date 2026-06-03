    /*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.service.impl;

import com.dt3.pojo.Document;
import com.dt3.repository.DocumentRepository;
import com.dt3.service.DocumentService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author Admin
 */
@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Override
    public Map<String, Object> getDocuments(Map<String, String> params) {
        return this.documentRepository.getDocuments(params);
    }
    
    @Override
    public Long countDocuments(Map<String,String> params){
        return this.documentRepository.countDocuments(params);
    }

    @Override
    public void saveOrUpdate(Document doc) {
        // Tương lai: logic upload file pdf/ảnh lên cloudinary sẽ nằm ở đây
        this.documentRepository.saveOrUpdate(doc);
    }

    @Override
    public Document getDocumentById(int id) {
        return this.documentRepository.getDocumentById(id);
    }

    @Override
    public void deleteDocument(int id) {
        this.documentRepository.deleteDocument(id);
    }

    @Override
    public void addDocument(Document document) {
        this.documentRepository.saveOrUpdate(document);
    }
}
