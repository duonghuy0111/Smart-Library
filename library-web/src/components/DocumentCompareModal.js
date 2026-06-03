import { Modal, Table, Image, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DocumentCompareModal = ({ show, onHide, compareList, onRemoveItem }) => {
    const nav = useNavigate();

    if (!compareList || compareList.length === 0) return null;

    // Hàm render sao đánh giá
    const renderStars = (rating) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={i <= rating ? "fa-solid fa-star text-warning" : "fa-regular fa-star text-secondary"} style={{ fontSize: "12px" }}></i>
            );
        }
        return <span>{stars} <small className="text-muted">({rating})</small></span>;
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="fw-bold">⚖️ BẢNG SO SÁNH HỌC LIỆU</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <Table bordered responsive className="mb-0 text-center align-middle" style={{ tableLayout: "fixed" }}>
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "15%" }} className="align-middle text-secondary">Tiêu chí đánh giá</th>
                            {compareList.map((doc) => (
                                <th key={`header-${doc.id}`} style={{ width: `${85 / compareList.length}%` }} className="position-relative">
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        className="position-absolute top-0 end-0 m-1 rounded-circle"
                                        style={{ width: "24px", height: "24px", padding: 0, lineHeight: "1" }}
                                        onClick={() => onRemoveItem(doc.id)}
                                        title="Bỏ khỏi danh sách so sánh"
                                    >
                                        &times;
                                    </Button>
                                    <Image src={doc.image} rounded className="shadow-sm mb-2 mt-3" style={{ height: "150px", objectFit: "cover" }} />
                                    <h6 className="text-primary fw-bold text-truncate px-2" title={doc.name}>{doc.name}</h6>
                                </th>
                            ))}
                            {/* In ra cột trống nếu người dùng chưa chọn đủ 3 cuốn */}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                                <th key={`empty-${idx}`} style={{ width: `${85 / 3}%` }} className="text-muted bg-light align-middle border-dashed">
                                    <div className="py-5">➕ Thêm học liệu</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Tác giả</td>
                            {compareList.map(doc => <td key={`author-${doc.id}`} className="fw-semibold">{doc.author}</td>)}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-author-${idx}`} className="bg-light"></td>)}
                        </tr>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Năm xuất bản</td>
                            {compareList.map(doc => (
                                <td key={`year-${doc.id}`}>
                                    <Badge bg="info" className="fs-6">{doc.publishYear || 2023}</Badge>
                                </td>
                            ))}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-year-${idx}`} className="bg-light"></td>)}
                        </tr>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Độ phổ biến</td>
                            {compareList.map(doc => (
                                <td key={`pop-${doc.id}`}>
                                    <span className="text-danger fw-bold">🔥 {doc.borrowCount}</span> lượt truy cập
                                </td>
                            ))}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-pop-${idx}`} className="bg-light"></td>)}
                        </tr>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Đánh giá cộng đồng</td>
                            {compareList.map(doc => <td key={`rate-${doc.id}`}>{renderStars(doc.rating)}</td>)}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-rate-${idx}`} className="bg-light"></td>)}
                        </tr>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Tóm tắt nội dung</td>
                            {compareList.map(doc => (
                                <td key={`desc-${doc.id}`} className="text-start small" style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
                                    {doc.description || "Tài liệu này cung cấp kiến thức nền tảng và chuyên sâu, phù hợp cho sinh viên tự học và làm đồ án thực tế."}
                                </td>
                            ))}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-desc-${idx}`} className="bg-light"></td>)}
                        </tr>
                        <tr>
                            <td className="fw-bold text-start text-muted bg-light px-3">Hành động</td>
                            {compareList.map(doc => (
                                <td key={`action-${doc.id}`}>
                                    <Button variant="outline-primary" size="sm" className="w-100 fw-bold" onClick={() => {
                                        onHide();
                                        nav(`/documents/${doc.id}`);
                                    }}>
                                        Xem chi tiết ➔
                                    </Button>
                                </td>
                            ))}
                            {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={`empty-action-${idx}`} className="bg-light"></td>)}
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
};

export default DocumentCompareModal;