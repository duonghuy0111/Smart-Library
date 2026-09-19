package com.dt3.service;

import com.dt3.pojo.Document;
import java.util.Map;

public interface DocumentService {
    Map<String, Object> getDocuments(Map<String, String> params);
    Long countDocuments(Map<String,String> params);
    void saveOrUpdate(Document doc);
    Document getDocumentById(int id);
    void deleteDocument(int id);
    public void addDocument(Document document);
}
