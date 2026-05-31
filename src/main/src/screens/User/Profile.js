import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Image } from "react-bootstrap";
import { MyUserContext } from "../../configs/Contexts";
import { Navigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/vi';
import Apis, { authApis, endpoints } from "../../configs/Apis";
const Profile = () => {
    const [user] = useContext(MyUserContext);
    const [borrowHistory, setBorrowHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadBorrowHistory = async () => {
        try {
            setLoading(true);
            
            // 👉 Gọi API thật từ Spring Boot
            let res = await authApis().get(endpoints['my-history']);
            setBorrowHistory(res.data);
            
        } catch (ex) {
            console.error(ex);
            alert("Lỗi khi tải lịch sử mượn sách!");
        } finally {
            setLoading(false);
        }
    }

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
                                                <td className="text-primary fw-semibold">{item.document.name}</td>
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