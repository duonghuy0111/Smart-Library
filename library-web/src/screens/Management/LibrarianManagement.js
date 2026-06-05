import { useState, useEffect } from "react";
import { Table, Badge, Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import { toast } from 'react-toastify';
import moment from "moment";
import { authApis, endpoints } from "../../configs/Apis";

// 👉 THÊM: Import Chart thật và Phân trang
import MyPagination from "../../components/MyPagination";
import UsageStatsChart from "../../components/UsageStatsChart"; 

const LibrarianManagement = () => {
    const [borrowList, setBorrowList] = useState([]);
    const [loading, setLoading] = useState(false);

    // STATE CHO PHÂN TRANG
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // STATE CHO MODAL GIA HẠN
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [extendOption, setExtendOption] = useState("7"); 
    const [customDate, setCustomDate] = useState("");
    const [reason, setReason] = useState("");

    const loadAllBorrows = async () => {
        try {
            setLoading(true);
            let res = await authApis().get(`${endpoints['all-borrows']}?page=${page}`);
            
            let data = res.data.content || res.data;
            setTotalPages(res.data.totalPages || 1);

            let flatList = [];
            data.forEach(borrow => {
                borrow.borrowDetails?.forEach(detail => {
                    flatList.push({
                        detailId: detail.id,
                        borrowId: borrow.id,
                        user: borrow.user.username,
                        documentName: detail.document?.name || detail.document?.title,
                        borrowDate: borrow.createdDate,
                        dueDate: detail.dueDate
                    });
                });
            });
            
            flatList.sort((a, b) => b.detailId - a.detailId);
            setBorrowList(flatList);

        } catch (error) {
            toast.error("Lỗi khi tải danh sách phiếu mượn!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAllBorrows(); }, [page]);

    // --- LOGIC GIA HẠN & THU HỒI ---
    const handleExtendClick = (detailId) => {
        setSelectedDetailId(detailId);
        setExtendOption("7");
        setCustomDate("");
        setReason("");
        setShowExtendModal(true);
    };

    const processExtend = async () => {
        // 👉 ĐÃ THÊM: Chặn logic chọn ngày trong quá khứ
        if (extendOption === 'custom') {
            if (!customDate) {
                toast.warning("Vui lòng chọn ngày hết hạn mới!"); 
                return;
            }
            if (new Date(customDate) <= new Date()) {
                toast.error("Ngày gia hạn phải lớn hơn ngày hiện tại!"); 
                return;
            }
        }

        let newExpiryDate = new Date();
        if (extendOption === 'custom') {
            newExpiryDate = new Date(customDate);
        } else {
            newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(extendOption));
        }

        try {
            await authApis().post(endpoints['extend-borrow'](selectedDetailId), {
                newDueDate: newExpiryDate.toISOString(),
                reason: reason
            });
            toast.success("Xử lý gia hạn thành công!");
            setShowExtendModal(false);
            loadAllBorrows(); 
        } catch (ex) {
            toast.error("Xử lý gia hạn thất bại!");
        }
    };

    const handleRevoke = async (detailId) => {
        if (window.confirm("Bạn có chắc chắn muốn THU HỒI quyền truy cập học liệu này của độc giả không?")) {
            try {
                await authApis().delete(endpoints['revoke-borrow'](detailId));
                toast.success("Đã thu hồi quyền truy cập thành công!");
                loadAllBorrows(); 
            } catch (ex) {
                toast.error("Lỗi khi thu hồi! Vui lòng thử lại.");
            }
        }
    };

    const renderStatusBadge = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        if (due.getFullYear() > 2090) return <Badge bg="success">Sở hữu vĩnh viễn</Badge>;
        if (today > due) return <Badge bg="danger">Quá hạn</Badge>;
        return <Badge bg="primary">Đang mượn</Badge>;
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">🧑‍🏫 BẢNG ĐIỀU KHIỂN THỦ THƯ</h2>

            {/* 👉 ĐÃ SỬA: Thay thế Biểu đồ Mock bằng Component Dữ liệu thật */}
            <Row className="mb-5">
                <Col md={12}>
                    <UsageStatsChart />
                </Col>
            </Row>

            <h4 className="text-secondary fw-bold mb-3">📋 Danh sách Phiếu mượn cần quản lý</h4>
            {loading ? <div className="text-center mt-5"><MySpinner /></div> : (
                <>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            <Table responsive hover striped className="mb-0 align-middle">
                                <thead className="table-success text-center">
                                    <tr>
                                        <th>Mã Phiếu</th>
                                        <th className="text-start">Độc giả</th>
                                        <th className="text-start">Học liệu đã mượn</th>
                                        <th>Ngày mượn</th>
                                        <th>Hạn trả</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowList.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-4">Chưa có giao dịch mượn sách nào.</td></tr>
                                    ) : (
                                        borrowList.map((item) => (
                                            <tr key={item.detailId} className="text-center">
                                                <td className="fw-bold text-secondary">#{item.borrowId}</td>
                                                <td className="text-start fw-bold">{item.user}</td>
                                                <td className="text-start text-primary fw-semibold">{item.documentName}</td>
                                                <td>{moment(item.borrowDate).format('DD/MM/YYYY')}</td>
                                                <td className="fw-bold text-danger">
                                                    {new Date(item.dueDate).getFullYear() > 2090 ? "Vĩnh viễn" : moment(item.dueDate).format('DD/MM/YYYY')}
                                                </td>
                                                <td>{renderStatusBadge(item.dueDate)}</td>
                                                <td className="text-nowrap">
                                                    <Button variant="outline-primary" size="sm" className="fw-bold me-2" onClick={() => handleExtendClick(item.detailId)}>
                                                        ⏳ Gia hạn
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => handleRevoke(item.detailId)}>
                                                        🚫 Thu hồi
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <MyPagination 
                        currentPage={page} 
                        totalPages={totalPages} 
                        onPageChange={setPage} 
                    />
                </>
            )}

            <Modal show={showExtendModal} onHide={() => setShowExtendModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold">⏳ Xử lý gia hạn tài liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tùy chọn thời gian gia hạn (Tính từ hôm nay):</Form.Label>
                        <Form.Select value={extendOption} onChange={(e) => setExtendOption(e.target.value)}>
                            <option value="7">Gia hạn thêm 1 tuần (+7 ngày)</option>
                            <option value="14">Gia hạn thêm 2 tuần (+14 ngày)</option>
                            <option value="30">Gia hạn thêm 1 tháng (+30 ngày)</option>
                            <option value="custom">Tùy chỉnh ngày cụ thể...</option>
                        </Form.Select>
                    </Form.Group>

                    {extendOption === 'custom' && (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-danger">Ngày hết hạn mới:</Form.Label>
                            <Form.Control type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Lý do gia hạn (Ghi chú):</Form.Label>
                        <Form.Control as="textarea" rows={2} placeholder="Ví dụ: Sinh viên đang làm đồ án..." value={reason} onChange={(e) => setReason(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExtendModal(false)}>Hủy bỏ</Button>
                    <Button variant="primary" className="fw-bold" onClick={processExtend}>Xác nhận gia hạn</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default LibrarianManagement;