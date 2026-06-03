import { Container } from "react-bootstrap";
import UsageStatsChart from "../../components/UsageStatsChart";

const LibrarianDashboard = () => {
    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <h2 className="text-success border-bottom pb-2 mb-4">💼 BÁO CÁO MỨC ĐỘ SỬ DỤNG TÀI NGUYÊN</h2>
            <UsageStatsChart />
        </Container>
    );
};

export default LibrarianDashboard;