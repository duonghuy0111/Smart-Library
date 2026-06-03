import { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, ListGroup, Row, Badge, Alert } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";
import 'moment/locale/vi'; 
import { MyCartContext, MyUserContext, ChatContext } from "../../configs/Contexts"; 
import cookies from 'react-cookies';
import MySpinner from "../../components/MySpinner";
import { toast } from 'react-toastify';
import UserAccessModal from "../../components/UserAccessModal"; 

const DocumentDetails = () => {
    const { docId } = useParams();
    const [document, setDocument] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [user, ] = useContext(MyUserContext);
    const [, dispatchCart] = useContext(MyCartContext); 
    const { openChatWith } = useContext(ChatContext);
    
    const nav = useNavigate();
    
    const [reviewContent, setReviewContent] = useState("");
    const [rating, setRating] = useState(5); 
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    // 👉 STATE QUẢN LÝ QUYỀN TRUY CẬP
    const [isBorrowed, setIsBorrowed] = useState(false); 
    const [isLifetime, setIsLifetime] = useState(false);
    const canRead = document !== null && (document.price === 0 || isBorrowed);

    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const loadDocumentDetails = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints['document-details'](docId));
            setDocument(res.data);

            let reviewsRes = await Apis.get(endpoints['reviews'](docId));
            let sortedReviews = reviewsRes.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            setReviews(sortedReviews);

            if (user !== null) {
                let myOldReview = sortedReviews.find(r => r.user?.id === user.id);
                if (myOldReview) {
                    setReviewContent(myOldReview.comment || myOldReview.content || "");
                    setRating(myOldReview.rating || 5);
                    setIsUpdateMode(true); 
                } else {
                    setReviewContent("");
                    setRating(5);
                    setIsUpdateMode(false); 
                }
            }

        } catch (ex) {
            console.error("Lỗi tải chi tiết sách: ", ex);
        } finally {
            setLoading(false);
        }
    }

    // 👉 LOGIC KIỂM TRA QUYỀN (HỖ TRỢ API PHÂN TRANG & VĨNH VIỄN)
    const checkBorrowStatus = async () => {
        if (user !== null) {
            try {
                let res = await authApis().get(endpoints['my-borrows']);
                let borrowedBorrows = res.data.content || res.data;
                let hasValidAccess = false;
                let lifetimeAccess = false;
                let today = new Date();

                for (let borrow of borrowedBorrows) {
                    if (borrow.borrowDetails) {
                        for (let detail of borrow.borrowDetails) {
                            if (detail.document?.id === parseInt(docId)) {
                                let dueDate = new Date(detail.dueDate);
                                if (dueDate.getFullYear() > 2090) {
                                    hasValidAccess = true;
                                    lifetimeAccess = true;
                                    break;
                                } else if (dueDate >= today) {
                                    hasValidAccess = true;
                                }
                            }
                        }
                    }
                    if (lifetimeAccess) break;
                }
                setIsBorrowed(hasValidAccess);
                setIsLifetime(lifetimeAccess);
            } catch (ex) {}
        }
    }

    const addReview = async () => {
        if (!reviewContent.trim()) return;
        try {
            // SỬA TẠI ĐÂY: Gửi đúng các key phẳng trùng với ReviewRequestDTO
            await authApis().post(endpoints['add-review'], {
                content: reviewContent,
                rating: rating,
                documentId: parseInt(docId), // Đảm bảo ép về kiểu số nguyên int
                userId: user.id              // Gửi trực tiếp ID phẳng số nguyên
            });
            
            // Gọi lại để cập nhật list mới nhất
            let reviewsRes = await Apis.get(endpoints['reviews'](docId));
            let sortedReviews = reviewsRes.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            setReviews(sortedReviews); 
            
            setIsUpdateMode(true); 
            toast.success(isUpdateMode ? "Đã cập nhật lại nhận xét của bạn!" : "Gửi nhận xét học liệu thành công!");

        } catch (ex) {
            console.error("Lỗi gửi đánh giá: ", ex);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    }

    const handleAccessClick = (doc) => { setSelectedDoc(doc); setShowAccessModal(true); };

    const handleConfirmPackage = (packageData) => {
        let cart = cookies.load('cart') || null;
        if (cart === null) cart = {};
        cart[packageData.documentId] = {
            'id': packageData.documentId, 'name': packageData.documentName, 'price': packageData.price,
            'quantity': 1, 'startDate': packageData.startDate, 'durationDays': packageData.durationDays, 'expiryDate': packageData.expiryDate
        }
        cookies.save('cart', cart);
        dispatchCart({ "type": "UPDATE" });
        toast.success(`Đã thêm yêu cầu gia hạn vào phiếu đăng ký!`);
        setShowAccessModal(false);
    };

    useEffect(() => { loadDocumentDetails(); }, [docId, user]);
    useEffect(() => { 
        if (user) { 
            checkBorrowStatus(); 
        } else { 
            setIsBorrowed(false); 
            setIsLifetime(false);
        } 
    }, [user, docId]);

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <div className="mx-auto mt-4 mb-5" style={{ maxWidth: "1000px" }}>
            <h2 className="text-success mb-4 border-bottom pb-2">CHI TIẾT HỌC LIỆU</h2>

            {document && (
                <Row className="mb-5 shadow-sm p-4 bg-white rounded border">
                    <Col md={4} xs={12} className="text-center mb-3 mb-md-0">
                        <Image src={document.image || "https://placehold.co/300x400/e9ecef/adb5bd?text=Chưa+có+ảnh+bìa"} fluid rounded className="shadow" style={{ maxHeight: "400px", objectFit: "cover" }} />
                    </Col>
                    <Col md={8} xs={12}>
                        <h2 className="text-primary fw-bold mb-3">{document.name || document.title}</h2>
                        
                        {/* 👉 HIỂN THỊ GIÁ VÀ NHÃN VĨNH VIỄN */}
                        <div className="mb-3">
                            {document.price === 0 ? (
                                <span className="fw-bold fs-5 text-success me-3">Miễn phí</span>
                            ) : (
                                <span className="fw-bold fs-5 text-danger me-3">{document.price.toLocaleString()} VNĐ</span>
                            )}
                            {isLifetime && <Badge bg="info" className="fs-6 text-dark shadow-sm">💎 Đã sở hữu vĩnh viễn</Badge>}
                        </div>

                        <div className="text-muted mb-4">
                            <p className="mb-1"><strong>Tác giả:</strong> {document.author}</p>
                            <p className="mb-1"><strong>Năm xuất bản:</strong> {document.publishYear}</p>
                        </div>
                        
                        <h5 className="fw-bold">Tóm tắt nội dung:</h5>
                        <p className="text-justify" style={{ lineHeight: "1.6" }}>{document.description}</p>
                        
                        {/* 👉 CỤM NÚT THAO TÁC THÔNG MINH */}
                        {/* 👉 CỤM NÚT THAO TÁC */}
                        <div className="d-flex flex-wrap gap-3 mt-4 w-100">
                            {canRead && (() => {
                                const url = document.filePath || "";
                                const ext = url.split('.').pop().toLowerCase();
                                
                                // 1. Nếu là Video -> Hiện khung Video
                                if (['mp4', 'webm', 'ogg'].includes(ext)) {
                                    return (
                                        <div className="w-100 mb-3">
                                            <video controls className="w-100 rounded shadow border" style={{ maxHeight: '500px' }}>
                                                <source src={url} type={`video/${ext}`} />
                                                Trình duyệt không hỗ trợ xem video này.
                                            </video>
                                        </div>
                                    );
                                } 
                                // 2. Nếu là Audio -> Hiện thanh Audio
                                else if (['mp3', 'wav'].includes(ext)) {
                                    return (
                                        <div className="w-100 mb-3">
                                            <audio controls className="w-100 shadow-sm">
                                                <source src={url} type={`audio/${ext}`} />
                                            </audio>
                                        </div>
                                    );
                                } 
                                // 3. TẤT CẢ CÁC TRƯỜNG HỢP CÒN LẠI (PDF, DOCX...) -> Dùng Google Docs Viewer
                                else if (['pdf'].includes(ext)) {
                                    return (
                                        <Button 
                                            variant="success" 
                                            size="lg" 
                                            className="fw-bold px-4 shadow-sm" 
                                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`} 
                                            target="_blank"
                                        >
                                            📖 Truy cập Online
                                        </Button>
                                    );
                                }
                                else {
                                    return (
                                        <Button 
                                            variant="primary" 
                                            size="lg" 
                                            className="fw-bold px-4 shadow-sm" 
                                            href={url} 
                                            target="_blank" 
                                            download
                                        >
                                            ⬇️ Tải tài liệu về máy
                                        </Button>
                                    );
                                }
                            })()}
                            
                            {/* Nút Gia hạn giữ nguyên */}
                            {!isLifetime && document.price !== 0 && (
                                <Button 
                                    variant={isBorrowed ? "outline-warning" : "danger"} 
                                    size="lg" 
                                    className="fw-bold px-4 shadow-sm" 
                                    onClick={() => handleAccessClick(document)}
                                >
                                    {isBorrowed ? "⏳ Gia hạn thêm" : "🔑 Mua quyền truy cập"}
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            )}

            {/* PHẦN BÌNH LUẬN ĐƯỢC GIỮ NGUYÊN VẸN */}
            <h4 className="text-info border-bottom pb-2 mt-5">NHẬN XÉT & ĐÁNH GIÁ CỘNG ĐỒNG</h4>

            {user === null ? (
                <Alert variant="warning" className="mt-3">Vui lòng <Link to={`/login?next=/documents/${docId}`} className="alert-link">đăng nhập</Link> để để lại nhận xét!</Alert>
            ) : (
                <div className="mt-3 mb-4 p-3 bg-light rounded border shadow-sm">
                    <div className="d-flex align-items-start">
                        <Image src={user.avatar || "https://placehold.co/50x50"} roundedCircle width={50} height={50} className="me-3 border" style={{objectFit: "cover"}} />
                        <div className="w-100">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-success">
                                    {isUpdateMode ? "✏️ Chỉnh sửa đánh giá của bạn:" : "📝 Đánh giá của bạn:"}
                                </Form.Label>
                                <div className="fs-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i key={star} className={star <= rating ? "fa-solid fa-star text-warning me-2" : "fa-regular fa-star text-secondary me-2"} style={{ cursor: "pointer" }} onClick={() => setRating(star)}></i>
                                    ))}
                                    <span className="fs-6 text-muted ms-2">({rating} sao)</span>
                                </div>
                            </Form.Group>
                            <Form.Control as="textarea" rows={3} placeholder="Chia sẻ cảm nghĩ về tài liệu này..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} />
                            <div className="text-end mt-3">
                                <Button onClick={addReview} variant={isUpdateMode ? "primary" : "success"} className="px-4 fw-bold">
                                    {isUpdateMode ? "Cập nhật nhận xét" : "Gửi nhận xét"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ListGroup className="mt-4 mb-5 shadow-sm">
                {reviews.length === 0 ? <ListGroup.Item className="text-center text-muted py-4">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</ListGroup.Item> : 
                    reviews.map(c => (
                        <ListGroup.Item key={c.id} className={`p-3 ${user && c.user?.id === user.id ? 'bg-light border-success' : ''}`}>
                            <Row>
                                <Col md={1} xs={2} className="text-center">
                                    <Image src={c.user?.avatar || "https://placehold.co/50x50"} roundedCircle width={50} height={50} style={{objectFit: "cover"}} />
                                </Col>
                                <Col md={11} xs={10}>
                                    <div className="d-flex align-items-center mb-1">
                                        <h6 className="fw-bold mb-0 text-primary me-3">
                                            {c.user?.username} 
                                            {user && c.user?.id === user.id && <Badge bg="success" className="ms-2">Của bạn</Badge>}
                                        </h6>
                                        {user !== null && user.username !== c.user?.username && (
                                            <Button variant="outline-primary" size="sm" style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "15px" }} onClick={() => openChatWith(c.user)}>
                                                <i className="fa-solid fa-comment-dots me-1"></i> Nhắn tin
                                            </Button>
                                        )}
                                    </div>
                                    <div className="mb-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(star => <i key={star} className={star <= c.rating ? "fa-solid fa-star text-warning" : "fa-regular fa-star text-secondary"} style={{ fontSize: "12px", marginRight: "2px" }}></i>)}
                                    </div> 
                                    <p className="mb-1 text-dark" style={{ whiteSpace: "pre-wrap" }}>{c.comment || c.content}</p>
                                    <small className="text-muted"><em>Cập nhật lần cuối: {moment(c.createdDate).fromNow()}</em></small>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))
                }
            </ListGroup>

            <UserAccessModal show={showAccessModal} onHide={() => setShowAccessModal(false)} document={selectedDoc} onConfirm={handleConfirmPackage} />
        </div>
    );
}

export default DocumentDetails;