import axios from "axios";
import cookies from 'react-cookies';

export const endpoints = {
    // API Public
    'categories': '/categories',
    'documents': '/documents',
    'document-details': (docId) => `/documents/${docId}`,
    'reviews': (docId) => `/documents/${docId}/reviews`,
    
    // API User (Y chang mẫu của thầy)
    'register': '/users',
    'login': '/login',
    
    // API Cần bảo mật (Có chữ secure giống thầy)
    'current-user': '/secure/profile',
    'add-review': (docId) => `/secure/documents/${docId}/reviews`,
    'borrow-document': (docId) => `/secure/borrows/${docId}`,
    'my-borrows': '/secure/borrows/my',
}

export const authApis = () => {
    // Console log giống thầy để debug token
    console.info(cookies.load('token')) 
    return axios.create({
        // Tạm để URL của thầy, khi nào tạo xong Backend Thư Viện thì đổi tên SpringSaleAppV1 thành tên project của bạn nhé
        baseURL: "http://localhost:8080/SpringSaleAppV1/api/", 
        headers: {
            'Authorization': `Bearer ${cookies.load('token')}`
        }
    })
}

export default axios.create({
    baseURL: "http://localhost:8080/SpringSaleAppV1/api/"
})