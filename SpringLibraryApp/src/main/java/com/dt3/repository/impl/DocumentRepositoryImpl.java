package com.dt3.repository.impl;

import com.dt3.pojo.Document;
import com.dt3.repository.DocumentRepository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.Session;
import org.hibernate.query.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class DocumentRepositoryImpl implements DocumentRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public Map<String, Object> getDocuments(Map<String, Object> params) {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Document> query = builder.createQuery(Document.class);
        Root<Document> root = query.from(Document.class);

        query.select(root);

        List<Predicate> predicates =
                getDocumentPredicates(builder, root, params);

        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        String sortBy = getStringParam(params, "sortBy");

        if ("popularity".equals(sortBy)) {
            query.orderBy(builder.desc(root.get("borrowCount")));
        } else if ("year".equals(sortBy)) {
            query.orderBy(builder.desc(root.get("publishYear")));
        } else if ("name".equals(sortBy)) {
            query.orderBy(builder.asc(root.get("title")));
        } else {
            query.orderBy(builder.desc(root.get("createdAt")));
        }

        Query<Document> resultQuery = session.createQuery(query);

        int page = getIntParam(params, "page", 1);
        int pageSize = getIntParam(params, "pageSize", 10);

        resultQuery.setFirstResult((page - 1) * pageSize);
        resultQuery.setMaxResults(pageSize);

        List<Document> content = resultQuery.getResultList();

        long totalRecords = this.countDocuments(params);

        int totalPages = pageSize > 0
                ? (int) Math.ceil((double) totalRecords / pageSize)
                : 0;

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalPages", totalPages);

        return result;
    }

    @Override
    public Long countDocuments(Map<String, Object> params) {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<Document> root = query.from(Document.class);

        query.select(builder.count(root));

        List<Predicate> predicates =
                getDocumentPredicates(builder, root, params);

        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        Long count = session.createQuery(query).getSingleResult();

        return count != null ? count : 0L;
    }

    @Override
    public Long countAll() {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<Document> root = query.from(Document.class);

        query.select(builder.count(root));

        Long count = session.createQuery(query).getSingleResult();

        return count != null ? count : 0L;
    }

    @Override
    public List<Document> getTopBorrowed(int limit) {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Document> query = builder.createQuery(Document.class);
        Root<Document> root = query.from(Document.class);

        query.select(root);

        query.where(
                builder.isTrue(root.get("isActive"))
        );

        query.orderBy(
                builder.desc(root.get("borrowCount"))
        );

        Query<Document> resultQuery = session.createQuery(query);
        resultQuery.setMaxResults(Math.max(limit, 1));

        return resultQuery.getResultList();
    }

    private List<Predicate> getDocumentPredicates(
            CriteriaBuilder builder,
            Root<Document> root,
            Map<String, Object> params
    ) {
        List<Predicate> predicates = new ArrayList<>();

        // Chỉ lấy tài liệu đang hoạt động
        predicates.add(
                builder.isTrue(root.get("isActive"))
        );

        if (params == null) {
            return predicates;
        }

        /*
         * 1. Keyword
         *
         * AdminController sử dụng:
         * params.put("keyword", keyword);
         *
         * Các màn hình cũ có thể sử dụng "kw",
         * nên hỗ trợ cả hai.
         */
        String keyword = getStringParam(params, "keyword");

        if (keyword == null || keyword.isEmpty()) {
            keyword = getStringParam(params, "kw");
        }

        if (keyword != null && !keyword.isEmpty()) {
            String pattern = "%" + keyword.toLowerCase() + "%";

            Predicate titleLike =
                    builder.like(
                            builder.lower(root.get("title")),
                            pattern
                    );

            Predicate authorLike =
                    builder.like(
                            builder.lower(root.get("author")),
                            pattern
                    );

            predicates.add(
                    builder.or(titleLike, authorLike)
            );
        }

        /*
         * 2. Category
         */
        Object categoryValue = params.get("categoryId");

        if (categoryValue != null) {
            try {
                Integer categoryId =
                        Integer.parseInt(categoryValue.toString());

                predicates.add(
                        builder.equal(
                                root.get("category").get("id"),
                                categoryId
                        )
                );
            } catch (NumberFormatException ignored) {
                // Ignore invalid categoryId
            }
        }

        /*
         * 3. Author
         */
        String author = getStringParam(params, "author");

        if (author != null && !author.isEmpty()) {
            predicates.add(
                    builder.like(
                            builder.lower(root.get("author")),
                            "%" + author.toLowerCase() + "%"
                    )
            );
        }

        /*
         * 4. Publish year
         */
        Object publishYearValue = params.get("publishYear");

        if (publishYearValue != null) {
            try {
                Integer publishYear =
                        Integer.parseInt(publishYearValue.toString());

                predicates.add(
                        builder.equal(
                                root.get("publishYear"),
                                publishYear
                        )
                );
            } catch (NumberFormatException ignored) {
                // Ignore invalid publish year
            }
        }

        /*
         * 5. Premium / free
         */
        Object isPremiumValue = params.get("isPremium");

        if (isPremiumValue != null) {
            String value = isPremiumValue.toString().trim();

            if (!value.isEmpty()) {
                predicates.add(
                        builder.equal(
                                root.get("isPremium"),
                                Boolean.parseBoolean(value)
                        )
                );
            }
        }

        return predicates;
    }

    @Override
    public Document getDocumentById(int id) {
        Session session = this.factory.getObject().getCurrentSession();

        return session.get(Document.class, id);
    }

    @Override
    public void saveOrUpdate(Document doc) {
        Session session = this.factory.getObject().getCurrentSession();

        if (doc.getId() != null && doc.getId() > 0) {
            session.merge(doc);
        } else {
            session.persist(doc);
        }
    }

    @Override
    public void deleteDocument(int id) {
        Session session = this.factory.getObject().getCurrentSession();

        Document doc = this.getDocumentById(id);

        if (doc != null) {
            doc.setIsActive(false);
            session.merge(doc);
        }
    }

    @Override
    public void restoreDocument(int id) {
        Session session = this.factory.getObject().getCurrentSession();

        Document doc = this.getDocumentById(id);

        if (doc != null) {
            doc.setIsActive(true);
            session.merge(doc);
        }
    }

    @Override
    public List<Document> searchDocuments(
            String keyword,
            String sortBy
    ) {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Document> query =
                builder.createQuery(Document.class);

        Root<Document> root = query.from(Document.class);

        List<Predicate> predicates = new ArrayList<>();

        predicates.add(
                builder.isTrue(root.get("isActive"))
        );

        if (keyword != null && !keyword.trim().isEmpty()) {
            String pattern =
                    "%" + keyword.trim().toLowerCase() + "%";

            Predicate titleLike =
                    builder.like(
                            builder.lower(root.get("title")),
                            pattern
                    );

            Predicate authorLike =
                    builder.like(
                            builder.lower(root.get("author")),
                            pattern
                    );

            predicates.add(
                    builder.or(titleLike, authorLike)
            );
        }

        query.where(
                predicates.toArray(new Predicate[0])
        );

        if ("popularity".equals(sortBy)) {
            query.orderBy(
                    builder.desc(root.get("borrowCount"))
            );
        } else if ("year".equals(sortBy)) {
            query.orderBy(
                    builder.desc(root.get("publishYear"))
            );
        } else if ("name".equals(sortBy)) {
            query.orderBy(
                    builder.asc(root.get("title"))
            );
        } else {
            query.orderBy(
                    builder.desc(root.get("createdAt"))
            );
        }

        return session.createQuery(query).getResultList();
    }

    private String getStringParam(
            Map<String, Object> params,
            String key
    ) {
        if (params == null || params.get(key) == null) {
            return null;
        }

        String value = params.get(key).toString().trim();

        return value.isEmpty() ? null : value;
    }

    private int getIntParam(
            Map<String, Object> params,
            String key,
            int defaultValue
    ) {
        if (params == null || params.get(key) == null) {
            return defaultValue;
        }

        try {
            return Math.max(
                    Integer.parseInt(params.get(key).toString()),
                    1
            );
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }
}
