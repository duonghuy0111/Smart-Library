import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import { Button, Card, Col, Row, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import cookies from 'react-cookies';
import { MyCartContext } from "../../configs/Contexts";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 
import Apis, { authApis, endpoints } from "../../configs/Apis";
const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyCartContext);
    const nav = useNavigate();
    
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const loadTrendingDocuments = async () => {
            try {
                setLoading(true);
                
                // 👉 1. GỌI API THẬT TỪ SPRING BOOT
                // Gọi API lấy danh sách học liệu: GET http://localhost:8080/api/documents/
                let res = await Apis.get(endpoints['documents']);
                
                // 👉 2. XỬ LÝ DỮ LIỆU
                // res.data chính là List<Document> trả về từ Backend
                // Tạm thời trên trang chủ, chúng ta lấy 4 cuốn đầu tiên để hiển thị (slice)
                let actualData = res.data.slice(0, 4);

                setDocuments(actualData);

            } catch (error) {
                console.error("Lỗi khi kéo dữ liệu từ Backend:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadTrendingDocuments();
    }, []);

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
        toast.success(`Đã thêm yêu cầu gia hạn vào phiếu đăng ký!`);
    };

    return (
        <>
            <div className="p-5 mb-5 mt-4 bg-light rounded-3 text-center border shadow-sm">
                <h1 className="display-5 fw-bold text-success">📚 HỆ THỐNG THƯ VIỆN SỐ THÔNG MINH</h1>
                <p className="col-md-12 fs-5 text-muted mt-3 mb-4">
                    Khám phá kho tài nguyên học liệu số trực tuyến với hàng ngàn giáo trình, bài giảng và tài liệu tham khảo chất lượng cao.
                </p>
                <Button variant="success" size="lg" className="px-5 shadow" onClick={() => nav("/documents")}>
                    Khám phá toàn bộ Kho học liệu ➔
                </Button>
            </div>

            <h3 className="text-danger fw-bold mb-4 border-bottom pb-2">🔥 HỌC LIỆU NỔI BẬT NHẤT</h3>
            
            {loading ? <div className="text-center mt-5"><MySpinner /></div> : (
                <Row>
                    {documents.map(p => (
                        <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                            <Card className="w-100 shadow-sm position-relative">
                                <Badge bg="danger" className="position-absolute top-0 end-0 m-2 p-2 shadow">
                                    🔥 {p.borrowCount} lượt truy cập
                                </Badge>
                                <Card.Img variant="top" src={p.image} style={{ height: "300px", objectFit: "cover" }} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary text-truncate">{p.name}</Card.Title>
                                    <Card.Text className="fw-bold mb-3">
                                        {p.price === 0 ? <span className="text-success">Miễn phí</span> : <span className="text-danger">{p.price.toLocaleString()} đ</span>}
                                    </Card.Text>
                                    <div className="mt-auto d-grid gap-2">
                                        <Button variant="outline-info" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                        <Button variant={p.price === 0 ? "warning" : "danger"} size="sm" className="fw-bold" onClick={() => handleAccessClick(p)}>
                                            {p.price === 0 ? "⏳ Gia hạn mượn" : "🔑 Gia hạn truy cập"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <UserAccessModal show={showAccessModal} onHide={() => setShowAccessModal(false)} document={selectedDoc} onConfirm={handleConfirmPackage} />
        </>
    );
}

export default Home;