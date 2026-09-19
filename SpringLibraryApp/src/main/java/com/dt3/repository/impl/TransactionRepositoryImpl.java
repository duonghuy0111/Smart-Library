package com.dt3.repository.impl;

import com.dt3.pojo.Transaction;
import com.dt3.repository.TransactionRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
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
public class TransactionRepositoryImpl implements TransactionRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public void saveTransaction(Transaction transaction) {
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(transaction);
    }

    @Override
    public boolean checkUserPaid(int userId, int documentId) {
        Session session = this.factory.getObject().getCurrentSession();

        String sql = "SELECT count(t) FROM Transaction t " +
                "WHERE t.user.id = :uId " +
                "AND t.document.id = :dId " +
                "AND t.status = 'SUCCESS'";

        Query<Long> query = session.createQuery(sql, Long.class);
        query.setParameter("uId", userId);
        query.setParameter("dId", documentId);

        Long count = query.getSingleResult();
        return count > 0;
    }

    @Override
    public BigDecimal getTotalRevenue() {
        Session session = this.factory.getObject().getCurrentSession();

        String hql = "SELECT SUM(t.amount) " +
                "FROM Transaction t " +
                "WHERE t.status = 'SUCCESS'";

        Query<BigDecimal> query =
                session.createQuery(hql, BigDecimal.class);

        BigDecimal total = query.getSingleResult();

        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getRevenueByMonthAndYear(int month, int year) {
        Session session = this.factory.getObject().getCurrentSession();

        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<BigDecimal> query =
                builder.createQuery(BigDecimal.class);

        Root<Transaction> root = query.from(Transaction.class);

        query.select(builder.sum(root.get("amount")));

        Predicate monthPredicate = builder.equal(
                builder.function(
                        "MONTH",
                        Integer.class,
                        root.get("transactionDate")
                ),
                month
        );

        Predicate yearPredicate = builder.equal(
                builder.function(
                        "YEAR",
                        Integer.class,
                        root.get("transactionDate")
                ),
                year
        );

        Predicate successPredicate = builder.equal(
                root.get("status"),
                "SUCCESS"
        );

        query.where(
                builder.and(
                        monthPredicate,
                        yearPredicate,
                        successPredicate
                )
        );

        BigDecimal total = session.createQuery(query).getSingleResult();

        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getRevenueByTime(Integer month, Integer year) {
        Session session = this.factory.getObject().getCurrentSession();

        String hql =
                "SELECT SUM(t.amount) " +
                "FROM Transaction t " +
                "WHERE t.status = 'SUCCESS' ";

        if (month != null) {
            hql += "AND MONTH(t.transactionDate) = :month ";
        }

        if (year != null) {
            hql += "AND YEAR(t.transactionDate) = :year ";
        }

        Query<BigDecimal> query =
                session.createQuery(hql, BigDecimal.class);

        if (month != null) {
            query.setParameter("month", month);
        }

        if (year != null) {
            query.setParameter("year", year);
        }

        BigDecimal result = query.uniqueResult();

        return result != null ? result : BigDecimal.ZERO;
    }
    @Override
public List<Transaction> getTransactions(Map<String, Object> params) {
    Session session = this.factory.getObject().getCurrentSession();

    String hql = "FROM Transaction t ";

    String status = null;

    if (params != null && params.get("status") != null) {
        status = params.get("status").toString().trim();
    }

    if (status != null && !status.isEmpty()) {
        hql += "WHERE t.status = :status ";
    }

    hql += "ORDER BY t.transactionDate DESC";

    Query<Transaction> query =
            session.createQuery(hql, Transaction.class);

    if (status != null && !status.isEmpty()) {
        query.setParameter("status", status);
    }

    int page = 1;
    int pageSize = 15;

    if (params != null) {
        try {
            if (params.get("page") != null) {
                page = Math.max(
                        Integer.parseInt(params.get("page").toString()),
                        1
                );
            }

            if (params.get("pageSize") != null) {
                pageSize = Math.max(
                        Integer.parseInt(params.get("pageSize").toString()),
                        1
                );
            }
        } catch (NumberFormatException ignored) {
        }
    }

    query.setFirstResult((page - 1) * pageSize);
    query.setMaxResults(pageSize);

    return query.getResultList();
}

    @Override
    public Long countTransactions(Map<String, Object> params) {
        Session session = this.factory.getObject().getCurrentSession();

        String hql = "SELECT COUNT(t.id) FROM Transaction t ";

        String status = null;

        if (params != null && params.get("status") != null) {
            status = params.get("status").toString().trim();
        }

        if (status != null && !status.isEmpty()) {
            hql += "WHERE t.status = :status";
        }

        Query<Long> query =
                session.createQuery(hql, Long.class);

        if (status != null && !status.isEmpty()) {
            query.setParameter("status", status);
        }

        Long count = query.uniqueResult();

        return count != null ? count : 0L;
    }
}   
