import axios from "axios";
import cookies from 'react-cookies';

// CHÚ Ý DÒNG NÀY: Phải có /SpringLibraryApp
const SERVER = "http://localhost:8080/SpringLibraryApp"; 

export const endpoints = {
    'categories': '/categories/', 
    'documents': '/documents/', 
    'document-details': (docId) => `/documents/${docId}`,
    'reviews': (docId) => `/reviews/document/${docId}`, 
    'register': '/users/register',
    'login': '/users/login', 
    'current-user': '/users/current-user', 
    'add-review': '/reviews/', 
    'transactions': '/transactions/', 
    'histories': '/histories/', 
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