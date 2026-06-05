//// Xóa học liệu
//function deleteDocument(url) {
//    if (confirm("Bạn chắc chắn muốn xóa tài liệu này?") === true) {
//        fetch(url, {
//            method: "delete"
//        }).then(res => {
//            if (res.status === 204 || res.status === 200)
//                location.reload();
//            else
//                alert("Xóa tài liệu thất bại!");
//        });
//    }
//}
//
// Duyệt tài khoản Thủ thư
//function approveLibrarian(url) {
//    if (confirm("Bạn xác nhận cấp quyền cho thủ thư này?") === true) {
//        fetch(url, {
//            method: "post" // Hoặc put tùy cấu hình API của em
//        }).then(res => {
//            if (res.status === 200 || res.status === 204) {
//                alert("Đã duyệt tài khoản thành công!");
//                location.reload();
//            } else {
//                alert("Lỗi khi duyệt tài khoản!");
//            }
//        });
//    }
//}