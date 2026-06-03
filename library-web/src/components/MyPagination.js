import { Pagination } from "react-bootstrap";

const MyPagination = ({ currentPage, totalPages, onPageChange }) => {
    // Nếu dữ liệu ít, chỉ có 1 trang thì ẩn thanh phân trang đi cho đỡ rác UI
    if (totalPages <= 1) return null;

    // Logic tính toán để chỉ hiển thị tối đa 5 số trang gần nhất (tránh thanh phân trang dài ngoằng nếu có 100 trang)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 2) endPage = Math.min(5, totalPages);
    if (currentPage >= totalPages - 1) startPage = Math.max(1, totalPages - 4);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="d-flex justify-content-center mt-4 mb-4">
            <Pagination className="shadow-sm">
                {/* Nút Về trang đầu và Nút Lùi */}
                <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

                {/* Hiển thị dấu ... nếu khoảng cách tới trang đầu > 1 */}
                {startPage > 1 && <Pagination.Ellipsis disabled />}

                {/* Vòng lặp in ra các số trang */}
                {pages.map(number => (
                    <Pagination.Item 
                        key={number} 
                        active={number === currentPage} 
                        onClick={() => onPageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                ))}

                {/* Hiển thị dấu ... nếu khoảng cách tới trang cuối > 1 */}
                {endPage < totalPages && <Pagination.Ellipsis disabled />}

                {/* Nút Tiến và Nút Về trang cuối */}
                <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    );
};

export default MyPagination;