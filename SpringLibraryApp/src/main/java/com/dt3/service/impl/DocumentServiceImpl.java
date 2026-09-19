package com.dt3.service.impl;

import com.dt3.pojo.Document;
import com.dt3.repository.DocumentRepository;
import com.dt3.service.DocumentService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Override
    public Map<String, Object> getDocuments(Map<String, Object> params) {
        return this.documentRepository.getDocuments(params);
    }

    @Override
    public Long countDocuments(Map<String, Object> params) {
        return this.documentRepository.countDocuments(params);
    }

    @Override
    public int countPages(Map<String, Object> params, int pageSize) {
        Long total = this.documentRepository.countDocuments(params);

        if (total == null || total == 0) {
            return 0;
        }

        return (int) Math.ceil((double) total / pageSize);
    }

    @Override
    public Long countAll() {
        return this.documentRepository.countAll();
    }

    @Override
    public List<Document> getTopBorrowed(int limit) {
        return this.documentRepository.getTopBorrowed(limit);
    }

    @Override
    public void saveOrUpdate(Document doc) {
        this.documentRepository.saveOrUpdate(doc);
    }

    @Override
    public Document getDocumentById(int id) {
        return this.documentRepository.getDocumentById(id);
    }

    @Override
    public Document getById(Integer id) {
        if (id == null) {
            return null;
        }

        return this.documentRepository.getDocumentById(id);
    }

    @Override
    public void deleteDocument(int id) {
        this.documentRepository.deleteDocument(id);
    }

    @Override
    public void softDelete(Integer id) {
        if (id != null) {
            this.documentRepository.deleteDocument(id);
        }
    }

    @Override
    public void restore(Integer id) {
        if (id != null) {
            this.documentRepository.restoreDocument(id);
        }
    }

    @Override
    public void addDocument(Document document) {
        this.documentRepository.saveOrUpdate(document);
    }

    @Override
    public void addOrUpdate(
            Document document,
            MultipartFile coverFile,
            MultipartFile docFile
    ) {
        /*
         * File upload / Cloudinary handling will be implemented here.
         * For now, preserve the existing document persistence logic.
         */
        this.documentRepository.saveOrUpdate(document);
    }
}