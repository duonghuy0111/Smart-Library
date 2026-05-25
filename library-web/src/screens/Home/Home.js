import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { Alert, Button, Card, Col, Row, Badge, Form } from "react-bootstrap";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import cookies from 'react-cookies';
import { MyCartContext } from "../../configs/Contexts";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q] = useSearchParams();
    const [, dispatch] = useContext(MyCartContext);
    const nav = useNavigate();
    
    const [author, setAuthor] = useState("");
    const [publishYear, setPublishYear] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const location = useLocation(); 
    const isHomePage = location.pathname === "/"; 

    const kw = q.get("kw");
    const cateId = q.get("cateId");

    // Các State điều khiển Modal chọn gói gia hạn
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800)); 

            let mockData = [
                { id: 1, name: "Giáo trình Lập trình Java", author: "Nguyễn Văn A", rating: 4, price: 0, categoryId: 1, borrowCount: 45, image: "https://placehold.co/300x400/e3f2fd/0d47a1?text=Java" },
                { id: 2, name: "Cấu trúc dữ liệu và Giải thuật", author: "Trần Thị B", rating: 5, price: 50000, categoryId: 1, borrowCount: 120, image: "https://placehold.co/300x400/fce4ec/880e4f?text=CTDL" },
                { id: 3, name: "Mạng máy tính cơ bản", author: "Lê Văn C", rating: 3, price: 0, categoryId: 1, borrowCount: 12, image: "https://placehold.co/300x400/e8f5e9/1b5e20?text=Network" },
                { id: 4, name: "Nhập môn Kinh tế học", author: "Phạm D", rating: 4, price: 100000, categoryId: 2, borrowCount: 200, image: "https://placehold.co/300x400/fff3e0/e65100?text=KinhTe" },
                { id: 5, name: "Phát triển Web với React", author: "Hoàng E", rating: 5, price: 0, categoryId: 1, borrowCount: 180, image: "https://placehold.co/300x400/f3e5f5/4a148c?text=React" }
            ];

            if (kw) mockData = mockData.filter(doc => doc.name.toLowerCase().includes(kw.toLowerCase()));
            if (cateId) mockData = mockData.filter(doc => doc.categoryId === parseInt(cateId));
            if (author) mockData = mockData.filter(doc => doc.author.toLowerCase().includes(author.toLowerCase()));
            if (publishYear) mockData = mockData.filter(doc => doc.publishYear === parseInt(publishYear));
            
            if (!isHomePage) {
                if (sortBy === "name") mockData.sort((a, b) => a.name.localeCompare(b.name));
                else if (sortBy === "year") mockData.sort((a, b) => b.publishYear - a.publishYear); 
                else if (sortBy === "popularity") mockData.sort((a, b) => b.borrowCount - a.borrowCount); 
            }
            if (isHomePage) {
                mockData = mockData.sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 4);
            }

            setDocuments(mockData);
            setPage(0); 

        } catch (ex) {
            console.error("Lỗi tải học liệu:", ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDocuments();
    }, [q, page, isHomePage]);

    useEffect(() => { setPage(1); }, [q]);
    const loadMore = () => { setPage(page + 1); }

    // Kích hoạt bật Modal gia hạn thời gian
    const handleAccessClick = (doc) => {
        setSelectedDoc(doc);
        setShowAccessModal(true);
    };

    // Nhận dữ liệu từ Modal và lưu vào Phiếu đăng ký
    const handleConfirmPackage = (packageData) => {
        let cart = cookies.load('cart') || null;
        if (cart === null) cart = {}

        cart[packageData.documentId] = {
            'id': packageData.documentId,
            'name': packageData.documentName,
            'price': packageData.price, 
            'quantity': 1,
            'startDate': packageData.startDate,
            'durationDays': packageData.durationDays,
            'expiryDate': packageData.expiryDate
        }

        cookies.save('cart', cart);
        dispatch({ "type": "UPDATE" });
        toast.success(`Đã thêm yêu cầu gia hạn vào phiếu đăng ký!`);
    };

    return (
        <>
            {isHomePage ? (
                <div className="p-5 mb-4 bg-light rounded-3 text-center border shadow-sm">
                    <h1 className="display-5 fw-bold text-success">📚 HỆ THỐNG THƯ VIỆN SỐ THÔNG MINH</h1>
                    <p className="col-md-12 fs-5 text-muted">
                        Chào mừng bạn đến với kho tài nguyên học liệu số trực tuyến. Nơi cung cấp giáo trình điện tử, tài liệu tham khảo và video bài giảng chất lượng cao dành cho Sinh viên và Giảng viên.
                    </p>
                    <Button variant="success" size="lg" onClick={() => nav("/documents")}>Khám phá kho học liệu ngay ➔</Button>
                </div>
            ) : null}

            <h2 className="text-success mt-3 mb-4 border-bottom pb-2">
                {isHomePage ? "🔥 HỌC LIỆU ĐƯỢC TRUY CẬP NHIỀU NHẤT" : "🗂️ KHO HỌC LIỆU TỔNG HỢP"}
            </h2>
            
            {!isHomePage && (
                <Form className="row g-2 mb-4 p-3 bg-light rounded border">
                    <Col md={3} xs={12}>
                        <Form.Control type="text" placeholder="Tìm theo tác giả..." value={author} onChange={e => setAuthor(e.target.value)} />
                    </Col>
                    <Col md={3} xs={12}>
                        <Form.Control type="number" placeholder="Tìm theo năm xuất bản..." value={publishYear} onChange={e => setPublishYear(e.target.value)} />
                    </Col>
                    <Col md={4} xs={12} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0 text-nowrap">Sắp xếp:</Form.Label>
                        <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="name">Theo tên học liệu (A-Z)</option>
                            <option value="year">Theo năm xuất bản</option>
                            <option value="popularity">Mức độ phổ biến (Lượt truy cập)</option>
                        </Form.Select>
                    </Col>
                    <Col md={2} xs={12}>
                        <Button variant="success" className="w-100" onClick={loadDocuments}>Lọc kết quả</Button>
                    </Col>
                </Form>
            )}

            {documents.length === 0 && !loading && <Alert variant="info" className="mt-2">KHÔNG có học liệu nào phù hợp!</Alert>}
            
            <Row>
                {documents.map(p => (
                    <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                        <Card className="w-100 shadow-sm position-relative">
                            {isHomePage && (
                                <Badge bg="danger" className="position-absolute top-0 end-0 m-2 p-2 shadow">
                                    🔥 {p.borrowCount} lượt truy cập
                                </Badge>
                            )}
                            <Card.Img variant="top" src={p.image} style={{ height: "300px", objectFit: "cover" }} />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="text-primary">{p.name}</Card.Title>
                                <Card.Text className="text-muted mb-1">Tác giả: {p.author}</Card.Text>
                                <Card.Text className="fw-bold mb-3">
                                    {p.price === 0 ? <span className="text-success">Miễn phí gia hạn</span> : <span className="text-danger">{p.price.toLocaleString()} VNĐ</span>}
                                </Card.Text>
                                <div className="mt-auto d-grid gap-2">
                                    <Button variant="outline-info" size="sm" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                    
                                    {/* THAY THẾ CHỮ MƯỢN/MUA ĐỨT THÀNH ĐỒNG BỘ GIA HẠN */}
                                    {p.price === 0 ? (
                                        <Button variant="success" size="sm" onClick={() => handleAccessClick(p)}>Gia hạn mượn</Button>
                                    ) : (
                                        <Button variant="danger" size="sm" onClick={() => handleAccessClick(p)}>Gia hạn quyền truy cập</Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {page > 0 && documents.length > 0 && !loading && !isHomePage && (
                <div className="text-center my-4">
                    <Button variant="success" onClick={loadMore}>Xem thêm...</Button>
                </div>
            )}
            {loading && <div className="text-center mt-3"><MySpinner /></div>}

            <UserAccessModal 
                show={showAccessModal} 
                onHide={() => setShowAccessModal(false)} 
                document={selectedDoc} 
                onConfirm={handleConfirmPackage} 
            />
        </>
    );
}

export default Home;