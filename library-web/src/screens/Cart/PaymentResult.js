import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Alert, Button } from "react-bootstrap";
import cookies from "react-cookies";
import MySpinner from "../../components/MySpinner";
import { MyCartContext } from "../../configs/Contexts";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const PaymentResult = () => {
    const [q] = useSearchParams();
    const nav = useNavigate();
    const [status, setStatus] = useState("PROCESSING"); 
    
    // 👉 1. Khai báo Context để reset số lượng giỏ hàng trên Header về 0
    const [, cartDispatch] = useContext(MyCartContext); 
    
    // Biến cờ này giúp ngăn chặn React 18 gọi API 2 lần liên tiếp (gây lỗi nhân đôi dữ liệu)
    const isProcessed = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            // Tránh gọi lại API nhiều lần khi re-render
            if (isProcessed.current) return;
            isProcessed.current = true;

            const payload = {};
            for (const [key, value] of q.entries()) {
                payload[key] = value;
            }

            try {
                // BƯỚC 1: Xác nhận với Backend xem VNPay có thực sự thành công không
                let res = await authApis().post('/transactions/vnpay-return', payload);
                
                if (res.status === 200) {
                    // BƯỚC 2: Lấy giỏ hàng đang lưu trong máy tính
                    const currentCart = cookies.load('cart');
                    
                    if (currentCart && Object.keys(currentCart).length > 0) {
                        // Gửi giỏ hàng xuống API để tạo Phiếu Mượn (Cấp quyền đọc sách)
                        await authApis().post(endpoints['borrows'], currentCart);
                        
                        // BƯỚC 3: Xóa giỏ hàng và cập nhật Header
                        cookies.remove('cart');
                        cartDispatch({ type: "UPDATE" }); // Báo cho hệ thống biết giỏ hàng đã rỗng
                    }
                    
                    setStatus("SUCCESS");
                }
            } catch (error) {
                console.error("Lỗi giao dịch:", error);
                setStatus("FAILED");
            }
        };

        verifyPayment();
    }, [q, cartDispatch]); // Đưa dependencies vào để tránh cảnh báo của React

    return (
        <Container className="mt-5 text-center" style={{ maxWidth: "600px" }}>
            {status === "PROCESSING" && (
                <div>
                    <MySpinner />
                    <h4 className="mt-3 text-secondary">Đang xử lý kết quả giao dịch và cấp phát tài liệu...</h4>
                </div>
            )}

            {status === "SUCCESS" && (
                <Alert variant="success" className="shadow-sm">
                    <Alert.Heading className="fw-bold">🎉 Thanh toán & Nhận sách thành công!</Alert.Heading>
                    <p>Hệ thống đã ghi nhận thanh toán và tài liệu đã được thêm vào tủ sách cá nhân của bạn.</p>
                    <hr />
                    <Button variant="success" onClick={() => nav("/profile")}>Vào tủ sách cá nhân</Button>
                </Alert>
            )}

            {status === "FAILED" && (
                <Alert variant="danger" className="shadow-sm">
                    <Alert.Heading className="fw-bold">❌ Giao dịch thất bại hoặc bị hủy</Alert.Heading>
                    <p>Hệ thống chưa ghi nhận khoản thanh toán nào. Vui lòng thử lại sau.</p>
                    <hr />
                    <Button variant="danger" onClick={() => nav("/cart")}>Quay lại giỏ hàng</Button>
                </Alert>
            )}
        </Container>
    );
};

export default PaymentResult;