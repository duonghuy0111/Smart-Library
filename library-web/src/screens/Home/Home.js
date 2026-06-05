import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import { Button, Card, Col, Row, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import cookies from 'react-cookies';
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 
import Apis, { authApis, endpoints } from "../../configs/Apis";

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext); 
    const nav = useNavigate();
    
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    
    // XÓA DÒNG NÀY: const [borrowedDocIds, setBorrowedDocIds] = useState([]);
    const [accessMap, setAccessMap] = useState({}); // THÊM DÒNG NÀY

    useEffect(() => {
        const loadTrendingDocuments = async () => {
            try {
                setLoading(true);
                let res = await Apis.get(`${endpoints['documents']}?sortBy=popularity`);
                
                // 👉 ĐÃ SỬA: Hứng mảng sách từ biến content của Map
                let data = res.data.content || res.data; 
                let actualData = data.slice(0, 4);
                
                setDocuments(actualData);
            } catch (error) {
                console.error("Lỗi khi kéo dữ liệu từ Backend:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrendingDocuments();
    }, []);

    useEffect(() => {
        const fetchBorrowedDocs = async () => {
            if (user !== null) {
                try {
                    let res = await authApis().get(endpoints['my-borrows']);
                    let borrowedBorrows = res.data.content || res.data;
                    let map = {};
                    let today = new Date();

                    for (let borrow of borrowedBorrows) {
                        if (borrow.borrowDetails) {
                            for (let detail of borrow.borrowDetails) {
                                let docId = detail.document.id;
                                let dueDate = new Date(detail.dueDate);
                                let isLifetime = dueDate.getFullYear() > 2090;
                                let isActive = dueDate > today || isLifetime;

                                if (!map[docId] || (!map[docId].isLifetime && isLifetime)) {
                                    map[docId] = { isActive, isLifetime };
                                } else if (isActive) {
                                    map[docId].isActive = true;
                                }
                            }
                        }
                    }
                    setAccessMap(map);
                } catch (ex) {
                    console.error("Lỗi lấy danh sách mượn:", ex);
                }
            } else {
                setAccessMap({});
            }
        };
        fetchBorrowedDocs();
    }, [user]);

    const handleAccessClick = (doc) => { setSelectedDoc(doc); setShowAccessModal(true); };

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
                    {documents.map(p => {
                        const isFree = p.price === 0;
                        const userAccess = accessMap[p.id] || { isActive: false, isLifetime: false };
                        const canRead = isFree || userAccess.isActive;
                        const isLifetime = userAccess.isLifetime;

                        return (
                            <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                                <Card className="w-100 shadow-sm position-relative">
                                    <Badge bg="danger" className="position-absolute top-0 end-0 m-2 p-2 shadow">
                                        🔥 {p.borrowCount || 0} lượt truy cập
                                    </Badge>
                                    <Card.Img variant="top" src={p.image || "https://placehold.co/300x400/e9ecef/adb5bd?text=No+Image"} style={{ height: "300px", objectFit: "cover" }} />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="text-primary text-truncate">{p.name || p.title}</Card.Title>
                                        
                                        <div className="mb-3">
                                            {isFree ? (
                                                <span className="fw-bold text-success d-block">Miễn phí</span>
                                            ) : (
                                                <span className="fw-bold text-danger d-block">{p.price.toLocaleString()} đ</span>
                                            )}
                                            
                                            {/* HIỂN THỊ DÒNG CHỮ ĐÃ MUA VĨNH VIỄN */}
                                            {isLifetime && (
                                                <small className="text-info fw-bold">💎 Đã sở hữu vĩnh viễn</small>
                                            )}
                                        </div>

                                        <div className="mt-auto d-grid gap-2">
                                            <Button variant="outline-info" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                            
                                            {/* Nút Đọc ngay */}
                                            {canRead && (
                                                <Button variant="success" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>
                                                    📖 Truy cập ngay
                                                </Button>
                                            )}
                                            
                                            {/* Nút Gia hạn (Ẩn nếu Miễn phí hoặc Vĩnh viễn) */}
                                            {!isFree && (
                                                isLifetime ? (
                                                    <Button variant="success" size="sm" className="fw-bold" disabled>
                                                        ✔️ Đã sở hữu vĩnh viễn
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant={userAccess.isActive ? "outline-warning" : "danger"} 
                                                        size="sm" 
                                                        className="fw-bold" 
                                                        onClick={() => handleAccessClick(p)}
                                                    >
                                                        {userAccess.isActive ? "⏳ Gia hạn thêm" : "🔑 Mua quyền truy cập"}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
            <UserAccessModal show={showAccessModal} onHide={() => setShowAccessModal(false)} document={selectedDoc} onConfirm={handleConfirmPackage} />
        </>
    );
}

export default Home;