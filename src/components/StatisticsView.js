import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Users 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart
} from 'recharts';

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

const LEGEND_CONFIG = [
  { key: 'total', label: 'ทั้งหมด', color: STATUS_COLORS['ทั้งหมด'] },
  { key: 'pending', label: 'รอรับเรื่อง', color: STATUS_COLORS['รอรับเรื่อง'] },
  { key: 'action', label: 'ดำเนินการ', color: STATUS_COLORS['ดำเนินการ'] },
  { key: 'completed', label: 'เสร็จสิ้น', color: STATUS_COLORS['เสร็จสิ้น'] },
  { key: 'forward', label: 'ส่งต่อ', color: STATUS_COLORS['ส่งต่อ'] },
  { key: 'invite', label: 'เชิญร่วม', color: STATUS_COLORS['เชิญร่วม'] },
  { key: 'reject', label: 'ปฏิเสธ', color: STATUS_COLORS['ปฏิเสธ'] },
];

const truncateText = (text, maxLength) => {
    if (!text) return '';
    const str = String(text);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

const StatisticsView = ({ organizationId }) => {
  // --- States ---
  const [timeRange, setTimeRange] = useState('1m'); 
  const [activeTrendKey, setActiveTrendKey] = useState('total');

  const [statsData, setStatsData] = useState(null);
  const [trendData, setTrendData] = useState([]); 
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- Mobile Logic ---
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 992; // ใช้ 992px เป็นจุดตัด Mobile/Tablet

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) { setLoading(false); return; }

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };
        const baseUrl = 'https://premium-citydata-api-ab.vercel.app/api/stats'; 

        // 1. Overview
        const statsRes = await fetch(`${baseUrl}/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStatsData(data.reduce((acc, item) => { acc[item.status] = parseInt(item.count, 10); return acc; }, {}));
        }

        // 2. Trend
        const trendRes = await fetch(`${baseUrl}/trend?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (trendRes.ok) {
          const data = await trendRes.json();
          setTrendData(data.map(item => ({
            ...item,
            total: Number(item.total||0), pending: Number(item.pending||0), action: Number(item.action||0),
            completed: Number(item.completed||0), forward: Number(item.forward||0), invite: Number(item.invite||0), reject: Number(item.reject||0)
          })));
        }

        // 3. Problem Types
        const typeRes = await fetch(`${baseUrl}/count-by-type?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          setProblemTypeData(data.map(item => ({ name: item.issue_type_name, count: parseInt(item.count, 10), avgTime: item.avg_resolution_time ? parseFloat(parseFloat(item.avg_resolution_time).toFixed(1)) : 0 })).sort((a,b)=>b.count-a.count));
        }

        // 4. Satisfaction
        const satRes = await fetch(`${baseUrl}/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) setSatisfactionData(await satRes.json());

        // 5. Staff Count
        const staffCountRes = await fetch(`${baseUrl}/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) { const data = await staffCountRes.json(); setTotalStaffCount(data.staff_count ? parseInt(data.staff_count,10) : 0); }

        // 6. Staff Activities
        const staffRes = await fetch(`${baseUrl}/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          if (Array.isArray(rawData)) rawData.forEach(item => {
             const name = item.staff_name || "Unknown"; const status = item.new_status || "NULL"; const count = item.count ? parseInt(item.count, 10) : 0;
             if (!grouped[name]) grouped[name] = { name: name, total: 0 };
             if (!grouped[name][status]) grouped[name][status] = 0;
             grouped[name][status] += count; grouped[name].total += count;
          });
          setStaffData(Object.values(grouped).sort((a,b)=>b.total-a.total).slice(0, 10));
        }

        // 7. Efficiency
        const effRes = await fetch(`${baseUrl}/efficiency?organization_id=${organizationId}`, { headers });
        if (effRes.ok) {
            const data = await effRes.json();
            setEfficiencyData(data.map(d => ({ ...d, short_title: truncateText(d.title, 15), stage1: Number(d.stage1||0), stage2: Number(d.stage2||0), stage3: Number(d.stage3||0) })));
        }

      } catch (err) { console.error("API Error:", err); } finally { setLoading(false); }
    };

    if (organizationId) fetchData(); else setLoading(false);
  }, [organizationId, timeRange]);

  // Helpers
  const getTotalCases = () => statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;
  const getStatusCount = (statusKey) => statsData?.[statusKey] || 0;
  const getPercent = (val, total) => total > 0 ? (val / total) * 100 : 0;

  const totalCardData = { title: 'ทั้งหมด', count: getTotalCases(), key: 'total' };
  const otherStatusConfig = [
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง') },
    { title: 'ดำเนินการ', count: getStatusCount('กำลังดำเนินการ') },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น') },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ') },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม') },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ') },
  ];

  const renderFilterButtons = () => (
    <div className={styles.filterContainer}>
      {['1w', '1m', '3m', '1y', '5y'].map((range) => (
        <button key={range} onClick={() => setTimeRange(range)} className={`${styles.filterButton} ${timeRange === range ? styles.filterButtonActive : ''}`}>{range.toUpperCase()}</button>
      ))}
    </div>
  );

  const renderCustomLegend = () => (
    <div className={styles.legendContainer}>
      {LEGEND_CONFIG.map((item) => (
        <button key={item.key} onClick={() => setActiveTrendKey(item.key)} className={styles.legendBtn} style={{ borderColor: activeTrendKey === item.key ? item.color : '#e2e8f0', fontWeight: activeTrendKey === item.key ? 700 : 400 }}>
          <span className={styles.legendDot} style={{ backgroundColor: item.color }} /> {item.label}
        </button>
      ))}
    </div>
  );

  // ✅ Chart Wrapper Logic
  const ChartWrapper = ({ children, height = 300 }) => {
    if (!isMobile) {
        return <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>;
    }
    // คำนวณความกว้างหน้าจอ - padding เพื่อให้กราฟพอดีเป๊ะ ไม่ล้น ไม่หาย
    const mobileWidth = windowWidth - 72; // 32px (container padding) + 40px (card padding)
    return (
        <div style={{ width: '100%', height: height, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            {React.cloneElement(children, { width: mobileWidth, height: height })}
        </div>
    );
  };

  const commonProps = { isAnimationActive: false };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.headerSubtitle}>{new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <main className={styles.main}>
        {loading && !statsData ? <p style={{textAlign:'center', color:'#9ca3af', padding:'2rem'}}>กำลังโหลดข้อมูล...</p> : (
          <section className={styles.dashboardTopSection}>
            <div className={`${styles.statusCard} ${styles.totalCard}`}>
                <div className={styles.cardDecoration}></div>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{totalCardData.title}</span>
                    <div className={styles.badgeStatus}>100%</div>
                </div>
                <span className={styles.cardCount}>{totalCardData.count}</span>
            </div>
            
            <div className={styles.rightGrid}>
                {otherStatusConfig.map((card, idx) => (
                    <div key={idx} className={styles.statusCard} style={{ backgroundColor: STATUS_COLORS[card.title] || '#64748b' }}>
                        <div className={styles.cardDecoration}></div>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>{card.title}</span>
                            <div className={styles.badgeStatus}>{getPercent(card.count, getTotalCases()).toFixed(0)}%</div>
                        </div>
                        <span className={styles.cardCount}>{card.count}</span>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* --- GRAPH 1: Trend --- */}
        <section className={styles.sectionCard}>
          <div className={styles.chartHeaderWrapper}>
            <h2 className={styles.sectionTitle}><TrendingUp size={18} /> แนวโน้ม ({timeRange.toUpperCase()})</h2>
            {renderFilterButtons()}
          </div>
          <div className={styles.chartWrapper}>
            {trendData.length > 0 ? (
              <ChartWrapper height={300}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius:'8px'}} />
                  <Line {...commonProps} type="monotone" dataKey="total" stroke={STATUS_COLORS['ทั้งหมด']} strokeWidth={2} dot={false} hide={activeTrendKey !== 'total'} />
                  <Line {...commonProps} type="monotone" dataKey="pending" stroke={STATUS_COLORS['รอรับเรื่อง']} strokeWidth={2} dot={false} hide={activeTrendKey !== 'total' && activeTrendKey !== 'pending'} />
                  <Line {...commonProps} type="monotone" dataKey="action" stroke={STATUS_COLORS['ดำเนินการ']} strokeWidth={2} dot={false} hide={activeTrendKey !== 'total' && activeTrendKey !== 'action'} />
                  <Line {...commonProps} type="monotone" dataKey="completed" stroke={STATUS_COLORS['เสร็จสิ้น']} strokeWidth={2} dot={false} hide={activeTrendKey !== 'total' && activeTrendKey !== 'completed'} />
                </LineChart>
              </ChartWrapper>
            ) : <div style={{height:300, display:'flex', alignItems:'center', justifyContent:'center'}}>ไม่มีข้อมูล</div>}
          </div>
          {renderCustomLegend()}
        </section>

        <div className={styles.responsiveGrid2}>
          {/* --- GRAPH 2 --- */}
          <section className={styles.sectionCard}>
            <div className={styles.chartHeaderWrapper}><h2 className={styles.sectionTitle}><Clock size={18} /> เวลาแต่ละขั้นตอน</h2></div>
            <div className={styles.chartWrapper}>
              {efficiencyData.length > 0 ? (
                <ChartWrapper height={300}>
                  <BarChart data={efficiencyData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey={isMobile ? "short_title" : "title"} type="category" width={isMobile ? 90 : 120} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4b5563'}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar {...commonProps} dataKey="stage1" stackId="a" fill={STATUS_COLORS['รอรับเรื่อง']} barSize={12} radius={[4, 0, 0, 4]} />
                    <Bar {...commonProps} dataKey="stage2" stackId="a" fill={STATUS_COLORS['กำลังดำเนินการ']} barSize={12} />
                    <Bar {...commonProps} dataKey="stage3" stackId="a" fill={STATUS_COLORS['เสร็จสิ้น']} barSize={12} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartWrapper>
              ) : <div style={{height:300, display:'flex', alignItems:'center', justifyContent:'center'}}>ไม่มีข้อมูล</div>}
            </div>
          </section>

          {/* --- GRAPH 3 --- */}
          <section className={styles.sectionCard}>
            <div className={styles.chartHeaderWrapper}><h2 className={styles.sectionTitle}><Activity size={18} /> ประเภท vs เวลา</h2></div>
            <div className={styles.chartWrapper}>
                {problemTypeData.length > 0 ? (
                  <ChartWrapper height={300}>
                    <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={isMobile ? 80 : 100} tickFormatter={(value) => truncateText(value, 10)} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Bar {...commonProps} dataKey="count" barSize={12} fill={STATUS_COLORS['ส่งต่อ']} />
                      <Bar {...commonProps} dataKey="avgTime" barSize={12} fill={STATUS_COLORS['กำลังดำเนินการ']} />
                    </ComposedChart>
                  </ChartWrapper>
                ) : <div style={{height:300, display:'flex', alignItems:'center', justifyContent:'center'}}>ไม่มีข้อมูล</div>}
            </div>
          </section>
        </div>

        <div className={styles.responsiveGrid2}>
            <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle} style={{marginBottom:'16px'}}>ความพึงพอใจ</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: '#f59e0b', fontSize: '14px'}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const pct = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}><div className={styles.progressBar} style={{backgroundColor: '#f59e0b', width: `${pct}%`}}></div></div>
                                <span className={styles.starPercent}>{Math.round(pct)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : <div style={{height:150, display:'flex', alignItems:'center', justifyContent:'center'}}>ไม่มีข้อมูล</div>}
            </section>

            <section className={styles.sectionCard}>
                <div className={styles.chartHeaderWrapper}><h2 className={styles.sectionTitle}><Users size={18} /> ประสิทธิภาพเจ้าหน้าที่</h2></div>
                <div className={styles.chartWrapper}>
                    {staffData.length > 0 ? (
                      <ChartWrapper height={400}>
                        <BarChart layout="vertical" data={staffData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={isMobile ? 90 : 120} axisLine={false} tickLine={false} tickFormatter={(val) => truncateText(val, 12)} tick={{fontSize: 11, fontWeight: 500}} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          {Object.keys(STATUS_COLORS).filter(k => !['NULL', 'ทั้งหมด', 'กำลังประสาน', 'ดำเนินการ'].includes(k)).map((status) => (
                            <Bar {...commonProps} key={status} dataKey={status} stackId="staff" fill={STATUS_COLORS[status]} barSize={16} />
                          ))}
                        </BarChart>
                      </ChartWrapper>
                    ) : <div style={{height:400, display:'flex', alignItems:'center', justifyContent:'center'}}>ไม่มีข้อมูล</div>}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default StatisticsView;
