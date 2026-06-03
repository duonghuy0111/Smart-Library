import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Badge, Table } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import MySpinner from "../../components/MySpinner";
import UsageStatsChart from "../../components/UsageStatsChart"; 
// 👉 ĐÃ SỬA: Import đúng chuẩn authApis (kèm dấu ngoặc nhọn {})
import { authApis, endpoints } from "../../configs/Apis";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    
    // --- STATE DỮ LIỆU THẬT (TỪ API) ---
    const [kpiData, setKpiData] = useState({ totalDocuments: 0, totalUsers: 0, totalBorrows: 0, totalRevenue: 0 });
    const [revenueData, setRevenueData] = useState(new Array(12).fill(0));
    const [pieLabels, setPieLabels] = useState([]);
    const [pieDataValues, setPieDataValues] = useState([]);

    // --- STATE DỮ LIỆU GIẢ (BẢNG ROI) ---
    const [roiData, setRoiData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // 1. GỌI API THẬT CHO 4 CHỈ SỐ KPI
                let resKpi = await authApis().get(endpoints['stats-kpis']);
                if(resKpi.data) setKpiData(resKpi.data);

                // 2. GỌI API THẬT CHO BIỂU ĐỒ DOANH THU (CỘT)
                let resRev = await authApis().get(endpoints['stats-revenue'](selectedYear));
                let monthlyRevenue = new Array(12).fill(0);
                if(resRev.data) {
                    resRev.data.forEach(item => {
                        let monthIndex = item[0] - 1; // Backend trả về tháng 1-12, mảng Index từ 0-11
                        monthlyRevenue[monthIndex] = item[1]; 
                    });
                }
                setRevenueData(monthlyRevenue);

                // 3. GỌI API THẬT CHO BIỂU ĐỒ TRÒN (CƠ CẤU NGÀNH)
                let resCat = await authApis().get(endpoints['stats-category']);
                let labels = [], counts = [];
                if(resCat.data) {
                    resCat.data.forEach(item => {
                        labels.push(item[0]); // Tên ngành
                        counts.push(item[1]); // Số lượng sách
                    });
                }
                setPieLabels(labels);
                setPieDataValues(counts);

                // 4. GỌI API THẬT CHO BẢNG ROI
                // 👉 ĐÃ SỬA: Gọi API thật cho bảng phân tích ROI
                let resRoi = await authApis().get(endpoints['stats-roi']);
                if (resRoi.data) {
                    // Sắp xếp ROI từ cao xuống thấp để thấy sách lãi nhất nằm trên cùng
                    let sortedRoi = resRoi.data.sort((a, b) => b.roiPercentage - a.roiPercentage);
                    setRoiData(sortedRoi);
                }                

            } catch (error) {
                console.error("Lỗi khi kéo dữ liệu thống kê từ Backend:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedYear]);

    // RÁP DỮ LIỆU VÀO CHART.JS
    const adminPieData = { 
        labels: pieLabels.length > 0 ? pieLabels : ['Chưa có dữ liệu'], 
        datasets: [{ 
            data: pieDataValues.length > 0 ? pieDataValues : [1], 
            backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'], 
            borderWidth: 1 
        }] 
    };

    const adminRevenueData = { 
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'], 
        datasets: [{ 
            label: `Doanh thu năm ${selectedYear} (VNĐ)`, 
            data: revenueData, 
            backgroundColor: 'rgba(25, 135, 84, 0.8)', 
            borderRadius: 4 
        }] 
    };

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">📊 BÁO CÁO TỔNG QUAN & CHIẾN LƯỢC HỆ THỐNG</h2>

            {/* KPI TỔNG QUAN */}
            <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                    <Card className="bg-primary text-white text-center shadow-sm h-100 border-0">
                        <Card.Body>
                            <h6 className="fw-bold opacity-75">TỔNG TÀI NGUYÊN SỐ</h6>
                            <h2 className="fw-bold mb-0">{kpiData.totalDocuments}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="bg-success text-white text-center shadow-sm h-100 border-0">
                        <Card.Body>
                            <h6 className="fw-bold opacity-75">TỔNG DOANH THU</h6>
                            <h2 className="fw-bold mb-0">{kpiData.totalRevenue.toLocaleString()} đ</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="bg-warning text-dark text-center shadow-sm h-100 border-0">
                        <Card.Body>
                            <h6 className="fw-bold opacity-75">LƯỢT GIA HẠN</h6>
                            <h2 className="fw-bold mb-0">{kpiData.totalBorrows}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="bg-danger text-white text-center shadow-sm h-100 border-0">
                        <Card.Body>
                            <h6 className="fw-bold opacity-75">SỐ LƯỢNG TÀI KHOẢN</h6>
                            <h2 className="fw-bold mb-0">{kpiData.totalUsers}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* BIỂU ĐỒ TÀI CHÍNH VÀ CƠ CẤU */}
            <Row className="g-4 mb-4">
                <Col lg={8} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-success">📈 Biểu đồ Doanh thu (12 Tháng)</span>
                            <Form.Select size="sm" style={{ width: "120px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="2024">Năm 2024</option>
                                <option value="2025">Năm 2025</option>
                                <option value="2026">Năm 2026</option>
                            </Form.Select>
                        </Card.Header>
                        <Card.Body><Bar data={adminRevenueData} options={{ responsive: true }} height={100} /></Card.Body>
                    </Card>
                </Col>
                <Col lg={4} md={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold text-primary">🎯 Cơ cấu tài nguyên theo Ngành</Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div style={{ width: "90%" }}>
                                <Pie data={adminPieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* BẢNG PHÂN TÍCH ROI */}
            <h5 className="text-danger fw-bold mt-5 mb-3 border-bottom pb-2">🎯 CHIẾN LƯỢC: HIỆU SUẤT ĐẦU TƯ TÀI NGUYÊN SỐ (ROI)</h5>
            <Row className="mb-5">
                <Col xs={12}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="p-0">
                            <Table striped hover responsive className="mb-0 text-center align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start px-4">Tên Tài liệu Bản quyền</th>
                                        <th>Vốn Mua Ban Đầu</th>
                                        <th>Doanh thu Thu về</th>
                                        <th>Chỉ số ROI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roiData.map(item => (
                                        <tr key={item.id}>
                                            <td className="text-start fw-semibold text-primary px-4">{item.documentName}</td>
                                            <td>{item.capitalCost.toLocaleString()} đ</td>
                                            <td className="fw-bold text-success">{item.totalRevenue.toLocaleString()} đ</td>
                                            <td>
                                                <Badge bg={item.roiPercentage > 0 ? "success" : "danger"} className="fs-6 px-3 py-1">
                                                    {item.roiPercentage > 0 ? "+" : ""}{item.roiPercentage}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* THỐNG KÊ VẬN HÀNH DÀNH CHO ADMIN GIÁM SÁT THÊM */}
            <h5 className="text-primary fw-bold mt-5 mb-3 border-bottom pb-2">📊 THỐNG KÊ VẬN HÀNH: TẦN SUẤT TRUY CẬP VÀ MƯỢN ĐỌC CHI TIẾT</h5>
            <UsageStatsChart />
        </Container>
    );
};

export default AdminDashboard;