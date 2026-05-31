import { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Card, Form, Badge, Table } from "react-bootstrap";
import { MyUserContext } from "../../configs/Contexts";
// import authApis from "../../configs/Apis"; // Mở comment khi ráp API thật
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import MySpinner from "../../components/MySpinner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatisticsDashboard = () => {
    const [user] = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);

    // --- BỘ LỌC THỜI GIAN CHO BIỂU ĐỒ TẦN SUẤT ---
    const [viewMode, setViewMode] = useState("MONTHS"); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // --- STATE HỨNG DỮ LIỆU ROI TỪ API THẬT ---
    const [roiData, setRoiData] = useState([]);

    useEffect(() => {
        const fetchRealStatistics = async () => {
            setLoading(true);
            try {
                // GỌI API THẬT CHO TÍNH NĂNG ROI (Chờ Backend viết xong API này)
                // let resRoi = await authApis().get('/api/stats/roi');
                // setRoiData(resRoi.data);

                // TẠM THỜI MOCK DATA (Xóa khi có API thật)
                await new Promise(resolve => setTimeout(resolve, 500));
                setRoiData([
                    { id: 1, documentName: "Cấu trúc dữ liệu nâng cao", capitalCost: 2000000, totalRevenue: 12500000, roiPercentage: 525 },
                    { id: 2, documentName: "Kinh tế vĩ mô 2026", capitalCost: 5000000, totalRevenue: 8200000, roiPercentage: 64 },
                    { id: 3, documentName: "Lịch sử Đảng (Slide Audio)", capitalCost: 1500000, totalRevenue: 300000, roiPercentage: -80 }
                ]);

            } catch (error) {
                console.error("Lỗi khi kéo dữ liệu thống kê từ Backend:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRealStatistics();
    }, [viewMode, selectedYear]);

    // Các hàm xử lý cấu hình nhãn trục X và tạo dữ liệu biểu đồ tần suất mượn đọc
    const getChartLabels = () => {
        if (viewMode === "YEARS") return ["Năm 2024", "Năm 2025", "Năm 2026"];
        if (viewMode === "QUARTERS") return ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];
        return ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    };

    const generateMockData = (type) => {
        const labelsCount = getChartLabels().length;
        const seed = parseInt(selectedYear) + (viewMode === "YEARS" ? 10 : 0);
        const multiplier = type === "traffic" ? 15 : type === "read" ? 3 : 1;
        return Array.from({ length: labelsCount }, (_, i) => Math.abs(Math.sin(i + seed) * 40 * multiplier + 10 * multiplier).toFixed(0));
    };

    const librarianBarData = {
        labels: getChartLabels(),
        datasets: [
            { label: 'Lượt truy cập Web', data: generateMockData("traffic"), backgroundColor: 'rgba(201, 203, 207, 0.4)', borderRadius: 4 },
            { label: 'Lượt đăng ký/Gia hạn gói', data: generateMockData("borrow"), backgroundColor: 'rgba(255, 193, 7, 0.8)', borderRadius: 4 },
            { label: 'Lượt truy cập học liệu Online', data: generateMockData("read"), backgroundColor: 'rgba(54, 162, 235, 0.8)', borderRadius: 4 }
        ]
    };

    const adminPieData = { labels: ['Công nghệ thông tin', 'Kinh tế học', 'Khoa học xã hội', 'Ngôn ngữ Anh'], datasets: [{ data: [45, 25, 20, 10], backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'], borderWidth: 1 }] };
    const adminRevenueData = { labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'], datasets: [{ label: `Doanh thu năm ${selectedYear} (VNĐ)`, data: [1500000, 2300000, 1800000, 3400000, 4200000, 3100000, 2900000, 4500000, 3800000, 4100000, 2000000, 5000000], backgroundColor: 'rgba(25, 135, 84, 0.8)', borderRadius: 4 }] };

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">
                {user?.role === "ADMIN" ? "📊 BÁO CÁO TỔNG QUAN & CHIẾN LƯỢC HỆ THỐNG" : "💼 BÁO CÁO MỨC ĐỘ SỬ DỤNG TÀI NGUYÊN"}
            </h2>

            {/* ==================================================== */}
            {/* KHU VỰC 1: CHỈ CÓ ADMIN MỚI THẤY (KPI, REVENUE, PIE, ROI) */}
            {/* ==================================================== */}
            {user?.role === "ADMIN" && (
                <>
                    {/* KPI TỔNG QUAN */}
                    <Row className="mb-4 g-3">
                        <Col md={3} sm={6}><Card className="bg-primary text-white text-center shadow-sm h-100 border-0"><Card.Body><h6 className="fw-bold opacity-75">TỔNG TÀI NGUYÊN SỐ</h6><h2 className="fw-bold mb-0">1,245</h2></Card.Body></Card></Col>
                        <Col md={3} sm={6}><Card className="bg-success text-white text-center shadow-sm h-100 border-0"><Card.Body><h6 className="fw-bold opacity-75">TỔNG DOANH THU</h6><h2 className="fw-bold mb-0">16.3M</h2></Card.Body></Card></Col>
                        <Col md={3} sm={6}><Card className="bg-warning text-dark text-center shadow-sm h-100 border-0"><Card.Body><h6 className="fw-bold opacity-75">LƯỢT GIA HẠN</h6><h2 className="fw-bold mb-0">8,402</h2></Card.Body></Card></Col>
                        <Col md={3} sm={6}><Card className="bg-danger text-white text-center shadow-sm h-100 border-0"><Card.Body><h6 className="fw-bold opacity-75">SỐ LƯỢNG TÀI KHOẢN</h6><h2 className="fw-bold mb-0">5,103</h2></Card.Body></Card></Col>
                    </Row>

                    {/* BIỂU ĐỒ DOANH THU VÀ PHÂN BỔ CHUYÊN NGÀNH */}
                    <Row className="g-4 mb-4">
                        <Col lg={8} md={12}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success">📈 Biểu đồ Doanh thu (12 Tháng)</span>
                                    <Form.Select size="sm" style={{ width: "120px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                        <option value="2025">Năm 2025</option><option value="2026">Năm 2026</option>
                                    </Form.Select>
                                </Card.Header>
                                <Card.Body><Bar data={adminRevenueData} options={{ responsive: true }} height={100} /></Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={12}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white fw-bold text-primary">🎯 Cơ cấu tài nguyên theo Ngành</Card.Header>
                                <Card.Body className="d-flex align-items-center justify-content-center"><div style={{ width: "90%" }}><Pie data={adminPieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div></Card.Body>
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
                                            {roiData.length === 0 ? (
                                                <tr><td colSpan="4" className="text-muted py-4">Chưa có dữ liệu giao dịch...</td></tr>
                                            ) : (
                                                roiData.map(item => (
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
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}

            {/* ==================================================== */}
            {/* KHU VỰC 2: CẢ ADMIN VÀ LIBRARIAN ĐỀU CÓ QUYỀN XEM     */}
            {/* ==================================================== */}
            {(user?.role === "LIBRARIAN" || user?.role === "ADMIN") && (
                <Row className="mt-4">
                    <Col xs={12}>
                        {/* Tiêu đề phân đoạn xuất hiện riêng khi tài khoản là Admin nhằm tăng tính tách bạch */}
                        {user?.role === "ADMIN" && (
                            <h5 className="text-primary fw-bold mt-2 mb-3 border-bottom pb-2">
                                📊 THỐNG KÊ VẬN HÀNH: TẦN SUẤT TRUY CẬP VÀ MƯỢN ĐỌC CHI TIẾT
                            </h5>
                        )}
                        
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-light p-3">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                        <span className="fw-bold text-secondary fs-6">Phân tích tần suất theo thời gian:</span>
                                        {viewMode === "YEARS" && <Badge bg="secondary" className="fs-6">Tổng quan các Năm</Badge>}
                                        {viewMode === "QUARTERS" && <Badge bg="primary" className="fs-6">Theo Quý (Năm {selectedYear})</Badge>}
                                        {viewMode === "MONTHS" && <Badge bg="success" className="fs-6">12 Tháng (Năm {selectedYear})</Badge>}
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <Form.Select size="sm" style={{ width: "160px" }} value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="border-primary fw-semibold">
                                            <option value="MONTHS">Xem theo Tháng</option>
                                            <option value="QUARTERS">Xem theo Quý</option>
                                            <option value="YEARS">Xem theo Năm</option>
                                        </Form.Select>
                                        {viewMode !== "YEARS" && (
                                            <Form.Select size="sm" style={{ width: "120px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                                <option value="2024">Năm 2024</option>
                                                <option value="2025">Năm 2025</option>
                                                <option value="2026">Năm 2026</option>
                                            </Form.Select>
                                        )}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Bar data={librarianBarData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={90} />
                                
                                <div className="mt-4 text-muted small text-start p-3 bg-light rounded border">
                                    <span className="fw-bold text-dark">💡 Quy chuẩn thuật ngữ đo lường:</span>
                                    <ul className="mb-0 mt-2">
                                        <li className="mb-1"><strong>Lượt truy cập Web:</strong> Số lần người dùng đăng nhập hệ thống.</li>
                                        <li className="mb-1"><strong>Lượt đăng ký gói:</strong> Số lượng yêu cầu gia hạn thời gian đọc được ghi nhận thành công.</li>
                                        <li><strong>Lượt truy cập học liệu Online:</strong> Số lần người dùng thực sự bấm nút mở file PDF/Video ra xem.</li>
                                    </ul>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default StatisticsDashboard;