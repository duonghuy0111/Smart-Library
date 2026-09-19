package com.dt3.repository;

import com.dt3.pojo.Document;
import java.util.List;
import java.util.Map;

public interface DocumentRepository {

    Map<String, Object> getDocuments(Map<String, Object> params);

    Long countDocuments(Map<String, Object> params);

    Long countAll();

    List<Document> getTopBorrowed(int limit);

    void saveOrUpdate(Document doc);

    Document getDocumentById(int id);

    void deleteDocument(int id);

    void restoreDocument(int id);

    List<Document> searchDocuments(String keyword, String sortBy);
}