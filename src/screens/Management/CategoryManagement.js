import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table, Card, Alert } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import { toast } from 'react-toastify';
// Khi ráp Backend thật sẽ dùng đến:
// import Apis, { authApis, endpoints } from "../../configs/Apis";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Form nhập liệu
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    
    // State xử lý trạng thái Sửa (Edit)
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Hàm tải danh sách chuyên ngành
    const loadCategories = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập mạng
            
            // Mock data khớp với danh mục ở Header
            setCategories([
                { id: 1, name: "Công nghệ thông tin", description: "Các học liệu về Lập trình, Mạng máy tính, An toàn thông tin..." },
                { id: 2, name: "Kinh tế học", description: "Sách giáo trình về Kinh tế vi mô, vĩ mô, Quản trị kinh doanh..." },
                { id: 3, name: "Khoa học xã hội", description: "Tài liệu lịch sử, tâm lý học, ngôn ngữ văn hóa..." }
            ]);
        } catch (ex) {
            console.error(ex);
            toast.error("Không thể tải danh mục chuyên ngành!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Xử lý Thêm hoặc Cập nhật chuyên ngành
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (isEditing) {
            // --- LOGIC CẬP NHẬT (PUT API) ---
            // let res = await authApis().put(endpoints['edit-category'](editId), { name, description });
            
            setCategories(categories.map(cat => 
                cat.id === editId ? { ...cat, name, description } : cat
            ));
            toast.success("Cập nhật chuyên ngành thành công!");
            cancelEdit();
        } else {
            // --- LOGIC THÊM MỚI (POST API) ---
            // let res = await authApis().post(endpoints['add-category'], { name, description });
            
            const newCat = {
                id: Date.now(), // Tạo ID tạm thời
                name,
                description
            };
            setCategories([...categories, newCat]);
            toast.success("Thêm chuyên ngành mới thành công!");
            setName("");
            setDescription("");
        }
    };

    // Khi bấm vào nút Sửa trên bảng
    const handleEditClick = (cat) => {
        setIsEditing(true);
        setEditId(cat.id);
        setName(cat.name);
        setDescription(cat.description || "");
    };

    // Hủy trạng thái sửa, xóa trắng form
    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setName("");
        setDescription("");
    };

    // Xử lý xóa chuyên ngành
    const handleDelete = async (id, catName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa chuyên ngành "${catName}"?`)) {
            // --- LOGIC XÓA (DELETE API) ---
            // await authApis().delete(endpoints['delete-category'](id));
            
            setCategories(categories.filter(cat => cat.id !== id));
            toast.success("Đã xóa chuyên ngành!");
            if (editId === id) cancelEdit();
        }
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">🗂️ QUẢN LÝ DANH MỤC CHUYÊN NGÀNH</h2>
            
            <Row className="g-4">
                {/* CỘT BÊN TRÁI: FORM NHẬP LIỆU */}
                <Col lg={4} md={12}>
                    <Card className="shadow-sm border">
                        <Card.Header className={isEditing ? "bg-warning text-dark fw-bold" : "bg-success text-white fw-bold"}>
                            {isEditing ? "📝 SỬA CHUYÊN NGÀNH" : "➕ THÊM CHUYÊN NGÀNH MỚI"}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="catName">
                                    <Form.Label className="fw-bold">Tên chuyên ngành</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập tên chuyên ngành..." value={name} onChange={e => setName(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="catDesc">
                                    <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                                    <Form.Control as="textarea" rows={4} placeholder="Nhập mô tả ngắn gọn..." value={description} onChange={e => setDescription(e.target.value)} />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant={isEditing ? "warning" : "success"} type="submit" className="fw-bold">
                                        {isEditing ? "Cập nhật" : "Thêm mới"}
                                    </Button>
                                    {isEditing && (
                                        <Button variant="outline-secondary" size="sm" onClick={cancelEdit}>
                                            Hủy bỏ sửa
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT BÊN PHẢI: BẢNG DANH SÁCH */}
                <Col lg={8} md={12}>
                    {loading ? (
                        <div className="text-center py-5"><MySpinner /></div>
                    ) : (
                        <div className="shadow-sm rounded border overflow-hidden">
                            <Table striped hover responsive className="mb-0 bg-white">
                                <thead className="table-success">
                                    <tr>
                                        <th className="text-center" style={{ width: "8%" }}>STT</th>
                                        <th style={{ width: "30%" }}>Tên chuyên ngành</th>
                                        <th style={{ width: "42%" }}>Mô tả</th>
                                        <th className="text-center" style={{ width: "20%" }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">Chưa có chuyên ngành nào trong hệ thống.</td>
                                        </tr>
                                    ) : (
                                        categories.map((cat, index) => (
                                            <tr key={cat.id} className={editId === cat.id ? "table-warning" : ""}>
                                                <td className="text-center align-middle">{index + 1}</td>
                                                <td className="fw-bold text-dark align-middle">{cat.name}</td>
                                                <td className="text-muted align-middle small">{cat.description || "—"}</td>
                                                <td className="text-center align-middle">
                                                    <Button variant="outline-warning" size="sm" className="me-2 fw-semibold" onClick={() => handleEditClick(cat)}>
                                                        Sửa
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDelete(cat.id, cat.name)}>
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CategoryManagement;