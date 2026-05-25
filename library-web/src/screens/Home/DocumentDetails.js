import { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, ListGroup, Row, Badge, Alert } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";
import 'moment/locale/vi'; 
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
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
    
    const nav = useNavigate();
    const [reviewContent, setReviewContent] = useState("");
    const [rating, setRating] = useState(5); 

    const [isBorrowed, setIsBorrowed] = useState(false); 
    const canRead = document !== null && (document.price === 0 || isBorrowed);

    // Các State quản lý mở đóng Modal chọn gói
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const loadDocumentDetails = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            setDocument({
                id: docId,
                name: docId === "1" ? "Giáo trình Lập trình Java" : "Tài liệu chuyên ngành IT",
                author: "Nguyễn Văn A",
                publishYear: 2023,
                price: docId === "1" ? 0 : 50000,
                description: "Học liệu số này cung cấp các kiến thức nền tảng và nâng cao, rất phù hợp cho sinh viên và giảng viên tham khảo trong quá trình học tập và nghiên cứu trực tuyến. Nội dung được biên soạn sát với thực tế doanh nghiệp.",
                image: `https://placehold.co/400x600/e3f2fd/0d47a1?text=Book+${docId}`
            });

            setReviews([
                {
                    id: 1,
                    content: "Học liệu rất hay, nội dung chi tiết và dễ hiểu!",
                    rating: 5, 
                    createdDate: new Date(Date.now() - 86400000).toISOString(),
                    user: { username: "sinhvien_01", avatar: "https://placehold.co/100x100/fce4ec/880e4f?text=SV" }
                }
            ]);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    const addReview = async () => {
        if (!reviewContent.trim()) return;
        try {
            const newMockReview = {
                id: Date.now(),
                content: reviewContent,
                rating: rating,
                createdDate: new Date().toISOString(),
                user: { username: user.username, avatar: user.avatar }
            };
            setReviews([newMockReview, ...reviews]); 
            setReviewContent(""); 
            toast.success("Gửi nhận xét học liệu thành công!");
        } catch (ex) {
            console.error(ex);
            toast.error("Lỗi thêm bình luận!");
        }
    }

    const handleAccessClick = (doc) => {
        setSelectedDoc(doc);
        setShowAccessModal(true);
    };

    const handleConfirmPackage = (packageData) => {
        let cart = cookies.load('cart') || null;
        if (cart === null) cart = {};

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
        dispatchCart({ "type": "UPDATE" });
        toast.success(`Đã thêm yêu cầu gia hạn vào phiếu đăng ký!`);
    };

    useEffect(() => {
        loadDocumentDetails();
    }, [docId]);

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <div className="mx-auto mt-3" style={{ maxWidth: "1000px" }}>
            <h2 className="text-success mb-4 border-bottom pb-2">CHI TIẾT HỌC LIỆU</h2>

            {document && (
                <Row className="mb-5 shadow-sm p-4 bg-white rounded border">
                    <Col md={4} xs={12} className="text-center mb-3 mb-md-0">
                        {document.image && <Image src={document.image} fluid rounded className="shadow" style={{ maxHeight: "400px" }} />}
                    </Col>
                    <Col md={8} xs={12}>
                        <h2 className="text-primary fw-bold">{document.name}</h2>
                        <div className="mt-3 mb-3 text-muted">
                            <p className="mb-1"><i className="fw-bold">Tác giả:</i> {document.author}</p>
                            <p className="mb-1"><i className="fw-bold">Năm xuất bản:</i> {document.publishYear}</p>
                        </div>
                        <h4 className="mb-3">
                            {document.price === 0 ? <Badge bg="success">Miễn phí truy cập</Badge> : <Badge bg="danger">Phí bản quyền: {document.price.toLocaleString()} VNĐ</Badge>}
                        </h4>
                        <h5 className="fw-bold mt-4">Tóm tắt nội dung:</h5>
                        <p className="text-justify" style={{ lineHeight: "1.6" }}>{document.description}</p>
                        
                        <div className="mt-4">
                            {canRead ? (
                                <Button variant="success" size="lg" className="fw-bold px-4 me-2" href={document.filePath} target="_blank">
                                    📖 Truy cập học liệu Online
                                </Button>
                            ) : document.price === 0 ? (
                                <Button variant="warning" size="lg" className="fw-bold px-4" onClick={() => handleAccessClick(document)}>
                                    ⏳ Gia hạn mượn
                                </Button>
                            ) : (
                                <Button variant="danger" size="lg" className="fw-bold px-4 text-white" onClick={() => handleAccessClick(document)}>
                                    🔑 Gia hạn quyền truy cập
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            )}

            <h4 className="text-info border-bottom pb-2 mt-5">NHẬN XÉT & ĐÁNH GIÁ CỘNG ĐỒNG</h4>

            {user === null ? (
                <Alert variant="warning" className="mt-3">
                    Vui lòng <Link to={`/login?next=/documents/${docId}`} className="alert-link">đăng nhập</Link> để để lại nhận xét cho học liệu này!
                </Alert>
            ) : (
                <div className="mt-3 mb-4 p-3 bg-light rounded border">
                    <div className="d-flex align-items-start">
                        <Image src={user.avatar || "https://placehold.co/50x50"} roundedCircle width={50} height={50} className="me-3 border" style={{objectFit: "cover"}} />
                        <div className="w-100">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Đánh giá của bạn:</Form.Label>
                                <div className="fs-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={star <= rating ? "fa-solid fa-star text-warning me-2" : "fa-regular fa-star text-secondary me-2"}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setRating(star)}
                                        ></i>
                                    ))}
                                    <span className="fs-6 text-muted ms-2">({rating} sao)</span>
                                </div>
                            </Form.Group>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                placeholder="Chia sẻ cảm nghĩ của bạn về học liệu này..." 
                                value={reviewContent} 
                                onChange={e => setReviewContent(e.target.value)} 
                            />
                            <div className="text-end mt-2">
                                <Button onClick={addReview} variant="success" className="px-4 fw-bold">Gửi nhận xét</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ListGroup className="mt-4 mb-5 shadow-sm">
                {reviews.length === 0 ? <ListGroup.Item className="text-center text-muted">Chưa có đánh giá nào.</ListGroup.Item> : 
                    reviews.map(c => (
                        <ListGroup.Item key={c.id} className="p-3">
                            <Row>
                                <Col md={1} xs={2} className="text-center">
                                    <Image src={c.user?.avatar || "https://placehold.co/50x50"} roundedCircle width={50} height={50} style={{objectFit: "cover"}} />
                                </Col>
                                <Col md={11} xs={10}>
                                    <h6 className="fw-bold mb-1 text-primary">{c.user?.username}</h6>
                                    <div className="mb-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <i key={star} className={star <= c.rating ? "fa-solid fa-star text-warning" : "fa-regular fa-star text-secondary"} style={{ fontSize: "12px", marginRight: "2px" }}></i>
                                        ))}
                                    </div> 
                                    <p className="mb-1">{c.content}</p>
                                    <small className="text-muted"><em>{moment(c.createdDate).fromNow()}</em></small>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))
                }
            </ListGroup>

            <UserAccessModal 
                show={showAccessModal} 
                onHide={() => setShowAccessModal(false)} 
                document={selectedDoc} 
                onConfirm={handleConfirmPackage} 
            />
        </div>
    );
}

export default DocumentDetails;