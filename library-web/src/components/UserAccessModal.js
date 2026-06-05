import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

const UserAccessModal = ({ show, onHide, document, onConfirm }) => {
    // 1. Lấy ngày hôm nay làm ngày bắt đầu mặc định (Định dạng YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    
    const [startDate, setStartDate] = useState(today);
    const [selectedPackage, setSelectedPackage] = useState("7"); // Mặc định gói 7 ngày
    const [estimatedExpiry, setEstimatedExpiry] = useState("");
    const [finalPrice, setFinalPrice] = useState(0);

    // 2. Định nghĩa cấu hình các gói thời gian và hệ số nhân giá
    const pricePackages = [
        { days: 7, label: "Gói 1 tuần (7 ngày)", priceRate: 0.2 },     
        { days: 30, label: "Gói 1 tháng (30 ngày)", priceRate: 0.5 },   
        { days: 90, label: "Gói 1 học kỳ (90 ngày)", priceRate: 0.8 },  
        { days: 365, label: "Sở hữu vĩnh viễn", priceRate: 1.0 }       
    ];

    // 3. Tự động tính toán ngày hết hạn và giá tiền khi người dùng thay đổi lựa chọn
    useEffect(() => {
        if (!document) return;

        // Tính giá tiền dựa theo gói đã chọn
        const pkg = pricePackages.find(p => p.days === parseInt(selectedPackage));
        if (document.price === 0) {
            setFinalPrice(0); // Học liệu miễn phí thì gói nào cũng 0đ
        } else {
            const calculatedPrice = document.price * (pkg ? pkg.priceRate : 1);
            setFinalPrice(calculatedPrice);
        }

        // Tính ngày hết hạn hiển thị cho người dùng (Chỉ để nhìn trên UI)
        if (selectedPackage === "365") {
            setEstimatedExpiry("Không giới hạn (Vĩnh viễn)");
        } else if (startDate) {
            let resultDate = new Date(startDate);
            resultDate.setDate(resultDate.getDate() + parseInt(selectedPackage));
            setEstimatedExpiry(resultDate.toISOString().split("T")[0]);
        }
    }, [startDate, selectedPackage, document]);

    const handleSubmit = () => {
        if (!startDate) {
            toast.error("Vui lòng chọn ngày bắt đầu truy cập!");
            return;
        }

        let expiryDateToSend;
        let durationDaysToSend;

        // XỬ LÝ DỮ LIỆU ĐỂ GỬI XUỐNG BACKEND
        if (selectedPackage === "365") {
            // Nếu là vĩnh viễn: Ép cứng hạn là năm 2100 chuẩn ISO 8601
            expiryDateToSend = new Date("2100-01-01T00:00:00Z").toISOString();
            durationDaysToSend = 99999; 
        } else {
            // Nếu là gói thường: Cộng ngày và ép chuẩn ISO 8601
            let resultDate = new Date(startDate);
            resultDate.setDate(resultDate.getDate() + parseInt(selectedPackage));
            expiryDateToSend = resultDate.toISOString(); 
            durationDaysToSend = parseInt(selectedPackage);
        }

        // Truyền toàn bộ dữ liệu gói đã chọn ngược lại cho trang xử lý thanh toán
        onConfirm({
            documentId: document.id,
            documentName: document.title || document.name, // Lấy dự phòng 2 trường
            startDate: new Date(startDate).toISOString(), // Chuẩn hóa luôn startDate
            durationDays: durationDaysToSend,
            expiryDate: expiryDateToSend,
            price: finalPrice
        });
        
        onHide();
    };

    if (!document) return null;

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title className="fw-bold">🔑 Đăng ký thời gian truy cập</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="mb-4 text-center">
                    <h5 className="fw-bold text-primary mb-1">{document.title || document.name}</h5>
                    <small className="text-muted">Tác giả: {document.author}</small>
                </div>

                {/* KHU VỰC 1: CHỌN NGÀY BẮT ĐẦU */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">📅 Chọn ngày kích hoạt truy cập:</Form.Label>
                    <Form.Control 
                        type="date" 
                        min={today} 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="border-success"
                    />
                    <Form.Text className="text-muted">
                        Quyền đọc tài liệu số sẽ tự động mở từ ngày này.
                    </Form.Text>
                </Form.Group>

                {/* KHU VỰC 2: CHỌN GÓI THỜI GIAN VÀ XEM GIÁ */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">⏱️ Chọn gói thời hạn & Phí bản quyền:</Form.Label>
                    <Row className="g-2">
                        {pricePackages.map((pkg) => {
                            const pkgPrice = document.price === 0 ? 0 : document.price * pkg.priceRate;
                            return (
                                <Col xs={12} key={pkg.days}>
                                    <Card 
                                        className={`border p-2 cursor-pointer ${selectedPackage === pkg.days.toString() ? 'border-success bg-light shadow-sm' : 'border-light-subtle'}`}
                                        onClick={() => setSelectedPackage(pkg.days.toString())}
                                        style={{ cursor: "pointer", transition: "0.2s" }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center px-2">
                                            <div className="d-flex align-items-center">
                                                <Form.Check 
                                                    type="radio" 
                                                    checked={selectedPackage === pkg.days.toString()} 
                                                    readOnly 
                                                    className="me-2"
                                                />
                                                <span className="fw-semibold">{pkg.label}</span>
                                            </div>
                                            <span className={`fw-bold ${pkgPrice === 0 ? 'text-success' : 'text-danger'}`}>
                                                {pkgPrice === 0 ? "Miễn phí" : `${pkgPrice.toLocaleString()} đ`}
                                            </span>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </Form.Group>

                {/* KHU VỰC 3: TỔNG KẾT LUỒNG DỮ LIỆU */}
                <Card className="bg-success bg-opacity-10 border-0 p-3 rounded">
                    <Row className="small text-dark">
                        <Col xs={6} className="mb-1">Ngày bắt đầu:</Col>
                        <Col xs={6} className="text-end fw-bold mb-1">{startDate}</Col>
                        
                        <Col xs={6} className="mb-1">Hạn truy cập đến:</Col>
                        <Col xs={6} className="text-end fw-bold text-danger mb-1">{estimatedExpiry}</Col>
                        
                        <Col xs={6} className="border-top pt-2 fs-6 fw-bold">Tổng chi phí:</Col>
                        <Col xs={6} className="text-end border-top pt-2 fs-5 fw-bold text-danger">
                            {finalPrice.toLocaleString()} VNĐ
                        </Col>
                    </Row>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Hủy</Button>
                <Button variant="success" className="fw-bold px-4" onClick={handleSubmit}>
                    Xác nhận chọn gói
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserAccessModal;