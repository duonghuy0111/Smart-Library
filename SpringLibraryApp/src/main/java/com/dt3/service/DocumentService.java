package com.dt3.service;
import java.util.List;
import com.dt3.pojo.Document;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {

    Map<String, Object> getDocuments(Map<String, Object> params);

    Long countDocuments(Map<String, Object> params);

    int countPages(Map<String, Object> params, int pageSize);

    Long countAll();

    List<Document> getTopBorrowed(int limit);

    void saveOrUpdate(Document doc);

    Document getDocumentById(int id);

    Document getById(Integer id);

    void deleteDocument(int id);

    void softDelete(Integer id);

    void restore(Integer id);

    void addDocument(Document document);

    void addOrUpdate(
            Document document,
            MultipartFile coverFile,
            MultipartFile docFile
    );
}