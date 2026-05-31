import { useContext, useEffect, useState } from "react";
import { Badge, Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Apis, { endpoints } from "../configs/Apis";
import { Link, useNavigate } from "react-router-dom";
import { MyCartContext, MyUserContext } from "../configs/Contexts";

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [kw, setKw] = useState("");
    const nav = useNavigate();
    const [user, dispatch] = useContext(MyUserContext);
    
    const [cart, ] = useContext(MyCartContext);

    const search = (e) => {
        e.preventDefault(); 
        nav(`/documents?kw=${kw}`);  
    }

    const loadCates = async () => {
        try {
            let res = await Apis.get(endpoints['categories']);
            setCategories(res.data);
        } catch (error) {
            setCategories([
                { id: 1, name: "Công nghệ thông tin" },
                { id: 2, name: "Kinh tế học" },
                { id: 3, name: "Khoa học xã hội" },
                { id: 4, name: "Ngôn ngữ Anh" }
            ]);
        }
    }

    useEffect(() => {
        loadCates();
    }, []);

    return (
    <Navbar expand="xl" className="bg-white shadow-sm sticky-top" style={{ padding: "10px 0" }}>
      {/* Sử dụng fluid="xl" để tự động co giãn thông minh theo màn hình */}
      <Container fluid="xl">
        
        <Navbar.Brand as={Link} to="/" className="fw-bold text-success fs-4 text-nowrap me-3">
            📚 Thư Viện Số
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          {/* VÙNG TRÁI: Giảm gap xuống 2 để tiết kiệm không gian */}
          <Nav className="me-auto align-items-center gap-2">
            <Link to="/" className="nav-link fw-semibold text-dark text-nowrap px-1">Trang chủ</Link>
            <Link to="/documents" className="nav-link fw-semibold text-dark text-nowrap px-1">Học liệu</Link>
            
            <NavDropdown title={<span className="fw-semibold text-dark text-nowrap">Chuyên ngành</span>} id="cate-dropdown" className="px-1">
                {categories.map(c => (
                    <Link className="dropdown-item" key={c.id} to={`/documents?cateId=${c.id}`}>{c.name}</Link>
                ))}
            </NavDropdown>

            {user !== null && (user.role === "ROLE_LIBRARIAN" || user.role === "ROLE_ADMIN") && (
                <NavDropdown title={<span className="text-warning fw-bold text-nowrap">⚙️ Quản trị</span>} id="admin-dropdown" className="px-1">
                    <Link to="/admin/add-document" className="dropdown-item py-2">➕ Thêm học liệu</Link>
                    <Link to="/admin/management" className="dropdown-item py-2">📚 Quản lý kho</Link>
                    <Link to="/admin/borrow-management" className="dropdown-item py-2">💼 Quản lý mượn trả</Link>
                    <Link to="/admin/category-management" className="dropdown-item py-2">🗂️ Quản lý ngành</Link>
                    <NavDropdown.Divider />
                    {user.role === "ROLE_ADMIN" ? (
                        <Link to="/admin/statistics" className="dropdown-item text-info fw-bold py-2">📊 Thống kê chiến lược</Link>
                    ) : (
                        <Link to="/librarian/statistics" className="dropdown-item text-info fw-bold py-2">📈 Báo cáo sử dụng</Link>
                    )}
                </NavDropdown>
            )}
          </Nav>
          
          {/* VÙNG PHẢI: Thu nhỏ ô search và gom gọn khoảng cách */}
          <Nav className="ms-auto align-items-center gap-3 mt-3 mt-xl-0">
            
            <Form className="d-flex" onSubmit={search}>
                <Form.Control
                    type="search"
                    placeholder="Tìm học liệu..."
                    className="me-2 form-control-sm border-success"
                    value={kw}
                    onChange={(e) => setKw(e.target.value)}
                    style={{ width: "160px" }} /* Thu nhỏ độ rộng ô tìm kiếm */
                />
                <Button variant="success" size="sm" type="submit" className="text-nowrap px-2">Tìm</Button>
            </Form>

            <Link to="/cart" className="nav-link text-danger fw-bold d-flex align-items-center text-nowrap px-1">
                🛒 Phiếu đăng ký <Badge bg="danger" className="ms-1 rounded-pill fs-6">{cart?.totalQuantity || 0}</Badge>
            </Link>

            {user === null ? (
                <div className="d-flex gap-2 ms-1">
                    <Link to="/login" className="btn btn-outline-success btn-sm fw-bold px-3">Đăng nhập</Link>
                    <Link to="/register" className="btn btn-primary btn-sm fw-bold px-3 text-nowrap">Đăng ký</Link>
                </div>
            ) : (
                <NavDropdown
                    align="end"
                    title={
                        <div className="d-inline-flex align-items-center text-nowrap">
                            <img src={user.avatar || "https://placehold.co/150x150?text=Avatar"} alt="avatar" width={30} height={30} className="rounded-circle me-2 border border-2 border-success" style={{objectFit: "cover"}} />
                            <span className="fw-bold text-secondary">{user.username}</span>
                        </div>
                    }
                    id="user-dropdown"
                    className="ms-1"
                >
                    <Link to="/profile" className="dropdown-item py-2">👤 Thông tin cá nhân</Link>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={() => dispatch({"type": "LOGOUT"})} className="text-danger fw-bold py-2">
                        🚪 Đăng xuất
                    </NavDropdown.Item>
                </NavDropdown>
            )}
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}

export default Header;