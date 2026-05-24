import { useContext, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import cookies from 'react-cookies'
import { MyUserContext } from "../../configs/Contexts";

const Login = () => {
    const userInfo = [{
        field: "username",
        label: "Tên đăng nhập", 
        type: "text"
    }, {
        field: "password",
        label: "Mật khẩu", 
        type: "password"
    }];

    const [user, setUser] = useState({})
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);
    const [q] = useSearchParams();
   
    const nav = useNavigate();

    const validate = () => {
        return true;
    }

    const login = async (e) => {
        e.preventDefault();
        setErr(""); // Reset lỗi cũ

        if (validate()) {
            try {
                setLoading(true);

                // --- 1. CODE GỌI API THẬT ---
                /*
                let res = await Apis.post(endpoints['login'], {...user});
                cookies.save('token', res.data.token);

                let p = await authApis().get(endpoints['profile']);
                cookies.save('user', p.data);

                dispatch({
                    "type": "LOGIN",
                    "payload": p.data
                });
                */

                // --- 2. CODE GIẢ LẬP ĐỂ TEST UI (Dùng tạm khi chưa có Backend) ---
                await new Promise(resolve => setTimeout(resolve, 800)); 
                if (user.username === "admin" && user.password === "123") {
                    const mockUser = { id: 1, username: "admin_thuthu", avatar: "https://placehold.co/100x100?text=Avatar", role: "LIBRARIAN" };
                    cookies.save('token', "fake-jwt-token");
                    cookies.save('user', mockUser);
                    dispatch({ "type": "LOGIN", "payload": mockUser });
                } else {
                    setErr("Tài khoản hoặc mật khẩu không đúng! (Gợi ý test: admin/123)");
                    return; // Dừng việc chuyển trang
                }
                // --- KẾT THÚC GIẢ LẬP ---

                let next = q.get('next')
                if (next)
                    nav(next);
                else
                    nav('/');

            } catch (ex) {
                console.error(ex);
                // Cải tiến: Thông báo lỗi ra màn hình thay vì chỉ log console
                setErr("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "450px" }}>
            <h2 className="text-center text-success mt-4 mb-4">ĐĂNG NHẬP</h2>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={login} className="shadow-sm p-4 bg-white rounded border">
                {userInfo.map(u => <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                    <Form.Label className="fw-bold">{u.label}</Form.Label>
                    <Form.Control type={u.type} placeholder={`Nhập ${u.label.toLowerCase()}...`} value={user[u.field] || ""} onChange={e => setUser({...user, [u.field]: e.target.value})} required />
                </Form.Group>)}

                <Form.Group className="mb-3 text-center">
                    {loading === true ? <MySpinner /> : <Button variant="success" type="submit" className="w-100 fw-bold">Đăng nhập</Button>}
                </Form.Group>

                <div className="text-center mt-3">
                    <span className="text-muted">Bạn chưa có tài khoản? </span>
                    <Link to="/register" className="text-decoration-none fw-bold text-success">Đăng ký ngay</Link>
                </div>
            </Form>
        </div>
    );
}

export default Login;