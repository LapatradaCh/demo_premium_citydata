import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity,
  Clock,
  Users 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart
} from 'recharts';

// Import CSS Module
import styles from './css/StatisticsView.module.css';

// --- Configuration ---
const STATUS_COLORS = {
  'ทั้งหมด': '#0f172a',
  'รอรับเรื่อง': '#ff4d4f',
  'กำลังดำเนินการ': '#ffc107',
  'ดำเนินการ': '#ffc107',
  'เสร็จสิ้น': '#4caf50',
  'ส่งต่อ': '#2196f3',
  'เชิญร่วม': '#00bcd4',
  'ปฏิเสธ': '#64748b',
  'NULL': '#d1d5db'
};

const STATUS_KEY_MAP = {
  'ทั้งหมด': 'total',
  'รอรับเรื่อง': 'waiting',
  'กำลังประสาน': 'coordinating',
  'ดำเนินการ': 'action',
  'เสร็จสิ้น': 'finished',
  'ส่งต่อ': 'forward',
  'เชิญร่วม': 'invite',
  'ปฏิเสธ': 'reject'
};

// --- Mock Data (เหลือแค่ efficiencyData ที่ยังเป็น Mock) ---
const efficiencyData = [
  { id: 'Ticket-001', stage1: 0.5, stage2: 2, stage3: 24, total: 26.5, type: 'ไฟฟ้า' },
  { id: 'Ticket-002', stage1: 1.0, stage2: 4, stage3: 12, total: 17.0, type: 'ต้นไม้' },
  { id: 'Ticket-003', stage1: 0.2, stage2: 1, stage3: 48, total: 49.2, type: 'ต้นไม้' },
  { id: 'Ticket-004', stage1: 0.8, stage2: 5, stage3: 10, total: 15.8, type: 'ต้นไม้' },
  { id: 'Ticket-005', stage1: 0.5, stage2: 3, stage3: 20, total: 23.5, type: 'ต้นไม้' },
];

const StatisticsView = ({ organizationId }) => {
  // --- States ---
  const [timeRange, setTimeRange] = useState('1w'); // Default 1 สัปดาห์
  const [statsData, setStatsData] = useState(null);
  const [trendData, setTrendData] = useState([]); // เปลี่ยนจาก Mock เป็น State ว่าง
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
        return;
      }

      // ไม่ set loading true ทับซ้อนเวลากด filter เพื่อความลื่นไหลของ UI (หรือจะเปิดก็ได้)
      // setLoading(true);

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };
        const baseUrl = 'https://premium-citydata-api-ab.vercel.app/api/stats';

        // 1. Overview Stats (ภาพรวมตลอดกาล ไม่เปลี่ยนตาม filter)
        const statsRes = await fetch(`${baseUrl}/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Trend Graph (ใช้ API ใหม่ + ส่ง timeRange)
        const trendRes = await fetch(`${baseUrl}/trend?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (trendRes.ok) {
          const data = await trendRes.json();
          setTrendData(data);
        }

        // 3. Problem Types (ส่ง timeRange เพื่อกรองตามช่วงเวลาด้วย)
        const typeRes = await fetch(`${baseUrl}/count-by-type?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          const formatted = data.map(item => ({
            name: item.issue_type_name,
            count: parseInt(item.count, 10),
            avgTime: item.avg_resolution_time ? parseFloat(parseFloat(item.avg_resolution_time).toFixed(1)) : 0
          })).sort((a, b) => b.count - a.count);
          setProblemTypeData(formatted);
        }

        // 4. Satisfaction (ตลอดกาล)
        const satRes = await fetch(`${baseUrl}/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) {
          const data = await satRes.json();
          setSatisfactionData(data);
        }

        // 5. Staff Count
        const staffCountRes = await fetch(`${baseUrl}/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) {
          const data = await staffCountRes.json();
          setTotalStaffCount(data.staff_count ? parseInt(data.staff_count, 10) : 0);
        }

        // 6. Staff Activities
        const staffRes = await fetch(`${baseUrl}/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
               const name = item.staff_name || "Unknown";
               const status = item.new_status || "NULL"; 
               const count = item.count || 0; 

               if (!grouped[name]) grouped[name] = { name: name, total: 0 };
               if (!grouped[name][status]) grouped[name][status] = 0;
               
               grouped[name][status] += count;
               grouped[name].total += count;
            });
          }
          const staffArray = Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 10);
          setStaffData(staffArray);
        }

      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [organizationId, timeRange]); // <-- เมื่อ timeRange เปลี่ยน, fetch ใหม่

  // Helpers
  const getTotalCases = () => statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;
  const getStatusCount = (statusKey) => statsData?.[statusKey] || 0;
  const getPercent = (val, total) => total > 0 ? (val / total) * 100 : 0;

  const statusCardConfig = [
    { title: 'ทั้งหมด', count: getTotalCases(), key: 'total' },
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), key: 'waiting' },
    { title: 'ดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), key: 'action' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), key: 'finished' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), key: 'forward' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), key: 'invite' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), key: 'reject' },
  ];

  // Helper สำหรับ Render ปุ่ม Filter
  const renderFilterButtons = () => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {['1w', '1m', '3m', '1y', '5y'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: timeRange === range ? '1px solid #2563eb' : '1px solid #e5e7eb',
            backgroundColor: timeRange === range ? '#2563eb' : '#fff',
            color: timeRange === range ? '#fff' : '#4b5563',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
        >
          {range.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.headerSubtitle}>
              {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        
        {loading && !statsData ? (
           <p style={{textAlign: 'center', color: '#9ca3af', padding: '2rem'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className={styles.responsiveGrid4}>
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              const cssKey = STATUS_KEY_MAP[card.title] || 'total';
              const textClass = styles[`text-${cssKey}`];      
              const badgeBaseClass = styles['badge-status'];   
              const solidColor = STATUS_COLORS[card.title] || '#000';

              return (
                <div key={idx} className={styles.statusCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={`${styles.cardCount} ${textClass}`}>
                      {card.count}
                    </span>
                  </div>
                  <div 
                    className={badgeBaseClass}
                    style={{ backgroundColor: solidColor, color: '#ffffff' }}
                  >
                    {percent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* --- ส่วนกราฟ Trend ที่เพิ่ม Filter --- */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้ม ({timeRange.toUpperCase()})
              </h2>
              <p className={styles.sectionSubtitle}>ยอดรับเรื่อง vs สถานะ</p>
            </div>
            {/* แสดงปุ่ม Filter ตรงนี้ */}
            {renderFilterButtons()}
          </div>
          
          <div className={styles.chartContainer}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={trendData} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                  <Line type="monotone" dataKey="total" stroke={STATUS_COLORS['ทั้งหมด']} strokeWidth={3} dot={{r: 3}} name="ทั้งหมด" />
                  <Line type="monotone" dataKey="pending" stroke={STATUS_COLORS['รอรับเรื่อง']} strokeWidth={2} dot={{r: 2}} name="รอรับเรื่อง" />
                  <Line type="monotone" dataKey="action" stroke={STATUS_COLORS['ดำเนินการ']} strokeWidth={3} dot={{r: 3}} name="ดำเนินการ" />
                  <Line type="monotone" dataKey="forward" stroke={STATUS_COLORS['ส่งต่อ']} strokeWidth={3} dot={{r: 3}} name="ส่งต่อ" />
                  <Line type="monotone" dataKey="invite" stroke={STATUS_COLORS['เชิญร่วม']} strokeWidth={3} dot={{r: 3}} name="เชิญร่วม" />
                  <Line type="monotone" dataKey="reject" stroke={STATUS_COLORS['ปฏิเสธ']} strokeWidth={3} dot={{r: 3}} name="ปฏิเสธ" />
                  <Line type="monotone" dataKey="completed" stroke={STATUS_COLORS['เสร็จสิ้น']} strokeWidth={2} dot={{r: 2}} name="เสร็จสิ้น" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>ไม่มีข้อมูลในช่วงเวลานี้</div>
            )}
          </div>
        </section>

        <div className={styles.responsiveGrid2}>
          
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Clock color="#f97316" size={20} />
                  เวลาแต่ละขั้นตอน
                </h2>
                <p className={styles.sectionSubtitle}>วิเคราะห์คอขวด (ชม.)</p>
              </div>
            </div>
            {/* กราฟนี้ยังเป็น Mockup (efficiencyData) */}
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={efficiencyData} 
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="id" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['รอรับเรื่อง']} name="รอรับเรื่อง" barSize={16} />
                  <Bar dataKey="stage3" stackId="a" fill={STATUS_COLORS['ดำเนินการ']} name="ดำเนินการ" barSize={16} />
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['ส่งต่อ']} name="ส่งต่อ" barSize={16} />
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['เชิญร่วม']} name="เชิญร่วม" barSize={16} />
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['ปฏิเสธ']} name="เชิญร่วม" barSize={16} />
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['เสร็จสิ้น']} name="เสร็จสิ้น" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Activity color="#6366f1" size={20} />
                  ประเภท vs เวลา
                </h2>
                <p className="sectionSubtitle">จำนวน/เวลาเฉลี่ย ({timeRange.toUpperCase()})</p>
              </div>
            </div>
            {problemTypeData.length > 0 ? (
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={problemTypeData.slice(0, 5)} 
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="count" name="จำนวน" barSize={16} fill={STATUS_COLORS['ส่งต่อ']} />
                    <Bar dataKey="avgTime" name="เวลา(ชม.)" barSize={16} fill={STATUS_COLORS['กำลังดำเนินการ']} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyState}>ไม่มีข้อมูล</p>
            )}
          </section>

        </div>

        <div className={styles.responsiveGrid2}>
            {/* ส่วนความพึงพอใจและเจ้าหน้าที่ คงเดิม */}
            <section className={styles.sectionCard}>
                <h3 className={styles.h3Custom} style={{fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', fontSize: '16px'}}>ความพึงพอใจ</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: '#ffc107'}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const percent = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{backgroundColor: '#ffc107', width: `${percent}%`}}></div>
                                </div>
                                <span className={styles.starPercent}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
            </section>

            <section className={styles.sectionCard}>
                <div className={styles.topHeader}>
                    <h3 className={styles.h3Custom} style={{fontWeight: 'bold', color: '#1f2937', margin: 0, fontSize: '16px'}}>ประสิทธิภาพเจ้าหน้าที่</h3>
                    <div className={styles.topBadge}>
                        <Users size={14} style={{marginRight: '4px'}}/>
                        ทั้งหมด: {totalStaffCount} คน
                    </div>
                </div>
                
                <div className={styles.staffChartContainer}>
                    {staffData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={staffData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" type="category" width={140} axisLine={false} tickLine={false} 
                            tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} 
                          />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          {Object.keys(STATUS_COLORS).filter(k => k !== 'NULL' && k !== 'ทั้งหมด' && k !== 'กำลังประสาน' && k !== 'ดำเนินการ').map((status) => (
                            <Bar key={status} dataKey={status} stackId="staff" fill={STATUS_COLORS[status]} barSize={20} name={status} />
                          ))}
                          <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>
                    )}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default StatisticsView;
