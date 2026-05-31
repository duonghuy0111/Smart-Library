import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase từ Project của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBcV6VTrF0MwC0EpMn6tE9vbUVlilscFJ8",
  authDomain: "thuvienso-chat.firebaseapp.com",
  projectId: "thuvienso-chat",
  storageBucket: "thuvienso-chat.firebasestorage.app",
  messagingSenderId: "537421086922",
  appId: "1:537421086922:web:eb2cb0ea43b78603a83433"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo và xuất Firestore Database để các file khác gọi vào dùng
export const db = getFirestore(app);