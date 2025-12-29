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

  // --- Mobile Logic (Updated) ---
  // ใช้ breakpoint 992px เพื่อตัดสินใจเรื่องขนาดตัวอักษรหรือการแสดงผลบางอย่าง
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 992; 
  const isSmallMobile = windowWidth < 576;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Data Fetching (เหมือนเดิม) ---
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };
        const baseUrl = 'https://premium-citydata-api-ab.vercel.app/api/stats'; 

        // Overview
        const statsRes = await fetch(`${baseUrl}/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStatsData(data.reduce((acc, item) => { acc[item.status] = parseInt(item.count, 10); return acc; }, {}));
        }

        // Trend
        const trendRes = await fetch(`${baseUrl}/trend?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (trendRes.ok) {
          const data = await trendRes.json();
          setTrendData(data.map(item => ({
            ...item,
            total: Number(item.total || 0),
            pending: Number(item.pending || 0),
            action: Number(item.action || 0),
            completed: Number(item.completed || 0),
            forward: Number(item.forward || 0),
            invite: Number(item.invite || 0),
            reject: Number(item.reject || 0),
          })));
        }

        // Problem Types
        const typeRes = await fetch(`${baseUrl}/count-by-type?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          setProblemTypeData(data.map(item => ({
            name: item.issue_type_name,
            count: parseInt(item.count, 10),
            avgTime: item.avg_resolution_time ? parseFloat(parseFloat(item.avg_resolution_time).toFixed(1)) : 0
          })).sort((a, b) => b.count - a.count));
        }

        // Satisfaction
        const satRes = await fetch(`${baseUrl}/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) setSatisfactionData(await satRes.json());

        // Staff Count
        const staffCountRes = await fetch(`${baseUrl}/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) { const data = await staffCountRes.json(); setTotalStaffCount(data.staff_count ? parseInt(data.staff_count, 10) : 0); }

        // Staff Activities
        const staffRes = await fetch(`${baseUrl}/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
               const name = item.staff_name || "Unknown";
               const status = item.new_status || "NULL"; 
               const count = item.count ? parseInt(item.count, 10) : 0; 
               if (!grouped[name]) grouped[name] = { name: name, total: 0 };
               if (!grouped[name][status]) grouped[name][status] = 0;
               grouped[name][status] += count; grouped[name].total += count;
            });
          }
          setStaffData(Object.values(grouped).sort((a, b) => b.total - a.total));
        }

        // Efficiency
        const effRes = await fetch(`${baseUrl}/efficiency?organization_id=${organizationId}`, { headers });
        if (effRes.ok) {
            const data = await effRes.json();
            setEfficiencyData(data.map(d => ({
                ...d,
                short_title: truncateText(d.title, 15),
                stage1: Number(d.stage1 || 0),
                stage2: Number(d.stage2 || 0),
                stage3: Number(d.stage3 || 0),
            })));
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
  }, [organizationId, timeRange]);

  const getTotalCases = () => statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;
  const getStatusCount = (statusKey) => statsData?.[statusKey] || 0;
  const getPercent = (val, total) => total > 0 ? (val / total) * 100 : 0;

  const totalCardData = { title: 'ทั้งหมด', count: getTotalCases(), key: 'total' };
  const otherStatusConfig = [
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), key: 'waiting' },
    { title: 'ดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), key: 'action' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), key: 'finished' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), key: 'forward' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), key: 'invite' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), key: 'reject' },
  ];

  const renderFilterButtons = () => (
    <div className={styles.filterContainer}>
      {['1w', '1m', '3m', '1y', '5y'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`${styles.filterButton} ${timeRange === range ? styles.filterButtonActive : ''}`}
        >
          {range.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const renderCustomLegend = () => {
    return (
      <div className={styles.legendContainer}>
        {LEGEND_CONFIG.map((item) => {
          const isActive = activeTrendKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTrendKey(item.key)}
              className={`${styles.legendBtn} ${isActive ? styles.legendBtnActive : ''}`}
              style={{
                color: isActive ? item.color : '#64748b', 
                borderColor: isActive ? item.color : '#e2e8f0',
                fontWeight: isActive ? 700 : 400
              }}
            >
              <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
              {item.label}
            </button>
          );
        })}
      </div>
    );
  };

  // ✅ Chart Wrapper (Fix: ใช้ ResponsiveContainer เสมอ แต่ใส่ minWidth: 0 ที่ Parent เพื่อกัน Grid ระเบิด)
  const ChartWrapper = ({ children, height = 300 }) => {
    return (
        <div style={{ width: '100%', height: height, minWidth: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
  };

  const commonProps = { isAnimationActive: false };
  const internalLegendStyle = { fontSize: '11px', paddingTop: '10px' };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h1 style={{margin:0}}>สถิติภาพรวม</h1>
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
          <section className={styles.dashboardTopSection}>
            {/* Total Card */}
            <div className={`${styles.statusCard} ${styles.totalCard}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{totalCardData.title}</span>
                    <div className={styles.badgeStatus}>100%</div>
                </div>
                <span className={styles.cardCount}>{totalCardData.count}</span>
            </div>
            
            {/* Grid Cards */}
            <div className={styles.rightGrid}>
                {otherStatusConfig.map((card, idx) => {
                    const percent = getPercent(card.count, getTotalCases());
                    const solidColor = STATUS_COLORS[card.title] || '#64748b';
                    return (
                        <div key={idx} className={styles.statusCard} style={{ backgroundColor: solidColor }}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>{card.title}</span>
                                <div className={styles.badgeStatus}>{percent.toFixed(0)}%</div>
                            </div>
                            <span className={styles.cardCount}>{card.count}</span>
                        </div>
                    );
                })}
            </div>
          </section>
        )}

        {/* --- TREND GRAPH --- */}
        <section className={styles.sectionCard}>
          <div className={styles.chartHeaderWrapper}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้ม ({timeRange.toUpperCase()})
              </h2>
              <p className={styles.sectionSubtitle}>ยอดรับเรื่อง vs สถานะ</p>
            </div>
            {renderFilterButtons()}
          </div>
          
          <div className={styles.chartWrapper}>
            {trendData.length > 0 ? (
              <ChartWrapper height={300}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Line {...commonProps} type="monotone" dataKey="total" stroke={STATUS_COLORS['ทั้งหมด']} strokeWidth={2} dot={false} name="ทั้งหมด" hide={activeTrendKey !== 'total'} />
                  <Line {...commonProps} type="monotone" dataKey="pending" stroke={STATUS_COLORS['รอรับเรื่อง']} strokeWidth={2} dot={false} name="รอรับเรื่อง" hide={activeTrendKey !== 'total' && activeTrendKey !== 'pending'} />
                  <Line {...commonProps} type="monotone" dataKey="action" stroke={STATUS_COLORS['ดำเนินการ']} strokeWidth={2} dot={false} name="ดำเนินการ" hide={activeTrendKey !== 'total' && activeTrendKey !== 'action'} />
                  <Line {...commonProps} type="monotone" dataKey="completed" stroke={STATUS_COLORS['เสร็จสิ้น']} strokeWidth={2} dot={false} name="เสร็จสิ้น" hide={activeTrendKey !== 'total' && activeTrendKey !== 'completed'} />
                </LineChart>
              </ChartWrapper>
            ) : (
              <div className={styles.emptyState}>ไม่มีข้อมูลในช่วงเวลานี้</div>
            )}
          </div>
          {renderCustomLegend()}
        </section>

        <div className={styles.responsiveGrid2}>
          {/* Efficiency Graph */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div><h2 className={styles.sectionTitle}><Clock color="#f97316" size={20} />เวลาแต่ละขั้นตอน</h2><p className={styles.sectionSubtitle}>วิเคราะห์คอขวด (ชม.)</p></div>
            </div>
            <div className={styles.chartWrapper}>
              {efficiencyData.length > 0 ? (
                <ChartWrapper height={300}>
                  <BarChart data={efficiencyData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey={isMobile ? "short_title" : "title"} type="category" width={isMobile ? 90 : 120} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4b5563'}} reversed={true} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={internalLegendStyle} iconType="circle" />
                    <Bar {...commonProps} dataKey="stage1" stackId="a" fill={STATUS_COLORS['รอรับเรื่อง']} name="รอรับเรื่อง" barSize={12} radius={[4, 0, 0, 4]} />
                    <Bar {...commonProps} dataKey="stage2" stackId="a" fill={STATUS_COLORS['กำลังดำเนินการ']} name="ประสานงาน" barSize={12} />
                    <Bar {...commonProps} dataKey="stage3" stackId="a" fill={STATUS_COLORS['เสร็จสิ้น']} name="ปฏิบัติงาน" barSize={12} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartWrapper>
              ) : <div className={styles.emptyState}>ไม่มีข้อมูลประสิทธิภาพ</div>}
            </div>
          </section>

          {/* Problem Type Graph */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div><h2 className={styles.sectionTitle}><Activity color="#6366f1" size={20} />ประเภท vs เวลา</h2><p className={styles.sectionSubtitle}>จำนวน/เวลาเฉลี่ย ({timeRange.toUpperCase()})</p></div>
            </div>
            <div className={styles.chartWrapper}>
                {problemTypeData.length > 0 ? (
                  <ChartWrapper height={300}>
                    <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={isMobile ? 80 : 100} tickFormatter={(value) => truncateText(value, 10)} axisLine={false} tickLine={false} tick={{fontSize: 10}} reversed={true} />
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={internalLegendStyle} iconType="circle" />
                      <Bar {...commonProps} dataKey="count" name="จำนวน" barSize={12} fill={STATUS_COLORS['ส่งต่อ']} />
                      <Bar {...commonProps} dataKey="avgTime" name="เวลา(ชม.)" barSize={12} fill={STATUS_COLORS['กำลังดำเนินการ']} />
                    </ComposedChart>
                  </ChartWrapper>
                ) : <p className={styles.emptyState}>ไม่มีข้อมูล</p>}
            </div>
          </section>
        </div>

        <div className={styles.responsiveGrid2}>
            {/* Satisfaction */}
            <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle} style={{marginBottom:'16px'}}>ความพึงพอใจ</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: '#f59e0b', fontSize: '14px'}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const percent = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{backgroundColor: '#f59e0b', width: `${percent}%`}}></div>
                                </div>
                                <span className={styles.starPercent}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
            </section>

            {/* Staff Efficiency */}
            <section className={styles.sectionCard}>
                <div className={styles.topHeader}>
                    <h3 className={styles.sectionTitle}><Users size={18} /> ประสิทธิภาพเจ้าหน้าที่</h3>
                    <div className={styles.topBadge}>ทั้งหมด: {totalStaffCount} คน</div>
                </div>
                <div className={styles.chartWrapper}>
                    {staffData.length > 0 ? (
                      <ChartWrapper height={Math.max(400, staffData.length * 60)}>
                        <BarChart layout="vertical" data={staffData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={isSmallMobile ? 80 : 120} axisLine={false} tickLine={false} tickFormatter={(val) => truncateText(val, 15)} tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} reversed={true} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={internalLegendStyle} />
                          {Object.keys(STATUS_COLORS).filter(k => !['NULL', 'ทั้งหมด', 'กำลังดำเนินการ'].includes(k)).map((status) => (
                            <Bar {...commonProps} key={status} dataKey={status} stackId="staff" fill={STATUS_COLORS[status]} barSize={16} name={status} />
                          ))}
                        </BarChart>
                      </ChartWrapper>
                    ) : <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default StatisticsView;
