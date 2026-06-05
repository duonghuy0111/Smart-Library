import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import { Alert, Button, Card, Col, Row, Form, Container } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from 'react-cookies';
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 
import DocumentCompareModal from "../../components/DocumentCompareModal"; 
import Apis, { authApis, endpoints } from "../../configs/Apis";

// 👉 IMPORT COMPONENT PHÂN TRANG VÀO ĐÂY
import MyPagination from "../../components/MyPagination"; 

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 👉 STATE CHO PHÂN TRANG
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    
    const [q] = useSearchParams();
    const [, dispatch] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext); 
    const nav = useNavigate();
    
    const [author, setAuthor] = useState("");
    const [publishYear, setPublishYear] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const kw = q.get("kw");
    const cateId = q.get("cateId");

    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [compareList, setCompareList] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    // 👉 ĐÃ THÊM: State lưu quyền truy cập (Đang mượn/Vĩnh viễn) của từng cuốn sách
    const [accessMap, setAccessMap] = useState({});

    // 1. Kéo danh sách Học liệu theo bộ lọc
    const loadDocuments = async () => {
        try {
            setLoading(true);
            
            let url = `${endpoints['documents']}?`;
            if (kw) url += `kw=${kw}&`;
            if (cateId) url += `categoryId=${cateId}&`;
            if (author) url += `author=${author}&`;
            if (publishYear) url += `publishYear=${publishYear}&`;
            if (sortBy) url += `sortBy=${sortBy}&`;
            if (page) url += `page=${page}&`;
            
            let res = await Apis.get(url);
            
            let data = res.data.content || res.data; 
            
            setDocuments(data);
            setTotalPages(res.data.totalPages || 1); 

        } catch (ex) {
            console.error("Lỗi tải danh sách tài liệu: ", ex);
            toast.error("Lỗi khi kéo dữ liệu bộ lọc!");
        } finally {
            setLoading(false);
        }       
    }

    // 2. Kéo ngầm Lịch sử mượn để check quyền hiển thị nút
    useEffect(() => {
        const fetchBorrowedDocs = async () => {
            if (user !== null) {
                try {
                    let res = await authApis().get(endpoints['my-borrows']); // Hoặc url lấy full ko phân trang nếu có
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

                                // Lưu lại trạng thái kích hoạt và vĩnh viễn
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


    // Load lại danh sách khi chuyển trang hoặc đổi bộ lọc
    useEffect(() => { loadDocuments(); }, [q, page, sortBy]); 
    // Reset về trang 1 khi gõ tìm kiếm từ khóa mới
    useEffect(() => { setPage(1); }, [q]); 

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
        setShowAccessModal(false);
    };

    const handleToggleCompare = (doc) => {
        const isExist = compareList.some(item => item.id === doc.id);
        if (isExist) {
            setCompareList(prev => prev.filter(item => item.id !== doc.id));
            toast.info(`Đã bỏ "${doc.name}" khỏi danh sách so sánh.`);
        } else {
            if (compareList.length >= 3) {
                toast.warning("Hệ thống chỉ hỗ trợ so sánh tối đa 3 học liệu!");
                return;
            }
            setCompareList(prev => [...prev, doc]);
            toast.success(`Đã thêm "${doc.name}" vào danh sách so sánh.`);
        }
    };

    return (
        <Container className="mt-4 mb-5">
            <h2 className="text-success mb-4 border-bottom pb-2">🗂️ KHO HỌC LIỆU TỔNG HỢP</h2>
            
            <Form className="row g-2 mb-4 p-3 bg-light rounded border shadow-sm">
                <Col md={3} xs={12}>
                    <Form.Control type="text" placeholder="Tìm theo tác giả..." value={author} onChange={e => setAuthor(e.target.value)} />
                </Col>
                <Col md={3} xs={12}>
                    <Form.Control type="number" placeholder="Tìm theo năm xuất bản..." value={publishYear} onChange={e => setPublishYear(e.target.value)} />
                </Col>
                <Col md={4} xs={12} className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0 text-nowrap fw-semibold text-secondary">Sắp xếp:</Form.Label>
                    <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-primary">
                        <option value="name">Theo tên học liệu (A-Z)</option>
                        <option value="year">Theo năm xuất bản (Mới nhất)</option>
                        <option value="popularity">Theo mức độ phổ biến</option>
                    </Form.Select>
                </Col>
                <Col md={2} xs={12}>
                    <Button variant="success" className="w-100 fw-bold" onClick={() => { setPage(1); loadDocuments(); }}>Lọc kết quả</Button>
                </Col>
            </Form>

            {documents.length === 0 && !loading && <Alert variant="info">KHÔNG tìm thấy học liệu nào phù hợp với bộ lọc!</Alert>}
            
            <Row>
                {documents.map(p => {
                    const isAddedToCompare = compareList.some(item => item.id === p.id);
                    
                    // 👉 LOGIC KIỂM TRA QUYỀN TRUY CẬP CHO TỪNG CUỐN SÁCH
                    const isFree = p.price === 0;
                    const userAccess = accessMap[p.id] || { isActive: false, isLifetime: false };
                    const canRead = isFree || userAccess.isActive;
                    const isLifetime = userAccess.isLifetime;

                    return (
                        <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                            <Card className="w-100 shadow-sm">
                                <Card.Img variant="top" src={p.image || "https://placehold.co/300x400/e9ecef/adb5bd?text=Chưa+có+ảnh+bìa"} style={{ height: "300px", objectFit: "cover" }} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary text-truncate" title={p.name || p.title}>{p.name || p.title}</Card.Title>
                                    <Card.Text className="text-muted mb-1 small">Tác giả: {p.author}</Card.Text>
                                    <Card.Text className="text-muted mb-2 small">Năm XB: {p.publishYear}</Card.Text>
                                    
                                    {/* 👉 HIỂN THỊ GIÁ TIỀN */}
                                    <Card.Text className="fw-bold mb-3">
                                        {isFree ? <span className="text-success">Miễn phí</span> : <span className="text-danger">{p.price.toLocaleString()} đ</span>}
                                    </Card.Text>

                                    <div className="mt-auto d-grid gap-2">
                                        <Button variant="outline-info" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                        
                                        {/* Nút Đọc ngay (Nếu sách miễn phí hoặc user đang có quyền) */}
                                        {canRead && (
                                            <Button variant="success" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>
                                                📖 Truy cập ngay
                                            </Button>
                                        )}
                                        
                                        {/* Nút Gia hạn (Ẩn đi nếu sách Miễn phí hoặc đã mua Vĩnh viễn) */}
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
                                                    {userAccess.isActive ? "⏳ Gia hạn thêm" : "🔑 Gia hạn truy cập"}
                                                </Button>
                                            )
                                        )}

                                        <Button variant={isAddedToCompare ? "primary" : "outline-primary"} size="sm" className="fw-bold" onClick={() => handleToggleCompare(p)}>
                                            {isAddedToCompare ? "✅ Đang chọn so sánh" : "⚖️ So sánh học liệu"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {loading ? (
                <div className="text-center mt-3"><MySpinner /></div>
            ) : (
                <MyPagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            )}

            {/* THANH CÔNG CỤ SO SÁNH */}
            {compareList.length > 0 && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x bg-white shadow-lg border border-primary p-3 rounded-top d-flex align-items-center justify-content-between gap-5" style={{ zIndex: 1050, minWidth: "450px" }}>
                    <div>
                        <h6 className="fw-bold text-primary mb-0">⚖️ Trình đối chiếu học liệu</h6>
                        <small className="text-muted">Đã chọn: <span className="fw-bold text-danger">{compareList.length}</span> / 3</small>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" className="fw-semibold" onClick={() => setCompareList([])}>Xóa hết</Button>
                        <Button variant="primary" size="sm" className="fw-bold" onClick={() => setShowCompareModal(true)}>Đối chiếu ngay ➔</Button>
                    </div>
                </div>
            )}

            <UserAccessModal show={showAccessModal} onHide={() => setShowAccessModal(false)} document={selectedDoc} onConfirm={handleConfirmPackage} />
            <DocumentCompareModal show={showCompareModal} onHide={() => setShowCompareModal(false)} compareList={compareList} onRemoveItem={handleRemoveCompareItem => setCompareList(prev => prev.filter(item => item.id !== handleRemoveCompareItem))} />
        </Container>
    );
}

export default DocumentList;