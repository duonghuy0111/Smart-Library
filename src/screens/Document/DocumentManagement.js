import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MySpinner from "../../components/MySpinner";
import { toast } from "react-toastify";
// Khi kết nối Backend thật sẽ dùng:
// import Apis, { authApis, endpoints } from "../../configs/Apis";

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State lưu chuyên ngành đang được chọn để lọc (Mặc định "" là hiển thị tất cả)
    const [selectedCateId, setSelectedCateId] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 600)); // Giả lập chờ mạng

                // 1. Dữ liệu giả định Chuyên ngành (Khớp với Header)
                setCategories([
                    { id: 1, name: "Công nghệ thông tin" },
                    { id: 2, name: "Kinh tế học" },
                    { id: 3, name: "Khoa học xã hội" }
                ]);

                // 2. Dữ liệu giả định Học liệu (Khớp với Home)
                setDocuments([
                    { id: 1, name: "Giáo trình Lập trình Java", author: "Nguyễn Văn A", publishYear: 2023, price: 0, categoryId: 1 },
                    { id: 2, name: "Cấu trúc dữ liệu và Giải thuật", author: "Trần Thị B", publishYear: 2022, price: 50000, categoryId: 1 },
                    { id: 3, name: "Mạng máy tính cơ bản", author: "Lê Văn C", publishYear: 2021, price: 0, categoryId: 1 },
                    { id: 4, name: "Nhập môn Kinh tế học", author: "Phạm D", publishYear: 2023, price: 100000, categoryId: 2 },
                    { id: 5, name: "Phát triển Web với React", author: "Hoàng E", publishYear: 2024, price: 0, categoryId: 1 }
                ]);

            } catch (error) {
                console.error(error);
                toast.error("Không thể tải dữ liệu kho sách!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Xử lý Xóa học liệu
    const handleDelete = async (id, docName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${docName}" khỏi kho không?`)) {
            // --- CODE API XÓA THẬT ---
            // await authApis().delete(endpoints['delete-document'](id));
            
            setDocuments(documents.filter(doc => doc.id !== id));
            toast.success("Đã xóa tài liệu thành công!");
        }
    };

    // LOGIC LỌC: Nếu selectedCateId có giá trị thì lọc theo chuyên ngành, ngược lại lấy tất cả
    const filteredDocuments = selectedCateId 
        ? documents.filter(doc => doc.categoryId === parseInt(selectedCateId))
        : documents;

    if (loading) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
                <h2 className="text-success mb-0">📚 QUẢN LÝ KHO HỌC LIỆU SỐ</h2>
                <Button variant="success" className="fw-bold" onClick={() => nav("/admin/add-document")}>
                    ➕ Thêm tài liệu mới
                </Button>
            </div>

            {/* THANH BỘ LỌC THEO CHUYÊN NGÀNH */}
            <Card className="mb-4 bg-light border shadow-sm">
                <Card.Body className="p-3">
                    <Form.Group as={Row} className="align-items-center mb-0">
                        <Form.Label column sm={3} md={2} className="fw-bold text-dark text-nowrap">
                            Lọc theo ngành:
                        </Form.Label>
                        <Col sm={9} md={5}>
                            <Form.Select 
                                value={selectedCateId} 
                                onChange={(e) => setSelectedCateId(e.target.value)}
                                className="border-success"
                            >
                                <option value="">—— Hiển thị tất cả chuyên ngành ——</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        {selectedCateId && (
                            <Col sm={12} md={5} className="mt-2 mt-md-0">
                                <Badge bg="info" className="p-2 fs-6">
                                    Tìm thấy {filteredDocuments.length} tài liệu phù hợp
                                </Badge>
                            </Col>
                        )}
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* BẢNG DANH SÁCH TÀI LIỆU SAU KHI LỌC */}
            <div className="shadow-sm rounded border overflow-hidden">
                <Table striped hover responsive className="mb-0 bg-white">
                    <thead className="table-success">
                        <tr>
                            <th className="text-center" style={{ width: "6%" }}>STT</th>
                            <th style={{ width: "35%" }}>Tên tài liệu</th>
                            <th style={{ width: "20%" }}>Tác giả</th>
                            <th className="text-center" style={{ width: "12%" }}>Năm XB</th>
                            <th style={{ width: "12%" }}>Phí mượn</th>
                            <th className="text-center" style={{ width: "15%" }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    Không có tài liệu nào thuộc chuyên ngành này.
                                         </td>
                            </tr>
                        ) : (
                            filteredDocuments.map((doc, index) => (
                                <tr key={doc.id}>
                                    <td className="text-center align-middle">{index + 1}</td>
                                    <td className="fw-bold text-primary align-middle">{doc.name}</td>
                                    <td className="align-middle text-dark">{doc.author}</td>
                                    <td className="text-center align-middle">{doc.publishYear}</td>
                                    <td className="align-middle fw-semibold">
                                        {doc.price === 0 ? (
                                            <span className="text-success">Miễn phí</span>
                                        ) : (
                                            <span className="text-danger">{doc.price.toLocaleString()} đ</span>
                                        )}
                                    </td>
                                    <td className="text-center align-middle">
                                        <Button 
                                            variant="outline-warning" 
                                            size="sm" 
                                            className="me-2 fw-semibold"
                                            onClick={() => nav(`/admin/edit-document/${doc.id}`)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            className="fw-semibold"
                                            onClick={() => handleDelete(doc.id, doc.name)}
                                        >
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default DocumentManagement;