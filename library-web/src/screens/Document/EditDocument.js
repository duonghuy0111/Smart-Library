import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Container, Card, Image, Row, Col } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate, useParams } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import { toast } from "react-toastify";

const EditDocument = () => {
    const [user] = useContext(MyUserContext);
    const { id } = useParams(); 
    const nav = useNavigate();

    const docInfo = [
        { field: "name", label: "Tên tài liệu", type: "text" },
        { field: "author", label: "Tác giả", type: "text" },
        { field: "publishYear", label: "Năm xuất bản", type: "number" },
        { field: "price", label: "Phí mượn (VNĐ - Nhập 0 nếu miễn phí)", type: "number" }
    ];

    const [document, setDocument] = useState(null); 
    const [categories, setCategories] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    
    const coverImage = useRef();
    const fileData = useRef();

    const loadData = async () => {
        try {
            setLoading(true);
            let cateRes = await Apis.get(endpoints['categories']);
            setCategories(cateRes.data);

            let res = await Apis.get(endpoints['document-details'](id));
            let docData = res.data;
            
            // ĐÃ SỬA: Đưa ID danh mục lồng ra ngoài biến categoryId cho Form dễ thao tác
            docData.categoryId = docData.category?.id;
            setDocument(docData);

        } catch (ex) {
            console.error(ex);
            setErr("Không thể tải thông tin tài liệu!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, [id]);

    const processEditDocument = async (e) => {
        e.preventDefault();
        setErr("");

        const currentYear = new Date().getFullYear();
        const publishYear = parseInt(document.publishYear);
        const price = parseInt(document.price);

        if (publishYear > currentYear || publishYear < 1900) {
            setErr(`Năm xuất bản không hợp lệ! Vui lòng nhập từ năm 1900 đến ${currentYear}.`);
            return; 
        }

        if (price < 0) {
            setErr("Phí mượn không được là số âm!");
            return;
        }

        let form = new FormData();
        for (var key of Object.keys(document)) {
            // Loại bỏ các Object phức tạp không lưu vào FormData được
            if (key !== 'image' && key !== 'file' && key !== 'category' && key !== 'uploaderBy' && document[key] !== null) {
                form.append(key, document[key]);
            }
        }

        if (coverImage.current.files.length > 0) form.append('image', coverImage.current.files[0]);
        if (fileData.current.files.length > 0) form.append('file', fileData.current.files[0]);

        try {
            setLoading(true);
            // GỌI API UPDATE THẬT SỰ
            await authApis().post(endpoints['update-document'](id), form);
            toast.success("Cập nhật thông tin tài liệu thành công!");
            nav("/admin/management");
        } catch (ex) {
            console.error(ex);
            setErr("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setLoading(false);
        }
    }

    if (user === null || (user.role !== "ROLE_LIBRARIAN" && user.role !== "ROLE_ADMIN")) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">Quyền truy cập bị từ chối.</Alert>
            </Container>
        );
    }

    if (document === null) return <div className="text-center mt-5"><MySpinner /></div>;

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "800px" }}>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-warning text-dark text-center py-3">
                    <h3 className="mb-0 fw-bold">✏️ CẬP NHẬT TÀI LIỆU #{id}</h3>
                </Card.Header>
                <Card.Body className="p-4">
                    {err && <Alert variant="danger">{err}</Alert>}

                    <Form onSubmit={processEditDocument}>
                        <Row>
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
                                        as="textarea" rows={4} 
                                        value={document.description || ""} 
                                        onChange={e => setDocument({...document, "description": e.target.value})} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4} className="text-center border-start">
                                <Form.Label className="fw-bold d-block text-start">Ảnh bìa hiện tại</Form.Label>
                                <Image src={document.image} thumbnail className="mb-3 w-100" />
                                
                                <Form.Group className="mb-3 text-start" controlId="coverImage">
                                    <Form.Label className="text-primary small">Đổi ảnh bìa khác (Tùy chọn)</Form.Label>
                                    <Form.Control ref={coverImage} type="file" accept="image/*" size="sm" />
                                </Form.Group>
                                <hr/>
                                <Form.Group className="mb-4 text-start" controlId="fileData">
                                    <Form.Label className="text-danger small">Cập nhật File nội dung (Tùy chọn)</Form.Label>
                                    <Form.Control ref={fileData} type="file" size="sm" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mt-4 border-top pt-3">
                            <Button variant="secondary" onClick={() => nav("/admin/management")}>Quay lại danh sách</Button>
                            {loading === true ? <MySpinner /> : <Button variant="warning" type="submit" className="fw-bold px-5">Lưu thay đổi</Button>}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default EditDocument;