import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Image } from "react-bootstrap";
import { MyUserContext } from "../../configs/Contexts";
import { Navigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/vi';

const Profile = () => {
    const [user] = useContext(MyUserContext);
    const [borrowHistory, setBorrowHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadBorrowHistory = async () => {
        try {
            setLoading(true);
            
            // === MOCK DATA: Giả lập lịch sử mượn tài liệu ===
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockHistory = [
                {
                    id: 101,
                    documentName: "Giáo trình Lập trình Java",
                    borrowDate: moment().subtract(5, 'days').toISOString(),
                    dueDate: moment().add(2, 'days').toISOString(),
                    status: "BORROWING", // Đang mượn
                    fee: 0
                },
                {
                    id: 102,
                    documentName: "Phát triển Web với React",
                    borrowDate: moment().subtract(15, 'days').toISOString(),
                    dueDate: moment().subtract(1, 'days').toISOString(),
                    status: "OVERDUE", // Quá hạn
                    fee: 100000
                },
                {
                    id: 103,
                    documentName: "Cấu trúc dữ liệu và Giải thuật",
                    borrowDate: moment().subtract(30, 'days').toISOString(),
                    dueDate: moment().subtract(23, 'days').toISOString(),
                    status: "RETURNED", // Đã trả
                    fee: 50000
                }
            ];
            
            setBorrowHistory(mockHistory);
            // === KẾT THÚC MOCK DATA ===

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadBorrowHistory();
        }
    }, [user]);

    // Nếu chưa đăng nhập thì đá về trang chủ hoặc trang login
    if (user === null) {
        return <Navigate to="/login?next=/profile" />;
    }

    const renderStatusBadge = (status) => {
        switch(status) {
            case "BORROWING": return <Badge bg="primary">Đang mượn</Badge>;
            case "RETURNED": return <Badge bg="success">Đã trả</Badge>;
            case "OVERDUE": return <Badge bg="danger">Quá hạn</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-success mb-4 border-bottom pb-2">HỒ SƠ CÁ NHÂN</h2>
            
            <Row>
                {/* CỘT TRÁI: THÔNG TIN USER */}
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm text-center p-3 border-0">
                        <Card.Body>
                            <Image 
                                src={user.avatar || "https://placehold.co/150x150?text=Avatar"} 
                                roundedCircle 
                                width={120} 
                                height={120} 
                                className="mb-3 border shadow-sm" 
                                style={{objectFit: "cover"}}
                            />
                            <Card.Title className="text-primary fw-bold fs-4">{user.username}</Card.Title>
                            <Card.Text className="text-muted mb-2">
                                Vai trò: <Badge bg="info" className="text-uppercase">{user.role}</Badge>
                            </Card.Text>
                            <Button variant="outline-primary" size="sm" className="mt-2 w-100">
                                Chỉnh sửa hồ sơ
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT PHẢI: LỊCH SỬ MƯỢN TÀI LIỆU */}
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 text-secondary fw-bold">Lịch sử mượn tài liệu</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã phiếu</th>
                                        <th>Tên tài liệu</th>
                                        <th>Ngày mượn</th>
                                        <th>Hạn trả</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center p-4">Đang tải dữ liệu...</td></tr>
                                    ) : borrowHistory.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center p-4 text-muted">Bạn chưa mượn tài liệu nào.</td></tr>
                                    ) : (
                                        borrowHistory.map(item => (
                                            <tr key={item.id}>
                                                <td className="fw-bold">#{item.id}</td>
                                                <td className="text-primary fw-semibold">{item.documentName}</td>
                                                <td>{moment(item.borrowDate).format('DD/MM/YYYY')}</td>
                                                <td>
                                                    <span className={item.status === "OVERDUE" ? "text-danger fw-bold" : ""}>
                                                        {moment(item.dueDate).format('DD/MM/YYYY')}
                                                    </span>
                                                </td>
                                                <td>{renderStatusBadge(item.status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;