import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table, Card, Alert } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import { toast } from 'react-toastify';
import Apis, { authApis, endpoints } from "../../configs/Apis";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints['categories']);
            setCategories(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải danh mục!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.warning("Tên danh mục không được để trống!"); return; }

        try {
            setLoading(true);
            let payload = { name, description };
            if (isEditing) payload.id = editId; // Nếu là sửa thì kèm theo ID

            await authApis().post(endpoints['categories'], payload);
            
            toast.success(isEditing ? "Cập nhật danh mục thành công!" : "Thêm mới danh mục thành công!");
            setName(""); setDescription(""); setIsEditing(false); setEditId(null);
            loadCategories(); // Reload lại bảng
        } catch (ex) {
            toast.error("Có lỗi xảy ra khi lưu danh mục!");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (cat) => {
        setIsEditing(true);
        setEditId(cat.id);
        setName(cat.name);
        setDescription(cat.description || "");
    };

    const handleDelete = async (id, catName) => {
        if (window.confirm(`Hành động này có thể thất bại nếu danh mục "${catName}" đang chứa học liệu. Bạn có chắc chắn muốn xóa?`)) {
            try {
                await authApis().delete(endpoints['delete-category'](id));
                toast.success("Đã xóa danh mục thành công!");
                loadCategories();
            } catch (ex) {
                toast.error("Không thể xóa danh mục này vì đang có sách thuộc danh mục!");
            }
        }
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1000px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">📂 QUẢN LÝ CHUYÊN NGÀNH / DANH MỤC</h2>
            
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-success">
                        <Card.Header className={isEditing ? "bg-warning text-dark fw-bold" : "bg-success text-white fw-bold"}>
                            {isEditing ? "✏️ CẬP NHẬT DANH MỤC" : "➕ THÊM DANH MỤC MỚI"}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Tên chuyên ngành (*)</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập tên..." value={name} onChange={(e) => setName(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Mô tả..." value={description} onChange={(e) => setDescription(e.target.value)} />
                                </Form.Group>
                                <div className="d-grid gap-2">
                                    <Button variant={isEditing ? "warning" : "success"} type="submit" disabled={loading} className="fw-bold">
                                        {loading ? <MySpinner /> : (isEditing ? "Lưu thay đổi" : "Tạo danh mục")}
                                    </Button>
                                    {isEditing && (
                                        <Button variant="outline-secondary" size="sm" onClick={() => { setIsEditing(false); setName(""); setDescription(""); setEditId(null); }}>
                                            Hủy thao tác
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    {loading && categories.length === 0 ? <div className="text-center mt-5"><MySpinner /></div> : (
                        <div className="table-responsive shadow-sm rounded border">
                            <Table hover striped className="mb-0 bg-white">
                                <thead className="table-success">
                                    <tr>
                                        <th className="text-center">ID</th>
                                        <th>Tên chuyên ngành</th>
                                        <th>Mô tả / Ghi chú</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4 text-muted">Chưa có danh mục nào.</td></tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr key={cat.id} className={editId === cat.id ? "table-warning" : ""}>
                                                <td className="text-center align-middle fw-bold text-secondary">#{cat.id}</td>
                                                <td className="fw-bold text-dark align-middle">{cat.name}</td>
                                                <td className="text-muted align-middle small">{cat.description || "—"}</td>
                                                <td className="text-center align-middle text-nowrap">
                                                    <Button variant="outline-warning" size="sm" className="me-2 fw-semibold" onClick={() => handleEditClick(cat)}>Sửa</Button>
                                                    <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDelete(cat.id, cat.name)}>Xóa</Button>
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