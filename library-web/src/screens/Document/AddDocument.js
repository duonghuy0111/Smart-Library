import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Container, Card } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import { toast } from "react-toastify";

const AddDocument = () => {
    const [user] = useContext(MyUserContext);
    const nav = useNavigate();

    const docInfo = [
        { field: "name", label: "Tên tài liệu", type: "text" },
        { field: "author", label: "Tác giả", type: "text" },
        { field: "publishYear", label: "Năm xuất bản", type: "number" },
        { field: "price", label: "Phí mượn (VNĐ - Nhập 0 nếu miễn phí)", type: "number" }
    ];

    const [document, setDocument] = useState({});
    const [categories, setCategories] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    
    const coverImage = useRef();
    const fileData = useRef();

    // ĐÃ SỬA: Lấy danh mục từ DB thực tế
    const loadCategories = async () => {
        try {
            let res = await Apis.get(endpoints['categories']);
            setCategories(res.data);
            if (res.data.length > 0) {
                setDocument(prev => ({ ...prev, categoryId: res.data[0].id }));
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    useEffect(() => { loadCategories(); }, []);

    const processAddDocument = async (e) => {
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
        for (var key of Object.keys(document)) form.append(key, document[key]);

        if (coverImage.current.files.length > 0) {
            form.append('image', coverImage.current.files[0]);
        } else {
            setErr("Vui lòng chọn ảnh bìa!");
            return;
        }

        if (fileData.current.files.length > 0) {
            form.append('file', fileData.current.files[0]);
        } else {
            setErr("Vui lòng upload file nội dung tài liệu!");
            return;
        }

        try {
            setLoading(true);
            const res = await authApis().post(endpoints['documents'], form);
            
            if (res.status === 201) {
                setDocument({ categoryId: categories[0]?.id }); 
                coverImage.current.value = "";
                fileData.current.value = "";
                toast.success("Thêm tài liệu thành công. Sách mới đã được đưa lên Kệ!");
            }
        } catch (ex) {
            console.error(ex);
            setErr("Có lỗi xảy ra, vui lòng kiểm tra lại kết nối hoặc dung lượng file!");
        } finally {
            setLoading(false);
        }
    }

    if (user === null || (user.role !== "ROLE_LIBRARIAN" && user.role !== "ROLE_ADMIN")) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">
                    <Alert.Heading>Quyền truy cập bị từ chối</Alert.Heading>
                    <p>Chỉ có Thủ thư hoặc Quản trị viên mới có thể truy cập trang này.</p>
                    <Button variant="outline-danger" onClick={() => nav("/")}>Quay về trang chủ</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "700px" }}>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-success text-white text-center py-3">
                    <h3 className="mb-0">THÊM MỚI TÀI LIỆU (THỦ THƯ)</h3>
                </Card.Header>
                <Card.Body className="p-4">
                    {err && <Alert variant="danger">{err}</Alert>}

                    <Form onSubmit={processAddDocument}>
                        {docInfo.map(u => (
                            <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                                <Form.Label className="fw-bold">{u.label}</Form.Label>
                                <Form.Control 
                                    type={u.type} 
                                    placeholder={`Nhập ${u.label.toLowerCase()}...`} 
                                    value={document[u.field] || ""} 
                                    onChange={e => setDocument({...document, [u.field]: e.target.value})} 
                                    required 
                                />
                            </Form.Group>
                        ))}

                        <Form.Group className="mb-3" controlId="category">
                            <Form.Label className="fw-bold">Chuyên ngành / Thể loại</Form.Label>
                            <Form.Select value={document.categoryId || ""} onChange={e => setDocument({...document, "categoryId": e.target.value})}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="Nhập tóm tắt nội dung..." value={document.description || ""} onChange={e => setDocument({...document, "description": e.target.value})} required />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="coverImage">
                                    <Form.Label className="fw-bold text-primary">Ảnh bìa (JPG, PNG)</Form.Label>
                                    <Form.Control ref={coverImage} type="file" accept="image/*" required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-4" controlId="fileData">
                                    <Form.Label className="fw-bold text-danger">File học liệu (PDF, DOCX...)</Form.Label>
                                    <Form.Control ref={fileData} type="file" required />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="text-center mt-3">
                            {loading === true ? <MySpinner /> : <Button variant="success" size="lg" type="submit" className="w-100 fw-bold">Xuất bản tài liệu</Button>}
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AddDocument;