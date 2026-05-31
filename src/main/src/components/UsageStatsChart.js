import { useState, useEffect } from "react";
import { Card, Form, Badge } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MySpinner from "./MySpinner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UsageStatsChart = () => {
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("MONTHS"); 
    const [selectedYear, setSelectedYear] = useState("2026");

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, [viewMode, selectedYear]);

    const getChartLabels = () => {
        if (viewMode === "YEARS") return ["Năm 2024", "Năm 2025", "Năm 2026"];
        if (viewMode === "QUARTERS") return ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];
        return ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    };

    const generateMockData = (type) => {
        const labelsCount = getChartLabels().length;
        const seed = parseInt(selectedYear) + (viewMode === "YEARS" ? 10 : 0);
        const multiplier = type === "traffic" ? 15 : type === "read" ? 3 : 1;
        return Array.from({ length: labelsCount }, (_, i) => Math.abs(Math.sin(i + seed) * 40 * multiplier + 10 * multiplier).toFixed(0));
    };

    const barData = {
        labels: getChartLabels(),
        datasets: [
            { label: 'Lượt truy cập Web', data: generateMockData("traffic"), backgroundColor: 'rgba(201, 203, 207, 0.4)', borderRadius: 4 },
            { label: 'Lượt đăng ký gói', data: generateMockData("borrow"), backgroundColor: 'rgba(255, 193, 7, 0.8)', borderRadius: 4 },
            { label: 'Lượt truy cập học liệu Online', data: generateMockData("read"), backgroundColor: 'rgba(54, 162, 235, 0.8)', borderRadius: 4 }
        ]
    };

    if (loading) return <div className="text-center py-5"><MySpinner /></div>;

    return (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-light p-3">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="fw-bold text-secondary fs-6">Phân tích tần suất theo thời gian:</span>
                        {viewMode === "YEARS" && <Badge bg="secondary">Tổng quan các Năm</Badge>}
                        {viewMode === "QUARTERS" && <Badge bg="primary">Theo Quý (Năm {selectedYear})</Badge>}
                        {viewMode === "MONTHS" && <Badge bg="success">12 Tháng (Năm {selectedYear})</Badge>}
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <Form.Select size="sm" style={{ width: "160px" }} value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="border-primary fw-semibold">
                            <option value="MONTHS">Xem theo Tháng</option>
                            <option value="QUARTERS">Xem theo Quý</option>
                            <option value="YEARS">Xem theo Năm</option>
                        </Form.Select>
                        {viewMode !== "YEARS" && (
                            <Form.Select size="sm" style={{ width: "120px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="2024">Năm 2024</option>
                                <option value="2025">Năm 2025</option>
                                <option value="2026">Năm 2026</option>
                            </Form.Select>
                        )}
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={90} />
            </Card.Body>
        </Card>
    );
};

export default UsageStatsChart;