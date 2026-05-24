import cookies from 'react-cookies';

export default (current, action) => {
    switch (action.type) {
        case "LOGIN":
            return action.payload; // payload sẽ chứa thông tin user (id, tên, avatar, role...)
        case "LOGOUT":
            cookies.remove('token');
            cookies.remove('user');
            return null;
        default:
            return current;
    }
}