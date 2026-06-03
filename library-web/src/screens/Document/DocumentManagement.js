import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MySpinner from "../../components/MySpinner";
import { toast } from "react-toastify";
import Apis, { authApis, endpoints } from "../../configs/Apis";

// 👉 IMPORT COMPONENT PHÂN TRANG
import MyPagination from "../../components/MyPagination"; 

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCateId, setSelectedCateId] = useState("");
    const nav = useNavigate();

    // 👉 STATE CHO PHÂN TRANG
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 1. Tải danh mục 1 lần duy nhất khi vào trang
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                let cateRes = await Apis.get(endpoints['categories']);
                setCategories(cateRes.data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Tải danh sách sách MỖI KHI đổi Trang hoặc đổi Danh mục lọc
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                // Truyền cả page và categoryId xuống cho Backend lo việc lọc và cắt trang
                let url = `${endpoints['documents']}?page=${page}`;
                if (selectedCateId) {
                    url += `&categoryId=${selectedCateId}`;
                }

                let docRes = await Apis.get(url);
                
                // 👉 BÓC TÁCH DỮ LIỆU TỪ MAP
                setDocuments(docRes.data.content || docRes.data);
                setTotalPages(docRes.data.totalPages || 1);

            } catch (error) {
                console.error(error);
                toast.error("Không thể tải dữ liệu kho sách!");
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [page, selectedCateId]);

    // Trở về trang 1 tự động nếu người dùng đổi chuyên ngành khác
    useEffect(() => {
        setPage(1);
    }, [selectedCateId]);

    const handleDelete = async (id, docName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${docName}" khỏi kho không?`)) {
            try {
                await authApis().delete(endpoints['delete-document'](id));
                // Xóa khỏi UI tạm thời, hoặc bạn có thể gọi lại hàm fetchDocuments() để lấy lại data mới
                setDocuments(documents.filter(doc => doc.id !== id));
                toast.success("Đã xóa tài liệu thành công!");
            } catch (ex) {
                toast.error("Xóa thất bại! Vui lòng kiểm tra lại quyền hoặc ràng buộc dữ liệu.");
            }
        }
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
                <h2 className="text-success mb-0">📚 QUẢN LÝ KHO HỌC LIỆU SỐ</h2>
                <Button variant="success" className="fw-bold" onClick={() => nav("/admin/add-document")}>
                    ➕ Thêm tài liệu mới
                </Button>
            </div>

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
                    </Form.Group>
                </Card.Body>
            </Card>

            {loading ? <div className="text-center mt-5"><MySpinner /></div> : (
                <>
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
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">Không có tài liệu nào thuộc chuyên ngành này.</td>
                                    </tr>
                                ) : (
                                    documents.map((doc, index) => (
                                        <tr key={doc.id}>
                                            <td className="text-center align-middle">{(page - 1) * 12 + index + 1}</td>
                                            <td className="fw-bold text-primary align-middle">{doc.name || doc.title}</td>
                                            <td className="align-middle text-dark">{doc.author}</td>
                                            <td className="text-center align-middle">{doc.publishYear}</td>
                                            <td className="align-middle fw-semibold">
                                                {doc.price === 0 ? <span className="text-success">Miễn phí</span> : <span className="text-danger">{doc.price.toLocaleString()} đ</span>}
                                            </td>
                                            <td className="text-center align-middle">
                                                <Button variant="outline-warning" size="sm" className="me-2 fw-semibold" onClick={() => nav(`/admin/edit-document/${doc.id}`)}>Sửa</Button>
                                                <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDelete(doc.id, doc.name || doc.title)}>Xóa</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* 👉 CHÈN THANH PHÂN TRANG */}
                    <MyPagination 
                        currentPage={page} 
                        totalPages={totalPages} 
                        onPageChange={setPage} 
                    />
                </>
            )}
        </Container>
    );
};

export default DocumentManagement;