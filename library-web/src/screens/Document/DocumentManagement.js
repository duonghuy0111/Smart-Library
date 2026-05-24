import { useContext, useEffect, useState } from "react";
import { Alert, Button, Table, Container, Card } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";

const DocumentManagement = () => {
    const [user] = useContext(MyUserContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState("");
    const nav = useNavigate();

    // Hàm tải danh sách tài liệu dành cho trang quản lý
    const loadDocuments = async () => {
        try {
            setLoading(true);
            setErr("");

            // --- CODE API THẬT (Tạm ẩn để phục vụ test UI) ---
            /*
            let res = await Apis.get(endpoints['documents']);
            setDocuments(res.data);
            */

            // === BẮT ĐẦU: MOCK DATA ĐỂ TEST GIAO DIỆN ===
            await new Promise(resolve => setTimeout(resolve, 600)); // Giả lập mạng load
            const mockData = [
                { id: 1, name: "Giáo trình Lập trình Java", author: "Nguyễn Văn A", publishYear: 2023, price: 0 },
                { id: 2, name: "Cấu trúc dữ liệu và Giải thuật", author: "Trần Thị B", publishYear: 2022, price: 50000 },
                { id: 3, name: "Mạng máy tính cơ bản", author: "Lê Văn C", publishYear: 2021, price: 0 },
                { id: 4, name: "Phát triển Web với React", author: "Phạm D", publishYear: 2024, price: 100000 }
            ];
            setDocuments(mockData);
            // === KẾT THÚC: MOCK DATA ===

        } catch (ex) {
            console.error(ex);
            setErr("Không thể tải danh sách tài liệu từ hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.role === "LIBRARIAN" || user.role === "ADMIN")) {
            loadDocuments();
        }
    }, [user]);

    // Kỹ thuật xử lý Xóa tài liệu dùng window.confirm giống bài của thầy
    const deleteDocument = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${name}" không?`) === true) {
            try {
                setLoading(true);
                setSuccess("");
                setErr("");

                // --- CODE API THẬT (Tạm ẩn) ---
                /*
                // Gọi đến API secure xóa tài liệu (Sử dụng cấu trúc template string của axios)
                let res = await authApis().delete(`${endpoints['documents']}/${id}`);
                if (res.status === 204 || res.status === 200) {
                    setDocuments(documents.filter(d => d.id !== id));
                    setSuccess("Xóa tài liệu thành công!");
                }
                */

                // === BẮT ĐẦU: GIẢ LẬP XÓA TRÊN UI ===
                await new Promise(resolve => setTimeout(resolve, 500));
                setDocuments(documents.filter(d => d.id !== id)); // Lọc bỏ item vừa xóa khỏi danh sách hiện tại
                setSuccess(`Đã xóa thành công tài liệu: ${name} (Dữ liệu giả lập)`);
                // === KẾT THÚC: GIẢ LẬP XÓA ===

            } catch (ex) {
                console.error(ex);
                setErr("Có lỗi xảy ra khi thực hiện xóa tài liệu!");
            } finally {
                setLoading(false);
            }
        }
    };

    // Chặn quyền truy cập (Role Guard) giống trang AddDocument
    if (user === null || (user.role !== "LIBRARIAN" && user.role !== "ADMIN")) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">
                    <Alert.Heading>Quyền truy cập bị từ chối</Alert.Heading>
                    <p>Chỉ có Thủ thư hoặc Quản trị viên mới được phép vào phân hệ này.</p>
                    <Button variant="outline-danger" onClick={() => nav("/")}>Quay về trang chủ</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center py-3">
                    <h4 className="mb-0">HỆ THỐNG QUẢN LÝ HỌC LIỆU</h4>
                    <Button variant="light" className="fw-bold text-success shadow-sm" onClick={() => nav("/admin/add-document")}>
                        ➕ Thêm tài liệu mới
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">
                    {err && <Alert variant="danger">{err}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {loading && documents.length === 0 ? (
                        <div className="text-center py-4"><MySpinner /></div>
                    ) : documents.length === 0 ? (
                        <Alert variant="info" className="text-center">Hiện chưa có tài liệu nào trong hệ thống.</Alert>
                    ) : (
                        <Table striped bordered hover responsive className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "80px" }}>Mã số</th>
                                    <th>Tên tài liệu / Học liệu</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: "120px" }}>Năm XB</th>
                                    <th>Phí mượn</th>
                                    <th style={{ width: "160px" }} className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(d => (
                                    <tr key={d.id}>
                                        <td className="fw-bold">#{d.id}</td>
                                        <td className="fw-bold text-primary">{d.name}</td>
                                        <td>{d.author}</td>
                                        <td>{d.publishYear}</td>
                                        <td>
                                            {d.price === 0 ? (
                                                <span className="text-success fw-semibold">Miễn phí</span>
                                            ) : (
                                                <span className="text-danger fw-semibold">{d.price.toLocaleString()} VNĐ</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {/* Nút Sửa: Điều hướng sang trang sửa kèm theo mã ID tài liệu */}
                                            <Button 
                                                variant="outline-warning" 
                                                size="sm" 
                                                className="me-2 fw-semibold"
                                                onClick={() => nav(`/admin/edit-document/${d.id}`)}
                                            >
                                                Sửa
                                            </Button>
                                            {/* Nút Xóa: Kích hoạt hàm xác nhận xóa */}
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                className="fw-semibold"
                                                onClick={() => deleteDocument(d.id, d.name)}
                                            >
                                                Xóa
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DocumentManagement;