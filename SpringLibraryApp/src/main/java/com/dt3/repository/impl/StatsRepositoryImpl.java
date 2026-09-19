package com.dt3.repository.impl;

import com.dt3.dto.KpiDTO;
import com.dt3.repository.StatsRepository;
import java.math.BigDecimal;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class StatsRepositoryImpl implements StatsRepository {

    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public KpiDTO getGeneralKPIs() {
        Session session = this.factory.getObject().getCurrentSession();
        KpiDTO kpi = new KpiDTO();

        try {
            // 1. Đếm tổng số Học liệu
            Query<Long> qDocs = session.createQuery("SELECT COUNT(d.id) FROM Document d", Long.class);
            kpi.setTotalDocuments(qDocs.uniqueResult());

            // 2. Đếm tổng số User
            Query<Long> qUsers = session.createQuery("SELECT COUNT(u.id) FROM User u", Long.class);
            kpi.setTotalUsers(qUsers.uniqueResult());

            // 3. Đếm tổng lượt gia hạn (dựa trên chi tiết phiếu mượn)
            Query<Long> qBorrows = session.createQuery("SELECT COUNT(bd.id) FROM BorrowDetail bd", Long.class);
            kpi.setTotalBorrows(qBorrows.uniqueResult());

            // 4. Tính tổng doanh thu (Cộng tổng giá tiền của các học liệu đã được mượn)
            Query<BigDecimal> qRevenue = session.createQuery(
                "SELECT SUM(d.price) FROM BorrowDetail bd JOIN bd.document d", BigDecimal.class);
            BigDecimal revenue = qRevenue.uniqueResult();
            kpi.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return kpi;
    }
    // 1. Thống kê số lượng học liệu theo danh mục (Cho biểu đồ tròn)
    @Override
    public List<Object[]> getDocumentCountByCategory() {
        Session session = this.factory.getObject().getCurrentSession();
        // Dùng LEFT JOIN để lấy cả những danh mục chưa có sách nào (số lượng = 0)
        String hql = "SELECT c.name, COUNT(d.id) " +
                     "FROM Category c LEFT JOIN Document d ON c.id = d.category.id " +
                     "GROUP BY c.id, c.name";
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        return query.getResultList();
    }

    // 2. Thống kê doanh thu 12 tháng theo năm (Cho biểu đồ cột)
    @Override
    public List<Object[]> getRevenueByYear(int year) {
        Session session = this.factory.getObject().getCurrentSession();
        // Nhóm doanh thu theo Tháng của ngày lập Phiếu mượn
        String hql = "SELECT MONTH(b.createdDate), SUM(d.price) " +
                     "FROM BorrowDetail bd " +
                     "JOIN bd.borrow b " +
                     "JOIN bd.document d " +
                     "WHERE YEAR(b.createdDate) = :year " +
                     "GROUP BY MONTH(b.createdDate) " +
                     "ORDER BY MONTH(b.createdDate)";
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        query.setParameter("year", year);
        return query.getResultList();
    }
    @Override
    public List<com.dt3.dto.RoiDTO> getDocumentROI() {
        Session session = this.factory.getObject().getCurrentSession();
        List<com.dt3.dto.RoiDTO> result = new java.util.ArrayList<>();
        try {
            // Lấy danh sách các tài liệu có thu phí (price > 0)
            String hql = "SELECT d.id, d.title, d.capitalCost, " +
                         "(SELECT SUM(bd.document.price) FROM BorrowDetail bd WHERE bd.document.id = d.id) " +
                         "FROM Document d WHERE d.price > 0";
            Query<Object[]> query = session.createQuery(hql, Object[].class);
            List<Object[]> rows = query.getResultList();

            for (Object[] row : rows) {
                com.dt3.dto.RoiDTO dto = new com.dt3.dto.RoiDTO();
                dto.setId((Integer) row[0]);
                dto.setDocumentName((String) row[1]);

                BigDecimal capital = (BigDecimal) row[2];
                if (capital == null) capital = BigDecimal.ZERO;
                dto.setCapitalCost(capital);

                BigDecimal revenue = (BigDecimal) row[3];
                if (revenue == null) revenue = BigDecimal.ZERO;
                dto.setTotalRevenue(revenue);

                // Công thức tính ROI = (Doanh thu - Vốn) / Vốn * 100
                if (capital.compareTo(BigDecimal.ZERO) > 0) {
                    double roi = revenue.subtract(capital).doubleValue() / capital.doubleValue() * 100;
                    dto.setRoiPercentage(Math.round(roi * 10.0) / 10.0); // Làm tròn 1 chữ số thập phân
                } else {
                    dto.setRoiPercentage(revenue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0);
                }
                result.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
    @Override
    public List<Object[]> getBorrowFrequency(String viewMode, int year) {
        Session session = this.factory.getObject().getCurrentSession();
        String hql = "";
        try {
            if ("YEARS".equals(viewMode)) {
                hql = "SELECT YEAR(b.createdDate), COUNT(bd.id) FROM BorrowDetail bd JOIN bd.borrow b GROUP BY YEAR(b.createdDate)";
                Query<Object[]> query = session.createQuery(hql, Object[].class);
                return query.getResultList();
            } else {
                // Mặc định lấy theo tháng
                hql = "SELECT MONTH(b.createdDate), COUNT(bd.id) FROM BorrowDetail bd JOIN bd.borrow b WHERE YEAR(b.createdDate) = :year GROUP BY MONTH(b.createdDate)";
                Query<Object[]> query = session.createQuery(hql, Object[].class);
                query.setParameter("year", year);
                return query.getResultList();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
}