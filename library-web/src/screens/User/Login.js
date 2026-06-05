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
        setErr(""); 

        if (validate()) {
            try {
                setLoading(true);

                // 1. Gọi API lấy Token thật
                let res = await Apis.post(endpoints['login'], {
                    username: user.username,
                    password: user.password
                });
                
                const token = res.data.token || res.data; 
                cookies.save('token', token, { path: '/' });

                // 👉 2. SỬA ĐOẠN NÀY: Dùng thẳng biến 'token' trực tiếp thay vì gọi authApis()
                const endpointProfile = endpoints['current-user'];
                let userRes = await Apis.get(endpointProfile, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                // 3. Lưu user vào Cookie và Context
                cookies.save('user', userRes.data, { path: '/' });
                dispatch({
                    "type": "LOGIN",
                    "payload": userRes.data
                });

                // Chuyển trang
                let next = q.get('next');
                if (next) nav(next);
                else nav('/');

            } catch (ex) {
                console.error(ex);
                
                if (ex.response && ex.response.status === 403) {
                    // 👉 KIỂM TRA & TRÍCH XUẤT CHUỖI AN TOÀN
                    let errorMsg = "";
                    if (typeof ex.response.data === 'string') {
                        errorMsg = ex.response.data; // Nếu backend trả về thẳng chuỗi
                    } else if (ex.response.data && ex.response.data.message) {
                        errorMsg = ex.response.data.message; // Nếu backend trả về Object có key message
                    } else {
                        errorMsg = "Tài khoản của bạn đang chờ Admin phê duyệt! Vui lòng quay lại sau.";
                    }
                    
                    setErr(errorMsg);
                } else {
                    setErr("Tài khoản hoặc mật khẩu không chính xác!");
                }
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