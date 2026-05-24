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
    
    // Đổi logic giỏ hàng thành "Giỏ tài liệu đang mượn"
    const [cart, ] = useContext(MyCartContext);

    const loadCates = async () => {
        try {
            // Tạm thời bọc try-catch. Nếu backend chưa chạy thì dùng mảng giả để dàn layout.
            let res = await Apis.get(endpoints['categories']);
            setCategories(res.data);
        } catch (error) {
            console.error("Chưa kết nối được Backend, dùng dữ liệu giả định.");
            setCategories([
                { id: 1, name: "Công nghệ thông tin" },
                { id: 2, name: "Kinh tế học" },
                { id: 3, name: "Khoa học xã hội" }
            ]);
        }
    }

    useEffect(() => {
        loadCates();
    }, []);

    const search = (e) => {
        e.preventDefault();
        // Chuyển hướng sang trang danh sách tài liệu thay vì trang chủ
        nav(`/documents?kw=${kw}`);
    }

    return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        {/* Đổi Brand và sửa lại để dùng Link tránh load lại nguyên trang */}
        <Navbar.Brand as={Link} to="/">📚 Thư Viện Số</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/documents" className="nav-link">Học liệu</Link>
            {user !== null && (user.role === "LIBRARIAN" || user.role === "ADMIN") && (
                <Link to="/admin/add-document" className="nav-link text-warning fw-bold">
                    ➕ Thêm tài liệu
                </Link>
            )}
            {user !== null && (user.role === "LIBRARIAN" || user.role === "ADMIN") && (
                <Link to="/admin/management" className="nav-link text-warning fw-bold">
                    💼 Quản lý học liệu
                </Link>
            )}
            <NavDropdown title="Chuyên ngành" id="basic-nav-dropdown">
                {categories.map(c => {
                    let url = `/documents?cateId=${c.id}`;
                    return <Link className="dropdown-item" key={c.id} to={url}>{c.name}</Link>;
                })}
            </NavDropdown>

            {user === null ? (
                <>
                    <Link to="/register" className="nav-link text-primary fw-semibold">Đăng ký</Link>
                    <Link to="/login" className="nav-link text-success fw-semibold">Đăng nhập</Link>
                </>
            ) : (
                <>
                    <Link to="/profile" className="nav-link text-primary fw-semibold d-flex align-items-center">
                        <img src={user.avatar || "https://via.placeholder.com/150"} alt="avatar" width={30} height={30} className="rounded-circle me-2" style={{objectFit: "cover"}} /> 
                        Chào {user.username}!
                    </Link>
                    {/* Sửa lại nút đăng xuất cho đồng bộ giao diện Nav */}
                    <Nav.Link as="button" className="btn btn-link text-danger text-decoration-none fw-semibold" onClick={() => dispatch({"type": "LOGOUT"})}>
                        Đăng xuất
                    </Nav.Link>
                </>
            )}

            {/* Đổi Giỏ hàng thành Tài liệu mượn */}
            <Link to="/cart" className="nav-link text-warning fw-bold">
                Phiếu mượn <Badge bg="danger" className="ms-1">{cart?.totalQuantity || 0}</Badge>
            </Link>
            
          </Nav>
          
          {/* Form tìm kiếm đổi qua dùng d-flex của Bootstrap 5 */}
          <Form className="d-flex" onSubmit={search}>
              <Form.Control
                  type="search"
                  placeholder="Tìm tên sách, tác giả..."
                  className="me-2"
                  aria-label="Search"
                  value={kw}
                  onChange={e => setKw(e.target.value)}
              />
              <Button type="submit" variant="outline-success">Tìm</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}

export default Header;