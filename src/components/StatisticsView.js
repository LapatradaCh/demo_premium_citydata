// ====================================================================
// === (*** NEW COMPONENT: TopStaffStats (แก้ไขตามสถานะใหม่ 7 อย่าง) ***) ===
// ====================================================================
const TopStaffStats = ({ organizationId }) => {
    // 1. กำหนดค่า Config ของสถานะ (ชื่อ, Key, สี Pastel)
    const statusConfig = [
        { key: 'pending', label: 'รอรับเรื่อง', color: '#ffcdd2' },      // แดงอ่อน
        { key: 'coordinating', label: 'กำลังประสานงาน', color: '#e1bee7' }, // ม่วงอ่อน
        { key: 'inProgress', label: 'กำลังดำเนินการ', color: '#fff9c4' },  // เหลืองอ่อน
        { key: 'completed', label: 'เสร็จสิ้น', color: '#c8e6c9' },      // เขียวอ่อน
        { key: 'forwarded', label: 'ส่งต่อ', color: '#bbdefb' },         // ฟ้าอ่อน
        { key: 'invited', label: 'เชิญร่วม', color: '#b2dfdb' },         // เขียวมิ้นต์อ่อน
        { key: 'rejected', label: 'ปฏิเสธ', color: '#cfd8dc' }           // เทาอ่อน
    ];

    const [staffData, setStaffData] = useState([]);

    useEffect(() => {
        // *** จำลองข้อมูล (Mock Data) ให้ตรงกับสถานะใหม่ ***
        // (ในอนาคตถ้าต่อ API ต้อง Map key จาก API ให้ตรงกับ statusConfig ด้านบน)
        const mockData = [
            { name: "กมนัช พรหมบำรุง", pending: 2, coordinating: 1, inProgress: 5, completed: 4, forwarded: 2, invited: 0, rejected: 0 },
            { name: "กมนัช traffy fondue", pending: 1, coordinating: 0, inProgress: 3, completed: 1, forwarded: 1, invited: 1, rejected: 0 },
            { name: "Phumchai Siriphanpor...", pending: 0, coordinating: 2, inProgress: 2, completed: 2, forwarded: 0, invited: 0, rejected: 0 },
            { name: "AbuDaHBeE Tubtim", pending: 1, coordinating: 0, inProgress: 3, completed: 0, forwarded: 0, invited: 0, rejected: 1 },
            { name: "Traffy-testkk NECTEC,...", pending: 0, coordinating: 0, inProgress: 3, completed: 1, forwarded: 0, invited: 0, rejected: 0 },
            { name: "SuperToy Noppadol", pending: 0, coordinating: 0, inProgress: 2, completed: 0, forwarded: 0, invited: 0, rejected: 0 },
            { name: "Taned Wongpoo", pending: 0, coordinating: 0, inProgress: 0, completed: 2, forwarded: 0, invited: 0, rejected: 0 },
        ];
        setStaffData(mockData);
    }, []);

    // ฟังก์ชันคำนวณยอดรวมของแต่ละคน
    const calculateTotal = (staff) => {
        return statusConfig.reduce((sum, config) => sum + (staff[config.key] || 0), 0);
    };

    // หาค่า Max Total เพื่อนำไปคำนวณความกว้างของกราฟ 100%
    const maxTotal = Math.max(...staffData.map(s => calculateTotal(s)), 0);

    return (
        <div style={{ marginTop: '20px', width: '100%' }}>
            {/* --- Legend (อธิบายสี) --- */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', fontSize: '0.75rem', color: '#555' }}>
                {statusConfig.map((item) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* --- Chart Rows --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {staffData.map((staff, index) => {
                    const total = calculateTotal(staff);
                    const totalWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

                    // คำนวณ % ความกว้างของแต่ละส่วนภายในแท่งกราฟ
                    const getPercent = (val) => (total > 0 ? (val / total) * 100 : 0);

                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            {/* ชื่อเจ้าหน้าที่ */}
                            <div style={{ width: '35%', paddingRight: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }} title={staff.name}>
                                {staff.name}
                            </div>

                            {/* Stacked Bar */}
                            <div style={{ width: '65%', display: 'flex', alignItems: 'center' }}>
                                <div style={{ 
                                    width: `${totalWidthPercent}%`, 
                                    height: '24px', 
                                    display: 'flex', 
                                    borderRadius: '4px', 
                                    overflow: 'hidden',
                                    backgroundColor: '#f8f9fa' 
                                }}>
                                    {statusConfig.map((config) => {
                                        const val = staff[config.key] || 0;
                                        if (val <= 0) return null;
                                        return (
                                            <div 
                                                key={config.key}
                                                style={{ width: `${getPercent(val)}%`, backgroundColor: config.color }} 
                                                title={`${config.label}: ${val}`}
                                            ></div>
                                        );
                                    })}
                                </div>
                                {/* แสดงตัวเลขยอดรวมท้ายกราฟ (Optional) */}
                                {/* <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#999' }}>{total}</span> */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
