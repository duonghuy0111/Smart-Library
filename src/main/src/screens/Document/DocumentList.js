import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import { Alert, Button, Card, Col, Row, Form, Container } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from 'react-cookies';
import { MyCartContext } from "../../configs/Contexts";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 
import DocumentCompareModal from "../../components/DocumentCompareModal"; 
import Apis, { endpoints } from "../../configs/Apis";
const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q] = useSearchParams();
    const [, dispatch] = useContext(MyCartContext);
    const nav = useNavigate();
    
    // --- BỘ LỌC ---
    const [author, setAuthor] = useState("");
    const [publishYear, setPublishYear] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const kw = q.get("kw");
    const cateId = q.get("cateId");

    // --- MODAL & SO SÁNH ---
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [compareList, setCompareList] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            
            // 👉 Nối TẤT CẢ các tham số vào URL
            let url = `${endpoints['documents']}?`;
            
            // Tham số từ URL (Header truyền sang)
            if (kw) url += `kw=${kw}&`;
            if (cateId) url += `categoryId=${cateId}&`;
            
            // Tham số từ Bộ lọc trên màn hình DocumentList
            if (author) url += `author=${author}&`;
            if (publishYear) url += `publishYear=${publishYear}&`;
            
            if (page) url += `page=${page}&`;
            
            // Gọi API
            let res = await Apis.get(url);
            
            // Xử lý logic sắp xếp (Sort) tại ReactJS
            let data = res.data;
            if (sortBy === "name") {
                data.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === "year") {
                data.sort((a, b) => b.publishYear - a.publishYear);
            } else if (sortBy === "popularity") {
                // Sắp xếp theo số lượt xem/mượn nếu Database bạn có trường này
                // data.sort((a, b) => b.borrowCount - a.borrowCount);
            }
            
            setDocuments(data);
        } catch (ex) {
            console.error("Lỗi tải danh sách tài liệu: ", ex);
            toast.error("Lỗi khi kéo dữ liệu bộ lọc!");
        } finally {
            setLoading(false);
        }       
    }

    useEffect(() => { loadDocuments(); }, [q, page]);
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
                    <Button variant="success" className="w-100 fw-bold" onClick={loadDocuments}>Lọc kết quả</Button>
                </Col>
            </Form>

            {documents.length === 0 && !loading && <Alert variant="info">KHÔNG tìm thấy học liệu nào phù hợp với bộ lọc!</Alert>}
            
            <Row>
                {documents.map(p => {
                    const isAddedToCompare = compareList.some(item => item.id === p.id);
                    return (
                        <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                            <Card className="w-100 shadow-sm">
                                <Card.Img variant="top" src={p.image || "https://placehold.co/300x400/e9ecef/adb5bd?text=Chưa+có+ảnh+bìa"} style={{ height: "300px", objectFit: "cover" }} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary text-truncate">{p.name}</Card.Title>
                                    <Card.Text className="text-muted mb-1 small">Tác giả: {p.author}</Card.Text>
                                    <Card.Text className="text-muted mb-2 small">Năm XB: {p.publishYear}</Card.Text>
                                    <div className="mt-auto d-grid gap-2">
                                        <Button variant="outline-info" size="sm" className="fw-bold" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                        <Button variant={p.price === 0 ? "warning" : "danger"} size="sm" className="fw-bold" onClick={() => handleAccessClick(p)}>
                                            {p.price === 0 ? "⏳ Gia hạn mượn" : "🔑 Gia hạn truy cập"}
                                        </Button>
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

            {page > 0 && documents.length > 0 && !loading && (
                <div className="text-center my-4">
                    <Button variant="outline-success" onClick={() => setPage(page + 1)}>Xem thêm các trang sau...</Button>
                </div>
            )}
            {loading && <div className="text-center mt-3"><MySpinner /></div>}

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