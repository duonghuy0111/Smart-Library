import { useContext, useState } from "react";
import { Alert, Button, Form, Table, Modal, Card, Row, Col, Badge } from "react-bootstrap";
import cookies from 'react-cookies'
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';

const Cart = () => {
    const [cart, setCart] = useState(cookies.load('cart') || null);
    const [user, ] = useContext(MyUserContext);
    const [c, cartDispatch] = useContext(MyCartContext);

    // Các state điều khiển Modal Thanh toán
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [isProcessing, setIsProcessing] = useState(false);

    // Định nghĩa tỷ lệ giá các gói giống hệt bên UserAccessModal để tính lại tiền
    const getPriceRate = (days) => {
        if (days === "7") return 0.2;
        if (days === "30") return 0.5;
        if (days === "90") return 0.8;
        return 1.0; // Gói vĩnh viễn (365 ngày)
    };

    // Hàm lấy giá gốc của học liệu dựa trên ID (Phục vụ Mock Data hiện tại)
    const getBasePriceById = (id) => {
        const docId = parseInt(id);
        if (docId === 2) return 50000;   // Cấu trúc dữ liệu
        if (docId === 4) return 100000;  // Nhập môn Kinh tế
        return 0;                        // Các tài liệu miễn phí khác
    };

    // --- HÀM XỬ LÝ THAY ĐỔI GÓI HOẶC NGÀY NGAY TRONG BẢNG ---
    const handlePackageUpdateInCart = (id, newDuration, newStartDate) => {
        if (!cart || !(id in cart)) return;

        const basePrice = getBasePriceById(id);
        const rate = getPriceRate(newDuration);
        const newPrice = basePrice * rate; // Tính lại giá đã giảm theo gói mới

        // Tính toán lại ngày hết hạn mới
        let newExpiry = "Không giới hạn (Vĩnh viễn)";
        if (newDuration !== "365" && newStartDate) {
            let resultDate = new Date(newStartDate);
            resultDate.setDate(resultDate.getDate() + parseInt(newDuration));
            newExpiry = resultDate.toISOString().split("T")[0];
        }

        // Cập nhật lại Object phần tử đó trong Giỏ hàng
        let updatedCart = {
            ...cart,
            [id]: {
                ...cart[id],
                durationDays: newDuration,
                startDate: newStartDate,
                expiryDate: newExpiry,
                price: newPrice
            }
        };

        setCart(updatedCart);
        cookies.save('cart', updatedCart);
        cartDispatch({ "type": "UPDATE" }); // Báo hiệu Context tính lại Tổng tiền giỏ hàng công khai trên Header
        toast.success("Đã cập nhật cấu hình gói và tính lại chi phí!");
    };

    const handleConfirmClick = () => {
        if (cart === null || Object.keys(cart).length === 0) return;
        if (c.totalAmount === 0) {
            processCheckout();
        } else {
            setShowPayment(true);
        }
    };

    const processCheckout = async () => {
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200)); 
            setCart(null); 
            cookies.remove('cart'); 
            cartDispatch({ "type": "PAID" }); 
            setShowPayment(false);

            if (c.totalAmount === 0) {
                toast.success("Đăng ký gia hạn quyền mượn đọc thành công!");
            } else {
                if (paymentMethod === "CASH") {
                    toast.success("Đăng ký thành công! Vui lòng hoàn tất phí gia hạn tại quầy thủ thư.");
                } else {
                    toast.success(`Thanh toán phí gia hạn qua ${paymentMethod} thành công! Quyền truy cập đã được kích hoạt.`);
                }
            }
        } catch (ex) {
            console.error("Lỗi giao dịch:", ex);
            toast.error("Quá trình xử lý giao dịch thất bại!");
        } finally {
            setIsProcessing(false);
        }
    };

    const removeCartItem = (documentId) => {
        if (cart !== null && documentId in cart) {
            if (window.confirm("Bạn muốn bỏ học liệu này khỏi danh sách đăng ký gia hạn?")) {
                let updatedCart = { ...cart };
                delete updatedCart[documentId]; 
                
                if (Object.keys(updatedCart).length === 0) updatedCart = null;

                setCart(updatedCart);
                if (updatedCart === null) cookies.remove('cart');
                else cookies.save('cart', updatedCart);
                
                cartDispatch({ "type": "UPDATE" });
                toast.info("Đã cập nhật lại danh sách.");
            }
        }
    }

    return (
        <div className="mx-auto mt-4 mb-5" style={{ maxWidth: "1050px" }}>
            <h2 className="text-center text-success mb-4 fw-bold">📋 PHIẾU ĐĂNG KÝ GIA HẠN TRUY CẬP</h2>

            {cart === null || Object.keys(cart).length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                    Chưa có yêu cầu gia hạn học liệu nào trong phiếu đăng ký! <br/>
                    <Link to="/documents" className="alert-link fw-bold">Quay lại kho học liệu để lựa chọn</Link>
                </Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive className="shadow-sm bg-white align-middle">
                        <thead className="table-success">
                            <tr>
                                <th className="text-center" style={{ width: "8%" }}>Mã HL</th>
                                <th style={{ width: "25%" }}>Tên học liệu số</th>
                                <th style={{ width: "20%" }}>Gói thời hạn gia hạn</th>
                                <th style={{ width: "22%" }}>Thời gian truy cập cập nhật</th>
                                <th style={{ width: "15%" }}>Phí gói tương ứng</th>
                                <th className="text-center" style={{ width: "10%" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(cart).map(item => (
                                <tr key={item.id}>
                                    <td className="text-center fw-bold text-secondary">#{item.id}</td>
                                    <td className="fw-bold text-primary">{item.name}</td>
                                    
                                    {/* Ô CHỌN THAY ĐỔI GÓI NGAY TRÊN DÒNG CỦA BẢNG */}
                                    <td>
                                        <Form.Select 
                                            size="sm" 
                                            value={item.durationDays} 
                                            onChange={(e) => handlePackageUpdateInCart(item.id, e.target.value, item.startDate)}
                                            className="border-success fw-semibold"
                                        >
                                            <option value="7">Gói 1 tuần (7 ngày)</option>
                                            <option value="30">Gói 1 tháng (30 ngày)</option>
                                            <option value="90">Gói 1 học kỳ (90 ngày)</option>
                                            <option value="365">Sở hữu vĩnh viễn</option>
                                        </Form.Select>
                                    </td>

                                    {/* Ô CHỌN THAY ĐỔI NGÀY BẮT ĐẦU VÀ TỰ ĐỘNG HIỂN THỊ NGÀY HẾT HẠN */}
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <div className="d-flex align-items-center gap-1">
                                                <span className="text-nowrap small text-muted">Từ:</span>
                                                <Form.Control 
                                                    type="date" 
                                                    size="sm"
                                                    min={new Date().toISOString().split("T")[0]}
                                                    value={item.startDate}
                                                    onChange={(e) => handlePackageUpdateInCart(item.id, item.durationDays, e.target.value)}
                                                    className="p-1 border-success style-sm"
                                                    disabled={item.durationDays === "365"}
                                                />
                                            </div>
                                            <div className="small text-muted">
                                                ⏳ Đến: <span className="fw-bold text-danger">{item.expiryDate}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* PHÍ THAY ĐỔI REAL-TIME */}
                                    <td className="fw-bold text-dark fs-6">
                                        {item.price === 0 ? (
                                            <Badge bg="success" className="p-2">0 đ (Miễn phí)</Badge>
                                        ) : (
                                            <span className="text-danger">{item.price.toLocaleString()} đ</span>
                                        )}
                                    </td>
                                    
                                    <td className="text-center">
                                        <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => removeCartItem(item.id)}>
                                             Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Alert variant="warning" className="d-flex justify-content-between align-items-center shadow-sm mt-3">
                        <div className="mb-0">
                            <h5>Tổng số lượng học liệu cấu hình: <span className="text-danger fw-bold">{c.totalQuantity}</span></h5>
                            <h5>Tổng chi phí gia hạn cần trả: <span className="text-danger fw-bold">{c.totalAmount.toLocaleString()} VNĐ</span></h5>
                        </div>
                    </Alert>

                    <div className="text-end">
                        {user === null ? (
                            <Alert variant="danger" className="d-inline-block text-start shadow-sm">
                                Vui lòng <Link to="/login?next=/cart" className="alert-link fw-bold">đăng nhập tài khoản</Link> để hoàn tất đăng ký!
                            </Alert>
                        ) : (
                            <Button onClick={handleConfirmClick} className="px-5 py-2 fw-bold" variant="success" size="lg">
                                Xác nhận gửi phiếu gia hạn
                            </Button>
                        )}
                    </div>

                    {/* MODAL CỔNG THANH TOÁN TRỰC TUYẾN */}
                    <Modal show={showPayment} onHide={() => !isProcessing && setShowPayment(false)} backdrop="static" centered>
                        <Modal.Header closeButton={!isProcessing} className="bg-success text-white">
                            <Modal.Title className="fw-bold">💳 Cổng Thanh Toán Phí Gia Hạn</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <p className="text-muted text-center mb-1">Hệ thống tính toán phí bản quyền dựa trên gói thời gian bạn đã chọn.</p>
                            <h3 className="text-center text-danger fw-bold mb-4">
                                Tổng tiền: {c.totalAmount.toLocaleString()} VNĐ
                            </h3>
                            
                            <Row className="g-3">
                                <Col xs={12}>
                                    <Card 
                                        className={`border ${paymentMethod === 'CASH' ? 'border-success bg-light shadow-sm' : 'border-secondary-subtle'}`}
                                        onClick={() => setPaymentMethod('CASH')}
                                        style={{ cursor: "pointer", transition: "0.2s" }}
                                    >
                                        <Card.Body className="d-flex align-items-center p-3">
                                            <Form.Check type="radio" checked={paymentMethod === 'CASH'} readOnly className="me-3 fs-5" />
                                            <div>
                                                <h6 className="mb-0 fw-bold">Thanh toán tiền mặt trực tiếp</h6>
                                                <small className="text-muted">Đóng tiền tại bàn làm việc của Thủ thư để kích hoạt</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12}>
                                    <Card 
                                        className={`border ${paymentMethod === 'MOMO' ? 'border-success bg-light shadow-sm' : 'border-secondary-subtle'}`}
                                        onClick={() => setPaymentMethod('MOMO')}
                                        style={{ cursor: "pointer", transition: "0.2s" }}
                                    >
                                        <Card.Body className="d-flex align-items-center p-3">
                                            <Form.Check type="radio" checked={paymentMethod === 'MOMO'} readOnly className="me-3 fs-5" />
                                            <div>
                                                <h6 className="mb-0 fw-bold text-danger">Ví điện tử MoMo</h6>
                                                <small className="text-muted">Quét mã QR tự động qua ứng dụng MoMo</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12}>
                                    <Card 
                                        className={`border ${paymentMethod === 'VNPAY' ? 'border-success bg-light shadow-sm' : 'border-secondary-subtle'}`}
                                        onClick={() => setPaymentMethod('VNPAY')}
                                        style={{ cursor: "pointer", transition: "0.2s" }}
                                    >
                                        <Card.Body className="d-flex align-items-center p-3">
                                            <Form.Check type="radio" checked={paymentMethod === 'VNPAY'} readOnly className="me-3 fs-5" />
                                            <div>
                                                <h6 className="mb-0 fw-bold text-primary">Cổng thanh toán VNPay</h6>
                                                <small className="text-muted">Kết nối ứng dụng Ngân hàng quét mã QR-Pay</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="justify-content-center">
                            <Button variant="outline-secondary" className="px-4" onClick={() => setShowPayment(false)} disabled={isProcessing}>
                                Hủy giao dịch
                            </Button>
                            <Button variant="success" className="px-5 fw-bold" onClick={processCheckout} disabled={isProcessing}>
                                {isProcessing ? "Đang xử lý giao dịch..." : "Tiến hành thanh toán"}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default Cart;