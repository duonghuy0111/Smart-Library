import React, { useEffect, useContext, useRef, useState } from 'react';
import { Button, Card, Form, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { db } from '../configs/Firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { MyUserContext, ChatContext } from '../configs/Contexts'; 
import { toast } from 'react-toastify';

const FirebaseChat = () => {
    const [user] = useContext(MyUserContext);
    
    // RÚT DỮ LIỆU TỪ CHAT CONTEXT
    const { chatState, setChatState } = useContext(ChatContext);
    const { isOpen, activeUser, recentChats } = chatState;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Hàm tạo Room ID
    const getRoomId = (user1, user2) => {
        return [user1, user2].sort().join('_');
    };

    // Hàm đóng chat
    const closeChat = () => setChatState(prev => ({ ...prev, isOpen: false }));
    
    // Hàm quay lại danh sách "Gần đây"
    const backToRecents = () => setChatState(prev => ({ ...prev, activeUser: null }));

    // Lắng nghe tin nhắn
    useEffect(() => {
        if (!user || !activeUser) return;
        const roomId = getRoomId(user.username, activeUser.username);
        const q = query(collection(db, "private_chats", roomId, "messages"), orderBy("createdAt", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [user, activeUser]);

    // Cuộn xuống
    useEffect(() => {
        if (isOpen && activeUser) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, activeUser]);

    // ==========================================
    // HÀM GỬI TIN NHẮN (ĐÃ TỐI ƯU TỐC ĐỘ 0 GIÂY)
    // ==========================================
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!user) { toast.warning("Vui lòng đăng nhập!"); return; }
        
        const textToSend = newMessage.trim(); // Lưu tạm tin nhắn vào biến
        if (textToSend === "") return;

        // 👉 1. XÓA Ô NHẬP LIỀN TỨC THÌ ĐỂ GIAO DIỆN MƯỢT MÀ
        setNewMessage(""); 

        const roomId = getRoomId(user.username, activeUser.username);
        try {
            // 👉 2. Đẩy dữ liệu lên Firebase ở chế độ chạy nền
            await addDoc(collection(db, "private_chats", roomId, "messages"), {
                text: textToSend, 
                sender: user.username,
                avatar: user.avatar || "https://via.placeholder.com/150",
                createdAt: serverTimestamp()
            });
        } catch (error) { 
            console.error("Lỗi gửi chat:", error);
            // 👉 3. Nếu mạng lỗi, trả lại đoạn text vào ô nhập để người dùng không bị mất công gõ
            setNewMessage(textToSend);
            toast.error("Không thể gửi tin nhắn, vui lòng thử lại!"); 
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
            {isOpen && (
                <Card className="shadow-lg border-0 mb-3" style={{ width: '350px', height: '480px', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* HEADER */}
                    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
                        <div className="fw-bold d-flex align-items-center">
                            {activeUser ? (
                                <>
                                    <Button variant="link" className="text-white p-0 me-2" onClick={backToRecents}>
                                        <i className="fa-solid fa-arrow-left"></i>
                                    </Button>
                                    <img src={activeUser.avatar} alt="avt" className="rounded-circle me-2" style={{width: '24px', height: '24px'}} />
                                    {activeUser.username}
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-clock-rotate-left me-2"></i> Trò chuyện gần đây
                                </>
                            )}
                        </div>
                        <Button variant="link" className="text-white p-0" onClick={closeChat}>
                            <i className="fa-solid fa-xmark fs-5"></i>
                        </Button>
                    </Card.Header>

                    {/* --- MÀN HÌNH 1: DANH SÁCH LIÊN HỆ --- */}
                    {!activeUser && (
                        <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
                            {!user ? (
                                <div className="text-center p-4 text-muted mt-4">Vui lòng đăng nhập để chat.</div>
                            ) : recentChats.length === 0 ? (
                                <div className="text-center p-4 text-muted mt-4">
                                    <i className="fa-regular fa-comment-dots fs-1 mb-2 text-light"></i><br/>
                                    Chưa có cuộc trò chuyện nào.<br/>Hãy tìm ai đó trong phần bình luận để bắt chuyện nhé!
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {recentChats.map((contact, index) => (
                                        <ListGroup.Item key={index} action className="d-flex align-items-center p-3 border-bottom"
                                            onClick={() => setChatState(prev => ({...prev, activeUser: contact}))}>
                                            <img src={contact.avatar} alt="avt" className="rounded-circle border" style={{width: '45px', height: '45px'}} />
                                            <div className="ms-3">
                                                <h6 className="mb-0 fw-bold">{contact.username}</h6>
                                                <small className="text-muted">{contact.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}</small>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    )}

                    {/* --- MÀN HÌNH 2: KHUNG CHAT RIÊNG TƯ --- */}
                    {activeUser && (
                        <>
                            <Card.Body style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }} className="p-3">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted mt-5">
                                        <small>Bắt đầu cuộc trò chuyện với <strong>{activeUser.username}</strong></small>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.sender === user.username;
                                        return (
                                            <div key={msg.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                                {!isMe && (
                                                    <img src={msg.avatar} alt="avt" className="rounded-circle me-2 mt-auto mb-1" style={{ width: '28px', height: '28px' }} />
                                                )}
                                                <div style={{ maxWidth: '75%' }}>
                                                    <div className={`p-2 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark border'}`} style={{ fontSize: '14px' }}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </Card.Body>

                            <Card.Footer className="bg-white p-2">
                                <Form onSubmit={sendMessage}>
                                    <InputGroup>
                                        <Form.Control type="text" placeholder="Nhắn tin..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="border-primary" style={{ borderRadius: '20px 0 0 20px' }} />
                                        <Button variant="primary" type="submit" disabled={!newMessage.trim()} style={{ borderRadius: '0 20px 20px 0' }}>
                                            <i className="fa-solid fa-paper-plane"></i>
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Footer>
                        </>
                    )}
                </Card>
            )}

            {!isOpen && (
                <Button variant="primary" className="rounded-circle shadow-lg d-flex align-items-center justify-content-center" 
                    style={{ width: '60px', height: '60px' }} 
                    onClick={() => setChatState(prev => ({ ...prev, isOpen: true }))}>
                    <i className="fa-solid fa-comment-dots fs-3"></i>
                </Button>
            )}
        </div>
    );
};

export default FirebaseChat;