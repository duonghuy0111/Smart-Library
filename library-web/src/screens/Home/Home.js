import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { Alert, Button, Card, Col, Row, Badge } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from 'react-cookies'
import { MyCartContext } from "../../configs/Contexts";

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q] = useSearchParams();
    const [, dispatch] = useContext(MyCartContext);
    const nav = useNavigate();

    const loadDocuments = async () => {
        try {
            setLoading(true);

            // Giả lập delay mạng 0.8s để thấy cái vòng tròn Spinner xoay xoay cho chân thực
            await new Promise(resolve => setTimeout(resolve, 800)); 

            // Cục dữ liệu giả với ảnh bìa màu sắc phân biệt
            const mockData = [
                { id: 1, name: "Giáo trình Lập trình Java", author: "Nguyễn Văn A", price: 0, image: "https://placehold.co/300x400/e3f2fd/0d47a1?text=Java" },
                { id: 2, name: "Cấu trúc dữ liệu và Giải thuật", author: "Trần Thị B", price: 50000, image: "https://placehold.co/300x400/fce4ec/880e4f?text=CTDL" },
                { id: 3, name: "Mạng máy tính cơ bản", author: "Lê Văn C", price: 0, image: "https://placehold.co/300x400/e8f5e9/1b5e20?text=Network" },
                { id: 4, name: "Phát triển Web với React", author: "Phạm D", price: 100000, image: "https://placehold.co/300x400/fff3e0/e65100?text=React" }
            ];

            // Ép thẳng dữ liệu giả vào State luôn, bất chấp Backend có hay không!
            setDocuments(mockData);
            
            // Ẩn nút "Xem thêm" đi vì mình chỉ có 4 cuốn giả lập thôi
            setPage(0); 

        } catch (ex) {
            console.error("Lỗi rồi:", ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDocuments();
    }, [q, page]);

    useEffect(() => {
        setPage(1);
    }, [q]);

    const loadMore = () => {
        setPage(page + 1);
    }

    // Đổi tên hàm order thành borrow cho chuẩn nghiệp vụ
    const borrow = (p) => {
        let cart = cookies.load('cart') || null;
        if (cart === null)
            cart = {}

        if (p.id in cart) {
            // Thư viện thường chỉ cho mượn 1 cuốn mỗi loại, nhưng giữ logic của thầy
            cart[p.id]['quantity']++; 
        } else {
            cart[p.id] = {
                'id': p.id,
                'name': p.name,
                'price': p.price,
                'quantity': 1
            }
        }

        cookies.save('cart', cart);
        dispatch({
            "type": "UPDATE"
        })
    }

    return (
        <>
            <h2 className="text-center text-success mt-3 mb-4">DANH MỤC TÀI LIỆU</h2>

            {documents.length === 0 && !loading && <Alert variant="info" className="mt-2">KHÔNG có tài liệu nào!</Alert>}
            
            <Row>
                {documents.map(p => (
                    <Col xs={12} sm={6} md={4} lg={3} key={p.id} className="p-2 d-flex">
                        {/* Thêm class h-100 để các card cao bằng nhau */}
                        <Card className="w-100 shadow-sm">
                            <Card.Img variant="top" src={p.image} style={{ height: "300px", objectFit: "cover" }} />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="text-primary">{p.name}</Card.Title>
                                <Card.Text className="text-muted mb-1">Tác giả: {p.author}</Card.Text>
                                <Card.Text className="fw-bold mb-3">
                                    {p.price === 0 ? <span className="text-success">Miễn phí</span> : <span className="text-danger">{p.price.toLocaleString()} VNĐ</span>}
                                </Card.Text>
                                
                                {/* Đẩy các nút xuống đáy Card */}
                                <div className="mt-auto d-flex justify-content-between">
                                    <Button variant="outline-info" size="sm" onClick={() => nav(`/documents/${p.id}`)}>Xem chi tiết</Button>
                                    <Button variant="warning" size="sm" onClick={() => borrow(p)}>Mượn sách</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {page > 0 && documents.length > 0 && !loading && (
                <div className="text-center my-4">
                    <Button variant="success" onClick={loadMore}>Xem thêm...</Button>
                </div>
            )}
            
            {/* Canh giữa cái Spinner cho đẹp */}
            {loading && <div className="text-center mt-3"><MySpinner /></div>}
        </>
    );
}

export default Home;