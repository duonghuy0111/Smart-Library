import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./screens/Home/Home";
import DocumentList from "./screens/Document/DocumentList";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import Register from "./screens/User/Register";
import Login from "./screens/User/Login";
import Cart from "./screens/Cart/Cart";
import CategoryManagement from "./screens/Management/CategoryManagement";
// Chú ý: Nhớ tạo file DocumentDetails tương đương với ProductDetails của thầy
import DocumentDetails from "./screens/Home/DocumentDetails"; 
import Profile from "./screens/User/Profile";
import AddDocument from "./screens/Document/AddDocument";
import DocumentManagement from "./screens/Document/DocumentManagement";
import EditDocument from "./screens/Document/EditDocument";
import LibrarianManagement from './screens/Management/LibrarianManagement';
import AdminDashboard from "./screens/Management/AdminDashboard";
import LibrarianDashboard from "./screens/Management/LibrarianDashboard";
import { ChatContext } from "./configs/Contexts";
import FirebaseChat from './components/FirebaseChat';
import { MyCartContext, MyUserContext } from "./configs/Contexts";
import { useEffect, useReducer, useState } from "react";
import MyUserReducer from "./reducers/MyUserReducer";
import MyCartReducer from "./reducers/MyCartReducer";
import cookies from 'react-cookies';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  // Dùng cookie để giữ trạng thái đăng nhập khi F5
  const [user, dispatch] = useReducer(MyUserReducer, cookies.load('user') || null);
  const [cart, cartDispatch] = useReducer(MyCartReducer, {"totalQuantity": 0, "totalAmount": 0});

  const [chatState, setChatState] = useState({
        isOpen: false,
        activeUser: null,
        recentChats: [] // Danh sách những người đã nhắn gần đây
    });
  const openChatWith = (userToChat) => {
        setChatState(prev => {
            // Kiểm tra xem người này đã có trong danh sách Gần đây chưa
            const isExist = prev.recentChats.some(u => u.username === userToChat.username);
            // Nếu chưa có thì đẩy lên đầu danh sách
            const newRecents = isExist ? prev.recentChats : [userToChat, ...prev.recentChats];
            
            return {
                ...prev,
                isOpen: true,           // Bật bong bóng chat lên
                activeUser: userToChat, // Nhảy thẳng vào phòng chat của người này
                recentChats: newRecents
            };
        });
    };
  // Tự động load lại giỏ tài liệu đang mượn từ cookie khi khởi động App
  useEffect(() => {
    cartDispatch({'type': 'UPDATE'});
  }, []);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <MyCartContext.Provider value={[cart, cartDispatch]}>
        <ChatContext.Provider value={{ chatState, setChatState, openChatWith }}>
          <BrowserRouter>
            <Header />

            <Container className="mt-4 mb-4" style={{ minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/documents" element={<DocumentList />} />
                <Route path="/documents" element={<Home />} />  
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin/borrow-management" element={<LibrarianManagement />} />              {/* Đổi products thành documents cho đúng thư viện */}
                <Route path="/admin/category-management" element={<CategoryManagement />} />
                <Route path="/admin/statistics" element={<AdminDashboard />} />
                <Route path="/librarian/statistics" element={<LibrarianDashboard />} />              <Route path="/documents/:docId" element={<DocumentDetails />} /> 
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/add-document" element={<AddDocument />} />
                <Route path="/admin/management" element={<DocumentManagement />} />
                <Route path="/admin/edit-document/:id" element={<EditDocument />} />
              </Routes>
            </Container>

            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
            <FirebaseChat />
          </BrowserRouter>
        </ChatContext.Provider>
      </MyCartContext.Provider>
      
    </MyUserContext.Provider>
  );
}

export default App;