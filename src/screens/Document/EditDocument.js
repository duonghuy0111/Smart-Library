import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Container, Card, Image, Row, Col } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate, useParams } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";

const EditDocument = () => {
    const [user] = useContext(MyUserContext);
    const { id } = useParams(); // Lấy ID tài liệu từ URL
    const nav = useNavigate();

    const docInfo = [
        { field: "name", label: "Tên tài liệu", type: "text" },
        { field: "author", label: "Tác giả", type: "text" },
        { field: "publishYear", label: "Năm xuất bản", type: "number" },
        { field: "price", label: "Phí mượn (VNĐ - Nhập 0 nếu miễn phí)", type: "number" }
    ];

    const [document, setDocument] = useState(null); // Ban đầu là null để chờ load dữ liệu
    const [categories, setCategories] = useState([]);
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    
    const coverImage = useRef();
    const fileData = useRef();

    // Load dữ liệu cũ của tài liệu để điền vào form
    const loadData = async () => {
        try {
            setLoading(true);

            // Mock Data: Danh mục
            setCategories([
                { id: 1, name: "Công nghệ thông tin" },
                { id: 2, name: "Kinh tế học" },
                { id: 3, name: "Khoa học xã hội" }
            ]);

            // --- BẮT ĐẦU MOCK DATA LẤY CHI TIẾT TÀI LIỆU ---
            await new Promise(resolve => setTimeout(resolve, 600));
            // Giả lập backend trả về cục data của cuốn sách có ID này
            const mockDoc = {
                id: id,
                name: "Giáo trình Lập trình Java",
                author: "Nguyễn Văn A",
                publishYear: 2023,
                price: 0,
                categoryId: 1, // Thuộc ngành IT
                description: "Tài liệu cơ bản về lập trình Java, các khái niệm OOP, kế thừa, đa hình...",
                image: "https://placehold.co/300x400/e3f2fd/0d47a1?text=Java"
            };
            setDocument(mockDoc);
            // --- KẾT THÚC MOCK DATA ---

        } catch (ex) {
            console.error(ex);
            setErr("Không thể tải thông tin tài liệu!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [id]);

    const processEditDocument = async (e) => {
        e.preventDefault();
        setErr("");
        setSuccess("");

        // --- BẮT ĐẦU VALIDATE LOGIC ---
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại (2026)
        const publishYear = parseInt(document.publishYear);
        const price = parseInt(document.price);

        if (publishYear > currentYear || publishYear < 1900) {
            setErr(`Năm xuất bản không hợp lệ! Vui lòng nhập từ năm 1900 đến ${currentYear}.`);
            return; // Dừng luôn, không cho chạy tiếp
        }

        if (price < 0) {
            setErr("Phí mượn không được là số âm!");
            return;
        }

        let form = new FormData();
        for (var key of Object.keys(document)) {
            // Loại bỏ các trường không cần gửi hoặc là object
            if (key !== 'image' && key !== 'file') {
                form.append(key, document[key]);
            }
        }

        // Nếu thủ thư chọn ảnh mới thì mới gửi lên
        if (coverImage.current.files.length > 0) {
            form.append('image', coverImage.current.files[0]);
        }

        // Nếu thủ thư chọn file nội dung mới thì mới gửi lên
        if (fileData.current.files.length > 0) {
            form.append('file', fileData.current.files[0]);
        }

        try {
            setLoading(true);
            
            // --- MOCK API UPDATE ---
            await new Promise(resolve => setTimeout(resolve, 800));
            setSuccess("Cập nhật thông tin tài liệu thành công!");
            // --- KẾT THÚC MOCK ---

        } catch (ex) {
            console.error(ex);
            setErr("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setLoading(false);
        }
    }

    if (user === null || (user.role !== "LIBRARIAN" && user.role !== "ADMIN")) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">Quyền truy cập bị từ chối.</Alert>
            </Container>
        );
    }

    // Hiển thị vòng xoay nếu chưa load xong dữ liệu cũ
    if (document === null) {
        return <div className="text-center mt-5"><MySpinner /></div>;
    }

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "800px" }}>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-warning text-dark text-center py-3">
                    <h3 className="mb-0 fw-bold">✏️ CẬP NHẬT TÀI LIỆU #{id}</h3>
                </Card.Header>
                <Card.Body className="p-4">
                    {err && <Alert variant="danger">{err}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={processEditDocument}>
                        <Row>
                            {/* Cột trái: Form nhập liệu */}
                            <Col md={8}>
                                {docInfo.map(u => (
                                    <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                                        <Form.Label className="fw-bold">{u.label}</Form.Label>
                                        <Form.Control 
                                            type={u.type} 
                                            value={document[u.field] || ""} 
                                            onChange={e => setDocument({...document, [u.field]: e.target.value})} 
                                            required 
                                        />
                                    </Form.Group>
                                ))}

                                <Form.Group className="mb-3" controlId="category">
                                    <Form.Label className="fw-bold">Chuyên ngành</Form.Label>
                                    <Form.Select 
                                        value={document.categoryId || ""} 
                                        onChange={e => setDocument({...document, "categoryId": e.target.value})}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={4} 
                                        value={document.description || ""} 
                                        onChange={e => setDocument({...document, "description": e.target.value})} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>

                            {/* Cột phải: Hiển thị ảnh cũ và chọn file mới */}
                            <Col md={4} className="text-center border-start">
                                <Form.Label className="fw-bold d-block text-start">Ảnh bìa hiện tại</Form.Label>
                                <Image src={document.image} thumbnail className="mb-3 w-100" />
                                
                                <Form.Group className="mb-3 text-start" controlId="coverImage">
                                    <Form.Label className="text-primary small">Đổi ảnh bìa khác (Tùy chọn)</Form.Label>
                                    <Form.Control ref={coverImage} type="file" accept="image/*" size="sm" />
                                </Form.Group>

                                <hr/>

                                <Form.Group className="mb-4 text-start" controlId="fileData">
                                    <Form.Label className="text-danger small">Cập nhật File nội dung mới (Tùy chọn)</Form.Label>
                                    <Form.Control ref={fileData} type="file" size="sm" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mt-4 border-top pt-3">
                            <Button variant="secondary" onClick={() => nav("/admin/management")}>
                                Quay lại danh sách
                            </Button>
                            {loading === true ? <MySpinner /> : (
                                <Button variant="warning" type="submit" className="fw-bold px-5">
                                    Lưu thay đổi
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default EditDocument;