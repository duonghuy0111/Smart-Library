import axios from "axios";
import cookies from 'react-cookies';

// LƯU Ý: Nếu backend của bạn chạy thẳng ở thư mục gốc (không qua war file), hãy đổi thành http://localhost:8080
const SERVER = "http://localhost:8080/SpringLibraryApp"; 

export const endpoints = {
    'categories': '/categories/', 
    'delete-category': (id) => `/categories/${id}`, // Bổ sung API Xóa danh mục
    'documents': '/documents/', 
    'document-details': (docId) => `/documents/${docId}`,
    'delete-document': (id) => `/documents/${id}`, // Bổ sung API Xóa
    'update-document': (id) => `/documents/${id}`, // Bổ sung API Cập nhật (POST theo backend của bạn)
    'reviews': (docId) => `/reviews/document/${docId}`, 
    'register': '/users/register',
    'login': '/users/login', 
    'current-user': '/users/current-user', 
    'add-review': '/reviews/', 
    'transactions': '/transactions/', 
    
    'borrows': '/borrows/', 
    'my-borrows': '/borrows/my-borrows',
    'all-borrows': '/borrows/all', // Bổ sung API lấy toàn bộ phiếu mượn cho Thủ thư
    'extend-borrow': (detailId) => `/borrows/extend/${detailId}`, // Bổ sung API gia hạn
    'revoke-borrow': (detailId) => `/borrows/revoke/${detailId}`,

    'stats-kpis': '/stats/kpis', 
    'stats-category': '/stats/category-stats',
    'stats-revenue': (year) => `/stats/revenue?year=${year}`,
    'stats-roi': '/stats/roi',
    'stats-usage': (mode, year) => `/stats/usage?viewMode=${mode}&year=${year}`,

    'create-payment': '/transactions/create-payment',
}

export const authApis = () => {
    return axios.create({
        baseURL: `${SERVER}/api`, 
        headers: {
            'Authorization': `Bearer ${cookies.load('token')}`
        }
    })
}

export default axios.create({
    baseURL: `${SERVER}/api`
})