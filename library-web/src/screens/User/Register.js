import { useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const userInfo = [{
        field: "firstName",
        label: "Tên", 
        type: "text"
    }, {
        field: "lastName",
        label: "Họ và tên lót", 
        type: "text"
    }, {
        field: "phone",
        label: "Số điện thoại", 
        type: "tel"
    }, {
        field: "email",
        label: "Email", 
        type: "email"
    }, {
        field: "username",
        label: "Tên đăng nhập", 
        type: "text"
    }, {
        field: "password",
        label: "Mật khẩu", 
        type: "password"
    }, {
        field: "confirm",
        label: "Xác nhận mật khẩu", 
        type: "password"
    }];

    // Set mặc định role là STUDENT
    const [user, setUser] = useState({ role: "STUDENT" })
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const avatar = useRef();
    const nav = useNavigate();

    const validate = () => {
        // Kiểm tra số điện thoại chuẩn định dạng mạng di động (10 số)
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(user.phone)) {
            setErr('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số bắt đầu bằng 03, 05, 07, 08 hoặc 09.');
            return false;
        }

        // Kiểm tra độ dài mật khẩu
        if (!user.password || user.password.length < 6) {
            setErr('Mật khẩu quá ngắn! Vui lòng nhập ít nhất 6 ký tự.');
            return false;
        }

        // Kiểm tra mật khẩu khớp nhau
        if (user.password !== user.confirm) {
            setErr('Mật khẩu xác nhận không khớp!');
            return false;
        }

        return true;
    }

    const register = async (e) => {
        e.preventDefault();
        setErr(""); // Reset lỗi mỗi lần bấm

        if (validate()) {
            let form = new FormData();

            for (var key of Object.keys(user)) {
                if (key !== 'confirm')
                    form.append(key, user[key]);
            }

            if (avatar.current.files.length > 0)
                form.append('avatar', avatar.current.files[0]);

            try {
                setLoading(true);
                const res = await Apis.post(endpoints['register'], form);
                if (res.status === 201)
                    nav('/login');
            } catch (ex) {
                console.error(ex);
                setErr("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "600px" }}>
            <h2 className="text-center text-success mt-4 mb-4">ĐĂNG KÝ TÀI KHOẢN</h2>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={register} className="shadow-sm p-4 bg-white rounded border">
                {userInfo.map(u => <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                    <Form.Label fw="bold">{u.label}</Form.Label>
                    {/* Thêm || "" để tránh lỗi undefined value */}
                    <Form.Control type={u.type} placeholder={`Nhập ${u.label.toLowerCase()}...`} value={user[u.field] || ""} onChange={e => setUser({...user, [u.field]: e.target.value})} required />
                </Form.Group>)}

                {/* Bổ sung dropdown chọn vai trò */}
                <Form.Group className="mb-3" controlId="role">
                    <Form.Label>Vai trò đăng ký</Form.Label>
                    <Form.Select value={user.role || "STUDENT"} onChange={e => setUser({...user, "role": e.target.value})}>
                        <option value="STUDENT">Sinh viên / Giảng viên</option>
                        <option value="LIBRARIAN">Thủ thư (Cần Admin phê duyệt)</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4" controlId="avatar">
                    <Form.Label>Ảnh đại diện</Form.Label>
                    <Form.Control ref={avatar} type="file" required accept="image/*" />
                </Form.Group>

                <Form.Group className="mb-3 text-center">
                    {loading === true ? <MySpinner /> : <Button variant="success" type="submit" className="w-100 fw-bold">Đăng ký</Button>}
                </Form.Group>
            </Form>
        </div>
    );
}

export default Register;