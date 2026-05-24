import { useContext, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import cookies from 'react-cookies'
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { Link } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const Cart = () => {
    // Lấy giỏ hàng từ cookie
    const [cart, setCart] = useState(cookies.load('cart') || null);
    const [user, ] = useContext(MyUserContext);
    const [c, cartDispatch] = useContext(MyCartContext);

    // Hàm Xác nhận mượn (Thay thế cho hàm pay)
    const confirmBorrow = async () => {
        if (window.confirm('Bạn chắc chắn muốn xác nhận mượn các tài liệu này?') === true) {
            let currentCart = cookies.load('cart') || null;
            if (currentCart !== null) {
                try {
                    // --- BẮT ĐẦU: CODE GỌI API THẬT (Comment tạm) ---
                    /*
                    let res = await authApis().post(endpoints['borrow'], Object.values(currentCart));
                    if (res.status === 201) {
                        setCart(null);
                        cartDispatch({ "type": "PAID" }); // Dùng chung type PAID để reset số lượng về 0
                        alert("Mượn tài liệu thành công!");
                    }
                    */
                    // --- KẾT THÚC CODE API THẬT ---

                    // === BẮT ĐẦU: GIẢ LẬP ĐỂ TEST GIAO DIỆN ===
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setCart(null); // Xóa state
                    cookies.remove('cart'); // Xóa cookie
                    cartDispatch({ "type": "PAID" }); // Reset context (Header cập nhật về 0)
                    alert("Xác nhận mượn tài liệu thành công! Bạn có thể xem trong lịch sử mượn.");
                    // === KẾT THÚC GIẢ LẬP ===

                } catch (ex) {
                    console.error("Lỗi khi mượn sách:", ex);
                    alert("Có lỗi xảy ra, vui lòng thử lại sau!");
                }
            }
        }
    }

    // Hàm cập nhật số lượng
    const updateCartItem = (e, documentId) => {
        if (cart !== null && documentId in cart) {
            let updatedCart = {...cart, [documentId]: {
                ...cart[documentId],
                'quantity': parseInt(e.target.value)
            }};
            setCart(updatedCart);
            cookies.save('cart', updatedCart);
            cartDispatch({ "type": "UPDATE" });
        }
    }

    // BỔ SUNG: Hàm Xóa tài liệu khỏi phiếu mượn (Thầy chưa viết)
    const removeCartItem = (documentId) => {
        if (cart !== null && documentId in cart) {
            if (window.confirm("Bạn muốn xóa tài liệu này khỏi phiếu mượn?")) {
                let updatedCart = { ...cart };
                delete updatedCart[documentId]; // Xóa phần tử khỏi Object
                
                // Nếu xóa hết thì set về null để hiện câu thông báo
                if (Object.keys(updatedCart).length === 0) {
                    updatedCart = null;
                }

                setCart(updatedCart);
                if (updatedCart === null) {
                    cookies.remove('cart');
                } else {
                    cookies.save('cart', updatedCart);
                }
                cartDispatch({ "type": "UPDATE" });
            }
        }
    }

    return (
        <div className="mx-auto mt-4" style={{ maxWidth: "900px" }}>
            <h2 className="text-center text-success mb-4">PHIẾU MƯỢN TÀI LIỆU</h2>

            {cart === null || Object.keys(cart).length === 0 ? (
                <Alert variant="info" className="text-center">
                    Bạn chưa chọn tài liệu nào để mượn! <br/>
                    <Link to="/documents" className="alert-link">Quay lại danh mục để chọn tài liệu</Link>
                </Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive className="shadow-sm bg-white">
                        <thead className="table-success">
                            <tr>
                                <th>Mã TL</th>
                                <th>Tên tài liệu</th>
                                <th>Phí mượn</th>
                                <th>Số lượng</th>
                                <th className="text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(cart).map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td className="fw-bold text-primary">{c.name}</td>
                                    <td>{c.price === 0 ? <span className="text-success">Miễn phí</span> : `${c.price.toLocaleString()} VNĐ`}</td>
                                    <td style={{ width: "120px" }}>
                                        <Form.Control 
                                            type="number" 
                                            min="1" 
                                            value={c.quantity} 
                                            onChange={e => updateCartItem(e, c.id)} 
                                        />
                                    </td>
                                    <td className="text-center">
                                        <Button variant="danger" size="sm" onClick={() => removeCartItem(c.id)}>
                                            &times;
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Alert variant="warning" className="d-flex justify-content-between align-items-center">
                        <div className="mb-0">
                            <h5>Tổng số lượng: <span className="text-danger fw-bold">{c.totalQuantity}</span> cuốn</h5>
                            <h5>Tổng phí mượn: <span className="text-danger fw-bold">{c.totalAmount.toLocaleString()} VNĐ</span></h5>
                        </div>
                    </Alert>

                    <div className="text-end">
                        {user === null ? (
                            <Alert variant="danger" className="d-inline-block text-start">
                                Vui lòng <Link to="/login?next=/cart" className="alert-link fw-bold">đăng nhập</Link> để có thể xác nhận mượn!
                            </Alert>
                        ) : (
                            <Button onClick={confirmBorrow} className="px-5 py-2 fw-bold" variant="success">
                                Xác nhận mượn
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;