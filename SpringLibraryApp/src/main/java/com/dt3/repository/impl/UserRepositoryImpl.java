package com.dt3.repository.impl;

import com.dt3.pojo.User;
import com.dt3.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
@Transactional
public class UserRepositoryImpl implements UserRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public User getUserByUsername(String username) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);

        query.select(root);
        query.where(builder.equal(root.get("username"), username));

        Query<User> q = session.createQuery(query);

        try {
            return q.getSingleResult();
        } catch (Exception ex) {
            return null;
        }
    }

    @Override
    public User getUserById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(User.class, id);
    }

    @Override
    public void saveOrUpdate(User user) {
        Session session = this.factory.getObject().getCurrentSession();

        if (user.getId() != null && user.getId() > 0) {
            session.merge(user);
        } else {
            session.persist(user);
        }
    }

    @Override
    public List<User> getUsers(String role) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);

        query.select(root);

        if (role != null && !role.isEmpty()) {
            query.where(builder.equal(root.get("role"), role));
        }

        query.orderBy(builder.desc(root.get("createdAt")));

        return session.createQuery(query).getResultList();
    }

    @Override
    public Long countUsers(String role) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<User> root = query.from(User.class);

        query.select(builder.count(root.get("id")));

        if (role != null && !role.isEmpty()) {
            query.where(builder.equal(root.get("role"), role));
        }

        Long count = session.createQuery(query).getSingleResult();
        return count != null ? count : 0L;
    }

    @Override
    public List<User> getUsers(Map<String, Object> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);

        List<Predicate> predicates = buildPredicates(builder, root, params);

        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        query.orderBy(builder.desc(root.get("createdAt")));

        Query<User> resultQuery = session.createQuery(query);

        int page = getIntParam(params, "page", 1);
        int pageSize = getIntParam(params, "pageSize", 10);

        resultQuery.setFirstResult((page - 1) * pageSize);
        resultQuery.setMaxResults(pageSize);

        return resultQuery.getResultList();
    }

    @Override
    public Long countUsers(Map<String, Object> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<User> root = query.from(User.class);

        List<Predicate> predicates = buildPredicates(builder, root, params);

        query.select(builder.count(root.get("id")));

        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        Long count = session.createQuery(query).getSingleResult();
        return count != null ? count : 0L;
    }

    @Override
    public List<User> getRecentUsers(int limit) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);

        query.select(root);
        query.orderBy(builder.desc(root.get("createdAt")));

        Query<User> resultQuery = session.createQuery(query);
        resultQuery.setMaxResults(limit);

        return resultQuery.getResultList();
    }

    @Override
    public List<User> getPendingLibrarians() {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();

        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> root = query.from(User.class);

        query.select(root);

        Predicate librarianPredicate =
                builder.equal(root.get("role"), "ROLE_LIBRARIAN");

        Predicate pendingPredicate =
                builder.or(
                        builder.isNull(root.get("isApproved")),
                        builder.isFalse(root.get("isApproved"))
                );

        query.where(builder.and(librarianPredicate, pendingPredicate));
        query.orderBy(builder.asc(root.get("createdAt")));

        return session.createQuery(query).getResultList();
    }

    @Override
    public void deleteUser(int id) {
        Session session = this.factory.getObject().getCurrentSession();

        User user = session.get(User.class, id);

        if (user != null) {
            session.remove(user);
        }
    }

    private List<Predicate> buildPredicates(
            CriteriaBuilder builder,
            Root<User> root,
            Map<String, Object> params
    ) {
        List<Predicate> predicates = new ArrayList<>();

        if (params == null) {
            return predicates;
        }

        Object roleValue = params.get("role");

        if (roleValue != null) {
            String role = roleValue.toString().trim();

            if (!role.isEmpty()) {
                predicates.add(
                        builder.equal(root.get("role"), role)
                );
            }
        }

        Object keywordValue = params.get("keyword");

        if (keywordValue != null) {
            String keyword = keywordValue.toString().trim();

            if (!keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";

                predicates.add(
                        builder.or(
                                builder.like(
                                        builder.lower(root.get("username")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("fullName")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("email")),
                                        pattern
                                )
                        )
                );
            }
        }

        return predicates;
    }

    private int getIntParam(
            Map<String, Object> params,
            String key,
            int defaultValue
    ) {
        if (params == null || params.get(key) == null) {
            return defaultValue;
        }

        Object value = params.get(key);

        try {
            return Math.max(Integer.parseInt(value.toString()), 1);
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }
}