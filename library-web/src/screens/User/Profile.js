import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Image, Tabs, Tab, Alert } from "react-bootstrap";
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { Navigate, useNavigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/vi';
import cookies from 'react-cookies';
import { toast } from 'react-toastify';
import { authApis, endpoints } from "../../configs/Apis";

import MyPagination from "../../components/MyPagination";
import UserAccessModal from "../../components/UserAccessModal";
import MySpinner from "../../components/MySpinner";

const Profile = () => {
    const [user] = useContext(MyUserContext);
    const [, dispatch] = useContext(MyCartContext); 
    const nav = useNavigate();

    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Quản lý Tab hiển thị
    const [activeTab, setActiveTab] = useState("library");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const loadBorrowHistory = async () => {
        try {
            setLoading(true);
            let res = await authApis().get(`${endpoints['my-borrows']}?page=${page}`);
            setBorrows(res.data.content || res.data);
            setTotalPages(res.data.totalPages || 1);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) loadBorrowHistory();
    }, [user, page]);

    if (user === null) {
        return <Navigate to="/login?next=/profile" />;
    }

    const handleAccessClick = (doc) => { 
        setSelectedDoc(doc); 
        setShowAccessModal(true); 
    };

    const handleConfirmPackage = (packageData) => {
        let cart = cookies.load('cart') || null;
        if (cart === null) cart = {};
        cart[packageData.documentId] = {
            'id': packageData.documentId, 'name': packageData.documentName, 'price': packageData.price, 
            'quantity': 1, 'startDate': packageData.startDate, 'durationDays': packageData.durationDays, 'expiryDate': packageData.expiryDate
        };
        cookies.save('cart', cart);
        dispatch({ "type": "UPDATE" });
        toast.success(`Đã thêm yêu cầu gia hạn sách vào phiếu đăng ký!`);
        setShowAccessModal(false);
    };

    // 👉 THUẬT TOÁN GỘP SÁCH CHO "TỦ SÁCH CỦA TÔI"
    // Lọc ra các cuốn sách duy nhất và lấy Hạn sử dụng (DueDate) xa nhất
    const libraryMap = {};
    borrows.forEach(borrow => {
        borrow.borrowDetails?.forEach(detail => {
            const doc = detail.document;
            const dueDate = new Date(detail.dueDate);
            const isLifetime = dueDate.getFullYear() > 2090;

            if (!libraryMap[doc.id]) {
                libraryMap[doc.id] = {
                    ...doc,
                    latestDueDate: dueDate,
                    isLifetime: isLifetime
                };
            } else {
                // Cập nhật lại hạn nếu người dùng gia hạn thêm
                if (isLifetime) {
                    libraryMap[doc.id].isLifetime = true;
                } else if (!libraryMap[doc.id].isLifetime && dueDate > libraryMap[doc.id].latestDueDate) {
                    libraryMap[doc.id].latestDueDate = dueDate;
                }
            }
        });
    });
    const myLibrary = Object.values(libraryMap); // Mảng sách duy nhất

    const renderStatusBadge = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        if (due.getFullYear() > 2090) return <Badge bg="success">Sở hữu vĩnh viễn</Badge>;
        if (today > due) return <Badge bg="danger">Đã hết hạn</Badge>;
        return <Badge bg="primary">Đang hiệu lực</Badge>;
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1300px" }}>
            <h2 className="text-success mb-4 border-bottom pb-2">HỒ SƠ CÁ NHÂN & KHO TÀI NGUYÊN</h2>
            
            <Row>
                {/* CỘT THÔNG TIN USER */}
                <Col lg={3} md={4} className="mb-4">
                    <Card className="shadow-sm text-center p-3 border-0 sticky-top" style={{ top: "80px" }}>
                        <Card.Body>
                            <Image 
                                src={user.avatar || "https://placehold.co/150x150?text=Avatar"} 
                                roundedCircle width={120} height={120} 
                                className="mb-3 border shadow-sm" style={{objectFit: "cover"}}
                            />
                            <Card.Title className="text-primary fw-bold fs-4">{user.username}</Card.Title>
                            <Card.Text className="text-muted mb-2">
                                Vai trò: <Badge bg="info" className="text-uppercase">{user.role}</Badge>
                            </Card.Text>
                            <Button variant="outline-primary" size="sm" className="mt-2 w-100 fw-bold">
                                ⚙️ Chỉnh sửa hồ sơ
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT DỮ LIỆU BÊN PHẢI (CHIA 2 TABS) */}
                <Col lg={9} md={8}>
                    {loading ? <div className="text-center mt-5"><MySpinner /></div> : (
                        <Tabs
                            id="profile-tabs"
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-4 shadow-sm bg-white rounded"
                            fill
                        >
                            {/* TAB 1: TỦ SÁCH CÁ NHÂN */}
                            <Tab eventKey="library" title={<span className="fw-bold fs-5">📚 Tủ Sách Của Tôi</span>}>
                                {myLibrary.length === 0 ? (
                                    <Alert variant="info" className="text-center p-5 shadow-sm">
                                        <h4>Tủ sách của bạn đang trống!</h4>
                                        <p>Hãy khám phá thư viện và thêm tài liệu vào tủ sách của bạn nhé.</p>
                                        <Button variant="success" onClick={() => nav("/documents")}>Khám phá ngay</Button>
                                    </Alert>
                                ) : (
                                    <Row>
                                        {myLibrary.map(doc => {
                                            const isFree = doc.price === 0;
                                            const today = new Date();
                                            const isLifetime = doc.isLifetime;
                                            const isActive = doc.latestDueDate >= today || isLifetime;
                                            const canRead = isFree || isActive;

                                            return (
                                                <Col lg={4} md={6} xs={12} key={doc.id} className="mb-4 d-flex">
                                                    <Card className="w-100 shadow-sm border-0 position-relative">
                                                        {isLifetime && <Badge bg="info" className="position-absolute top-0 end-0 m-2 shadow text-dark">💎 Vĩnh viễn</Badge>}
                                                        <Card.Img variant="top" src={doc.image || "https://placehold.co/300x400/e9ecef/adb5bd?text=No+Image"} style={{ height: "250px", objectFit: "cover" }} />
                                                        <Card.Body className="d-flex flex-column">
                                                            <Card.Title className="text-primary text-truncate fw-bold" title={doc.name || doc.title}>
                                                                {doc.name || doc.title}
                                                            </Card.Title>
                                                            
                                                            <div className="mb-3">
                                                                <small className="text-muted d-block mb-1">Hạn truy cập:</small>
                                                                {renderStatusBadge(doc.latestDueDate)}
                                                                {!isLifetime && <small className="d-block text-danger mt-1 fw-bold">{moment(doc.latestDueDate).format('DD/MM/YYYY HH:mm')}</small>}
                                                            </div>

                                                            <div className="mt-auto d-grid gap-2">
                                                                {canRead ? (
                                                                    <Button variant="success" size="sm" className="fw-bold" onClick={() => nav(`/documents/${doc.id}`)}>
                                                                        📖 Đọc tài liệu
                                                                    </Button>
                                                                ) : null}

                                                                {!isFree && (
                                                                    isLifetime ? (
                                                                        <Badge bg="success" className="p-2 w-100 fs-6">Sở hữu vĩnh viễn</Badge>
                                                                    ) : (
                                                                        <Button variant={isActive ? "outline-warning" : "danger"} size="sm" className="fw-bold" onClick={() => handleAccessClick(doc)}>
                                                                            {isActive ? "⏳ Mua thêm hạn" : "🔑 Mua lại quyền"}
                                                                        </Button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                )}
                            </Tab>

                            {/* TAB 2: LỊCH SỬ GIAO DỊCH */}
                            <Tab eventKey="history" title={<span className="fw-bold fs-5">🧾 Lịch Sử Giao Dịch</span>}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body className="p-0">
                                        <Table responsive hover striped className="mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr className="text-center">
                                                    <th style={{ width: "12%" }}>Mã phiếu</th>
                                                    <th className="text-start" style={{ width: "38%" }}>Chi tiết tài liệu</th>
                                                    <th style={{ width: "15%" }}>Ngày lập</th>
                                                    <th style={{ width: "15%" }}>Hạn cấp phép</th>
                                                    <th style={{ width: "20%" }}>Tình trạng</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {borrows.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center p-4 text-muted">Chưa có giao dịch nào.</td></tr>
                                                ) : (
                                                    borrows.map((borrow) => (
                                                        borrow.borrowDetails?.map((detail, index) => {
                                                            const doc = detail.document;
                                                            const isLifetime = new Date(detail.dueDate).getFullYear() > 2090;

                                                            return (
                                                                <tr key={detail.id} className={index === 0 ? "border-top border-2 text-center" : "text-center"}>
                                                                    <td className="fw-bold text-secondary">
                                                                        {index === 0 ? `#${borrow.id}` : ""}
                                                                    </td>
                                                                    
                                                                    <td className="text-start">
                                                                        <div className="text-primary fw-bold text-truncate" style={{ maxWidth: "250px" }} title={doc.name || doc.title}>
                                                                            {doc.name || doc.title}
                                                                        </div>
                                                                        <small className="fw-semibold">
                                                                            {doc.price === 0 ? <span className="text-success">Miễn phí</span> : <span className="text-danger">{doc.price.toLocaleString()} đ</span>}
                                                                        </small>
                                                                    </td>

                                                                    <td>{index === 0 ? moment(borrow.createdDate).format('DD/MM/YYYY') : ""}</td>
                                                                    
                                                                    <td className="fw-bold">
                                                                        {isLifetime ? "Vĩnh viễn" : moment(detail.dueDate).format('DD/MM/YYYY')}
                                                                    </td>
                                                                    
                                                                    <td>{renderStatusBadge(detail.dueDate)}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    )}
                    
                    <MyPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </Col>
            </Row>

            <UserAccessModal show={showAccessModal} onHide={() => setShowAccessModal(false)} document={selectedDoc} onConfirm={handleConfirmPackage} />
        </Container>
    );
};

export default Profile;