import { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, ListGroup, Row, Badge, Alert } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";
import 'moment/locale/vi'; // Format thời gian theo tiếng Việt
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import cookies from 'react-cookies';
import MySpinner from "../../components/MySpinner";

const DocumentDetails = () => {
    const { docId } = useParams();
    const [document, setDocument] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [user, ] = useContext(MyUserContext);
    const [, dispatchCart] = useContext(MyCartContext); // Lấy context để làm nút Mượn sách
    
    const nav = useNavigate();
    const [reviewContent, setReviewContent] = useState("");

    const loadDocumentDetails = async () => {
        try {
            setLoading(true);

            // --- CODE API THẬT (Tạm ẩn) ---
            /*
            let resDoc = await Apis.get(endpoints['document-details'](docId));
            setDocument(resDoc.data);
            
            let resRev = await Apis.get(endpoints['reviews'](docId));
            setReviews(resRev.data);
            */

            // === MOCK DATA ĐỂ TEST GIAO DIỆN ===
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Giả lập dữ liệu sách
            setDocument({
                id: docId,
                name: docId === "1" ? "Giáo trình Lập trình Java" : "Tài liệu chuyên ngành IT",
                author: "Nguyễn Văn A",
                publishYear: 2023,
                price: docId === "1" ? 0 : 50000,
                description: "Tài liệu này cung cấp các kiến thức nền tảng và nâng cao, rất phù hợp cho sinh viên và giảng viên tham khảo trong quá trình học tập và nghiên cứu. Nội dung được biên soạn sát với thực tế doanh nghiệp.",
                image: `https://placehold.co/400x600/e3f2fd/0d47a1?text=Book+${docId}`
            });

            // Giả lập dữ liệu bình luận
            setReviews([
                {
                    id: 1,
                    content: "Sách rất hay, nội dung chi tiết và dễ hiểu!",
                    createdDate: new Date(Date.now() - 86400000).toISOString(), // 1 ngày trước
                    user: { username: "sinhvien_01", avatar: "https://placehold.co/100x100/fce4ec/880e4f?text=SV" }
                }
            ]);
            // === KẾT THÚC MOCK DATA ===

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    // Hàm thêm bình luận
    const addReview = async () => {
        if (!reviewContent.trim()) return;

        try {
            // --- CODE API THẬT ---
            /*
            let res = await authApis().post(endpoints['add-review'](docId), {
                'content': reviewContent
            });
            if (res.status === 201) {
                setReviews([res.data, ...reviews]);
                setReviewContent("");
            }
            */

            // === MOCK DATA THÊM BÌNH LUẬN ===
            const newMockReview = {
                id: Date.now(),
                content: reviewContent,
                createdDate: new Date().toISOString(),
                user: { username: user.username, avatar: user.avatar }
            };
            setReviews([newMockReview, ...reviews]); // Đẩy bình luận mới lên đầu
            setReviewContent(""); // Xóa trắng ô nhập
            // === KẾT THÚC MOCK DATA ===

        } catch (ex) {
            console.error(ex);
            alert("Lỗi thêm bình luận!");
        }
    }

    // Tích hợp hàm mượn sách trực tiếp ở trang chi tiết
    const borrow = (doc) => {
        let cart = cookies.load('cart') || null;
        if (cart === null) cart = {};

        if (doc.id in cart) {
            cart[doc.id]['quantity']++;
        } else {
            cart[doc.id] = {
                'id': doc.id,
                'name': doc.name,
                'price': doc.price,
                'quantity': 1
            }
        }
        cookies.save('cart', cart);
        dispatchCart({ "type": "UPDATE" });
        alert(`Đã thêm "${doc.name}" vào phiếu mượn!`);
    }

    useEffect(() => {
        loadDocumentDetails();
    }, [docId]);

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <div className="mx-auto mt-3" style={{ maxWidth: "1000px" }}>
            <h2 className="text-success mb-4 border-bottom pb-2">CHI TIẾT TÀI LIỆU</h2>

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
                            {document.price === 0 ? <Badge bg="success">Miễn phí mượn</Badge> : <Badge bg="danger">Phí mượn: {document.price.toLocaleString()} VNĐ</Badge>}
                        </h4>

                        <h5 className="fw-bold mt-4">Tóm tắt nội dung:</h5>
                        <p className="text-justify" style={{ lineHeight: "1.6" }}>{document.description}</p>
                        
                        <div className="mt-4">
                            <Button variant="warning" size="lg" className="fw-bold px-4" onClick={() => borrow(document)}>
                                ➕ Thêm vào Phiếu mượn
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}

            <h4 className="text-info border-bottom pb-2 mt-5">NHẬN XÉT & ĐÁNH GIÁ</h4>

            {user === null ? (
                <Alert variant="warning" className="mt-3">
                    Vui lòng <Link to={`/login?next=/documents/${docId}`} className="alert-link">đăng nhập</Link> để để lại nhận xét cho tài liệu này!
                </Alert>
            ) : (
                <div className="mt-3 mb-4 p-3 bg-light rounded border">
                    <div className="d-flex align-items-start">
                        <Image src={user.avatar || "https://placehold.co/50x50"} roundedCircle width={50} height={50} className="me-3 border" style={{objectFit: "cover"}} />
                        <div className="w-100">
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                placeholder="Chia sẻ cảm nghĩ của bạn về tài liệu này..." 
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
                                    <p className="mb-1">{c.content}</p>
                                    <small className="text-muted"><em>{moment(c.createdDate).fromNow()}</em></small>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))
                }
            </ListGroup>
        </div>
    );
}

export default DocumentDetails;