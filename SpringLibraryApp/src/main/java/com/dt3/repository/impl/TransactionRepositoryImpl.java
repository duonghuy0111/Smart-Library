package com.dt3.repository.impl;

import com.dt3.pojo.Transaction;
import com.dt3.repository.TransactionRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
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
        String sql = "SELECT count(t) FROM Transaction t WHERE t.user.id = :uId AND t.document.id = :dId AND t.status = 'SUCCESS'";
        Query query = session.createQuery(sql, Long.class);
        query.setParameter("uId", userId);
        query.setParameter("dId", documentId);

        Long count = (Long) query.getSingleResult();
        return count > 0;
    }

    @Override
    public BigDecimal getTotalRevenue() {
        Session session = this.factory.getObject().getCurrentSession();
        String hql = "SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'";
        org.hibernate.query.Query<BigDecimal> query = session.createQuery(hql, BigDecimal.class);
        BigDecimal total = query.getSingleResult();
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getRevenueByMonthAndYear(int month, int year) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<BigDecimal> q = b.createQuery(BigDecimal.class);
        Root<Transaction> root = q.from(Transaction.class);

        q.select(b.sum(root.get("amount")));

        Predicate pMonth = b.equal(b.function("MONTH", Integer.class, root.get("transactionDate")), month);
        Predicate pYear = b.equal(b.function("YEAR", Integer.class, root.get("transactionDate")), year);
        Predicate pSuccess = b.equal(root.get("status"), "SUCCESS");

        q.where(b.and(pMonth, pYear, pSuccess));

        BigDecimal total = session.createQuery(q).getSingleResult();
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getRevenueByTime(Integer month, Integer year) {
        Session session = this.factory.getObject().getCurrentSession();
        // Đổi 'createdAt' thành 'transactionDate' cho khớp với POJO Transaction của em
        // Thêm điều kiện status = 'SUCCESS' để tính đúng doanh thu thực tế
        String hql = "SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' ";

        if (month != null) {
            hql += " AND MONTH(t.transactionDate) = :month ";
        }
        if (year != null) {
            hql += " AND YEAR(t.transactionDate) = :year ";
        }

        Query<BigDecimal> query = session.createQuery(hql, BigDecimal.class);
        if (month != null) {
            query.setParameter("month", month);
        }
        if (year != null) {
            query.setParameter("year", year);
        }

        BigDecimal res = query.uniqueResult();
        return res != null ? res : BigDecimal.ZERO;
    }
}
