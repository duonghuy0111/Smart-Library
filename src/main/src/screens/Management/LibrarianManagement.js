import { useState, useEffect } from "react";
import { Table, Badge, Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import { toast } from 'react-toastify';

// Import thư viện vẽ biểu đồ
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LibrarianManagement = () => {
    const [borrowList, setBorrowList] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- STATE CHO MODAL GIA HẠN ---
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [extendOption, setExtendOption] = useState("7"); // 7, 14, 30 hoặc 'custom'
    const [customDate, setCustomDate] = useState("");
    const [reason, setReason] = useState("");

    const chartData = {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            {
                label: 'Số lượt truy cập học liệu',
                data: [150, 230, 180, 290, 420, 310], 
                backgroundColor: 'rgba(25, 135, 84, 0.7)', 
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'THỐNG KÊ LƯỢT TRUY CẬP THEO THÁNG NĂM 2026', font: { size: 16 } },
        },
        scales: { y: { beginAtZero: true } }
    };

    useEffect(() => {
        const loadBorrowData = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            setBorrowList([
                { id: 1, studentName: "Nguyễn Văn A", documentName: "Giáo trình Lập trình Java", borrowDate: "2026-05-20", expiryDate: "2026-05-27", status: "ACTIVE" },
                { id: 2, studentName: "Trần Thị B", documentName: "Cấu trúc dữ liệu và Giải thuật", borrowDate: "2026-05-15", expiryDate: "2026-05-22", status: "EXPIRED" },
                { id: 3, studentName: "Lê Hoàng C", documentName: "Nhập môn Kinh tế học", borrowDate: "2026-05-24", expiryDate: "2026-05-31", status: "ACTIVE" },
                { id: 4, studentName: "Phạm D", documentName: "Tài liệu chuyên ngành IT (Mua đứt)", borrowDate: "2026-05-25", expiryDate: "Không thời hạn", status: "ACTIVE" }
            ]);
            setLoading(false);
        };
        loadBorrowData();
    }, []);

    // --- MỞ MODAL GIA HẠN ---
    const handleOpenExtend = (id) => {
        const item = borrowList.find(b => b.id === id);
        if (item.expiryDate === "Không thời hạn") {
            toast.info("Học liệu này đã được mua đứt, không cần gia hạn!");
            return;
        }
        setSelectedId(id);
        setExtendOption("7");
        setCustomDate("");
        setReason("");
        setShowExtendModal(true);
    };

    // --- XỬ LÝ LƯU GIA HẠN ---
    const processExtend = () => {
        if (extendOption === "custom" && !customDate) {
            toast.error("Vui lòng chọn mốc thời gian gia hạn chính xác!");
            return;
        }

        setBorrowList(prev => prev.map(item => {
            if (item.id === selectedId) {
                let newExpDate;
                
                if (extendOption === "custom") {
                    newExpDate = customDate;
                } else {
                    let currentExp = new Date(item.expiryDate);
                    // Nếu đã hết hạn trong quá khứ thì tính mốc cộng thêm từ ngày hôm nay
                    if (currentExp < new Date()) {
                        currentExp = new Date();
                    }
                    currentExp.setDate(currentExp.getDate() + parseInt(extendOption));
                    newExpDate = currentExp.toISOString().split('T')[0];
                }

                return { ...item, expiryDate: newExpDate, status: 'ACTIVE' };
            }
            return item;
        }));

        toast.success("Gia hạn quyền truy cập thành công!");
        setShowExtendModal(false);
    };

    // --- LOGIC XỬ LÝ THU HỒI TÀI LIỆU ---
    const handleRevoke = (id, studentName) => {
        if (window.confirm(`Bạn có chắc chắn muốn thu hồi quyền truy cập học liệu của sinh viên ${studentName}?`)) {
            setBorrowList(prev => prev.map(item => 
                item.id === id ? { ...item, status: 'EXPIRED' } : item
            ));
            toast.warning(`Đã thu hồi quyền truy cập của ${studentName}!`);
        }
    };

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    const selectedStudent = borrowList.find(b => b.id === selectedId);

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">💼 QUẢN LÝ LƯỢT TRUY CẬP HỌC LIỆU</h2>
            
            {/* KHU VỰC HIỂN THỊ BIỂU ĐỒ */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Bar data={chartData} options={chartOptions} height={80} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* KHU VỰC HIỂN THỊ BẢNG DỮ LIỆU */}
            <Row>
                <Col>
                    <Card className="shadow-sm border-0 overflow-hidden">
                        <Table striped hover responsive className="mb-0 bg-white">
                            <thead className="table-success">
                                <tr>
                                    <th className="text-center" style={{ width: "5%" }}>STT</th>
                                    <th style={{ width: "18%" }}>Tên Sinh viên</th>
                                    <th style={{ width: "25%" }}>Học liệu truy cập</th>
                                    <th style={{ width: "12%" }}>Ngày mượn</th>
                                    <th style={{ width: "12%" }}>Hạn truy cập</th>
                                    <th className="text-center" style={{ width: "12%" }}>Trạng thái</th>
                                    <th className="text-center" style={{ width: "16%" }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {borrowList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">Chưa có dữ liệu.</td>
                                    </tr>
                                ) : (
                                    borrowList.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="text-center align-middle">{index + 1}</td>
                                            <td className="fw-bold text-primary align-middle">{item.studentName}</td>
                                            <td className="align-middle">{item.documentName}</td>
                                            <td className="align-middle">{item.borrowDate}</td>
                                            <td className="align-middle fw-semibold text-danger">{item.expiryDate}</td>
                                            <td className="text-center align-middle">
                                                {item.status === 'ACTIVE' 
                                                    ? <Badge bg="success" className="p-2 w-100">Đang truy cập</Badge> 
                                                    : <Badge bg="secondary" className="p-2 w-100">Đã hết hạn</Badge>}
                                            </td>
                                            <td className="text-center align-middle">
                                                {item.status === 'ACTIVE' && item.expiryDate !== "Không thời hạn" && (
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        className="fw-bold w-100 mb-1" 
                                                        onClick={() => handleRevoke(item.id, item.studentName)}
                                                    >
                                                        Thu hồi
                                                    </Button>
                                                )}
                                                {item.expiryDate !== "Không thời hạn" && (
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        className="fw-bold w-100" 
                                                        onClick={() => handleOpenExtend(item.id)}
                                                    >
                                                        Gia hạn truy cập
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            {/* MODAL GIA HẠN TRUY CẬP LÝ TƯỞNG */}
            <Modal show={showExtendModal} onHide={() => setShowExtendModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold">⏳ Gia hạn quyền truy cập</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent && (
                        <div className="mb-3 text-muted">
                            Đang gia hạn học liệu: <span className="fw-bold text-dark">{selectedStudent.documentName}</span> <br/>
                            Cho sinh viên: <span className="fw-bold text-primary">{selectedStudent.studentName}</span>
                        </div>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Chọn mốc thời gian gia hạn:</Form.Label>
                        <Form.Select value={extendOption} onChange={(e) => setExtendOption(e.target.value)}>
                            <option value="7">Cộng thêm 1 tuần (+7 ngày)</option>
                            <option value="14">Cộng thêm 2 tuần (+14 ngày)</option>
                            <option value="30">Cộng thêm 1 tháng (+30 ngày)</option>
                            <option value="custom">Tùy chọn ngày chính xác...</option>
                        </Form.Select>
                    </Form.Group>

                    {extendOption === "custom" && (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-danger">Ngày hết hạn mới:</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={customDate} 
                                onChange={(e) => setCustomDate(e.target.value)} 
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Lý do gia hạn (Ghi chú):</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={2} 
                            placeholder="Ví dụ: Sinh viên đang làm đồ án..." 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExtendModal(false)}>
                        Hủy bỏ
                    </Button>
                    <Button variant="primary" className="fw-bold" onClick={processExtend}>
                        Xác nhận gia hạn
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default LibrarianManagement;