// ====================================================================
// === (*** UPDATED: TopStaffStats (รองรับสถานะใหม่ตามภาพ) ***) ===
// ====================================================================
const TopStaffStats = ({ organizationId }) => {
    // (จำลองข้อมูล - ในอนาคตเปลี่ยนเป็น fetch API)
    const [staffData, setStaffData] = useState([]);
    // const [loading, setLoading] = useState(false);

    // 1. กำหนดค่า Config ของสถานะต่างๆ (สีตามกล่อง KPI ด้านบน)
    const statusConfig = [
        { key: 'pending', label: 'รอรับเรื่อง', color: '#dc3545' },         // สีแดง
        { key: 'coordinating', label: 'กำลังประสานงาน', color: '#9b59b6' }, // สีม่วง
        { key: 'inProgress', label: 'กำลังดำเนินการ', color: '#ffc107' },   // สีเหลือง
        { key: 'completed', label: 'เสร็จสิ้น', color: '#057A55' },         // สีเขียว
        { key: 'forwarded', label: 'ส่งต่อ', color: '#007bff' },            // สีน้ำเงิน
        { key: 'invite', label: 'เชิญร่วม', color: '#20c997' },             // สีมิ้นต์
        { key: 'rejected', label: 'ปฏิเสธ', color: '#6c757d' },             // สีเทา
        // { key: 'null', label: 'NULL', color: '#dee2e6' } // (เผื่อไว้ถ้าต้องการแสดง NULL)
    ];

    useEffect(() => {
        // *** จำลองข้อมูล Mock Data ให้มีครบทุกสถานะ ***
        const mockData = [
            { name: "กมนัช พรหมบำรุง", pending: 1, coordinating: 2, inProgress: 5, completed: 4, forwarded: 2, invite: 0, rejected: 0 },
            { name: "กมนัช traffy fondue", pending: 0, coordinating: 1, inProgress: 3, completed: 2, forwarded: 1, invite: 1, rejected: 0 },
            { name: "Phumchai Siriphanpor...", pending: 2, coordinating: 0, inProgress: 2, completed: 2, forwarded: 0, invite: 0, rejected: 1 },
            { name: "AbuDaHBeE Tubtim", pending: 0, coordinating: 0, inProgress: 4, completed: 0, forwarded: 0, invite: 0, rejected: 0 },
            { name: "Traffy-testkk NECTEC,...", pending: 1, coordinating: 1, inProgress: 2, completed: 1, forwarded: 0, invite: 0, rejected: 0 },
            { name: "SuperToy Noppadol", pending: 0, coordinating: 0, inProgress: 2, completed: 0, forwarded: 0, invite: 0, rejected: 0 },
            { name: "Taned Wongpoo", pending: 0, coordinating: 0, inProgress: 0, completed: 2, forwarded: 0, invite: 0, rejected: 0 },
        ];
        setStaffData(mockData);
    }, []);

    // คำนวณยอดรวมสูงสุดเพื่อใช้กำหนดความกว้างของกราฟ
    const getMaxTotal = () => {
        if (staffData.length === 0) return 0;
        return Math.max(...staffData.map(staff => 
            statusConfig.reduce((sum, config) => sum + (staff[config.key] || 0), 0)
        ));
    };

    const maxTotal = getMaxTotal();

    return (
        <div style={{ marginTop: '20px', width: '100%' }}>
            {/* 2. Legend (แสดงรายการสีและสถานะ) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#555' }}>
                {statusConfig.map((config) => (
                    <div key={config.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: config.color }}></div>
                        <span>{config.label}</span>
                    </div>
                ))}
            </div>

            {/* 3. Chart Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {staffData.map((staff, index) => {
                    // คำนวณผลรวมของคนนี้
                    const total = statusConfig.reduce((sum, config) => sum + (staff[config.key] || 0), 0);
                    // คำนวณความยาวรวมของแท่งกราฟเทียบกับคนที่มีงานเยอะสุด
                    const totalWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

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
                                    height: '20px', // ลดความสูงลงเล็กน้อยเพื่อให้ดูเนียนตาขึ้นเมื่อมีหลายสี
                                    display: 'flex', 
                                    borderRadius: '4px', 
                                    overflow: 'hidden',
                                    backgroundColor: '#f8f9fa' 
                                }}>
                                    {statusConfig.map((config) => {
                                        const value = staff[config.key] || 0;
                                        if (value === 0) return null;
                                        
                                        // คำนวณ % ความกว้างของ segment นี้ เทียบกับงานทั้งหมดของคนนี้
                                        const segmentWidth = (value / total) * 100;

                                        return (
                                            <div 
                                                key={config.key}
                                                style={{ width: `${segmentWidth}%`, backgroundColor: config.color, height: '100%' }} 
                                                title={`${config.label}: ${value}`}
                                            ></div>
                                        );
                                    })}
                                </div>
                                {/* แสดงตัวเลขยอดรวมท้ายแท่งกราฟ */}
                                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#888', minWidth: '20px' }}>{total}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
