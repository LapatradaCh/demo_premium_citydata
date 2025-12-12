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

  // --- Mobile Check ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Data Fetching ---
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

        // 1. Overview Stats
        const statsRes = await fetch(`${baseUrl}/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Trend Graph
        const trendRes = await fetch(`${baseUrl}/trend?organization_id=${organizationId}&range=${timeRange}`, { headers });
        if (trendRes.ok) {
          const data = await trendRes.json();
          const formattedTrend = data.map(item => ({
            ...item,
            total: Number(item.total || 0),
            pending: Number(item.pending || 0),
            action: Number(item.action || 0),
            completed: Number(item.completed || 0),
            forward: Number(item.forward || 0),
            invite: Number(item.invite || 0),
            reject: Number(item.reject || 0),
          }));
          setTrendData(formattedTrend);
        }

        // 3. Problem Types
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

        // 4. Satisfaction
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
               const count = item.count ? parseInt(item.count, 10) : 0; 
               
               if (!grouped[name]) grouped[name] = { name: name, total: 0 };
               if (!grouped[name][status]) grouped[name][status] = 0;
               
               grouped[name][status] += count;
               grouped[name].total += count;
            });
          }
          const staffArray = Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 10);
          setStaffData(staffArray);
        }

        // 7. Efficiency
        const effRes = await fetch(`${baseUrl}/efficiency?organization_id=${organizationId}`, { headers });
        if (effRes.ok) {
            const data = await effRes.json();
            const mappedData = data.map(d => ({
                ...d,
                short_title: truncateText(d.title, 15),
                stage1: Number(d.stage1 || 0),
                stage2: Number(d.stage2 || 0),
                stage3: Number(d.stage3 || 0),
            }));
            setEfficiencyData(mappedData);
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

  // Helpers
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
          <section className={styles.dashboardTopSection}>
            <div className={`${styles.statusCard} ${styles.totalCard}`} style={{ backgroundColor: STATUS_COLORS['ทั้งหมด'] }}>
                <div className={styles.cardDecoration}></div>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{totalCardData.title}</span>
                    <div className={styles.badgeStatus}>100%</div>
                </div>
                <span className={styles.cardCount}>{totalCardData.count}</span>
            </div>
            
            <div className={styles.rightGrid}>
                {otherStatusConfig.map((card, idx) => {
                    const percent = getPercent(card.count, getTotalCases());
                    const solidColor = STATUS_COLORS[card.title] || '#64748b';
                    return (
                        <div key={idx} className={styles.statusCard} style={{ backgroundColor: solidColor }}>
                            <div className={styles.cardDecoration}></div>
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
              <ResponsiveContainer 
                width="99%" /* เปลี่ยนเป็น 99% เพื่อแก้บั๊กกราฟไม่ขึ้น */
                height="100%" 
                key={`trend-${isMobile}-${trendData.length}`} 
              >
                <LineChart 
                    data={trendData} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                    dy={10} 
                    minTickGap={20}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={styles.customTooltip}>
                            <p className={styles.tooltipLabel}>{label}</p>
                            {payload.map((entry, index) => (
                              <div key={index} className={styles.tooltipItem}>
                                <div className={styles.dotIndicator} style={{backgroundColor: entry.color}}></div>
                                <span>{entry.name}: {entry.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="total" stroke={STATUS_COLORS['ทั้งหมด']} strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="ทั้งหมด" hide={activeTrendKey !== 'total'} />
                  <Line type="monotone" dataKey="pending" stroke={STATUS_COLORS['รอรับเรื่อง']} strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="รอรับเรื่อง" hide={activeTrendKey !== 'total' && activeTrendKey !== 'pending'} />
                  <Line type="monotone" dataKey="action" stroke={STATUS_COLORS['ดำเนินการ']} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} name="ดำเนินการ" hide={activeTrendKey !== 'total' && activeTrendKey !== 'action'} />
                  <Line type="monotone" dataKey="completed" stroke={STATUS_COLORS['เสร็จสิ้น']} strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="เสร็จสิ้น" hide={activeTrendKey !== 'total' && activeTrendKey !== 'completed'} />
                  <Line type="monotone" dataKey="forward" stroke={STATUS_COLORS['ส่งต่อ']} strokeWidth={3} dot={false} name="ส่งต่อ" hide={activeTrendKey !== 'total' && activeTrendKey !== 'forward'} />
                  <Line type="monotone" dataKey="invite" stroke={STATUS_COLORS['เชิญร่วม']} strokeWidth={3} dot={false} name="เชิญร่วม" hide={activeTrendKey !== 'total' && activeTrendKey !== 'invite'} />
                  <Line type="monotone" dataKey="reject" stroke={STATUS_COLORS['ปฏิเสธ']} strokeWidth={3} dot={false} name="ปฏิเสธ" hide={activeTrendKey !== 'total' && activeTrendKey !== 'reject'} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีข้อมูลในช่วงเวลานี้</div>
            )}
          </div>
          {renderCustomLegend()}
        </section>

        <div className={styles.responsiveGrid2}>
           
          {/* --- Efficiency Graph --- */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div><h2 className={styles.sectionTitle}><Clock color="#f97316" size={20} />เวลาแต่ละขั้นตอน</h2><p className={styles.sectionSubtitle}>วิเคราะห์คอขวด (ชม.)</p></div>
            </div>
            
            <div className={styles.chartWrapper}>
              {efficiencyData.length > 0 ? (
                <ResponsiveContainer 
                  width="99%" /* แก้ไข width */
                  height="100%" 
                  key={`eff-${isMobile}-${efficiencyData.length}`}
                >
                  <BarChart data={efficiencyData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey={isMobile ? "short_title" : "title"}
                      type="category" 
                      width={isMobile ? 100 : 140}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#4b5563'}} 
                      reversed={true} 
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={styles.customTooltip}>
                              <p style={{fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#1f2937'}}>{data.full_title || data.title}</p>
                              <div className={styles.tooltipItem}><div className={styles.dotIndicator} style={{backgroundColor: STATUS_COLORS['รอรับเรื่อง']}}></div><span>รอรับเรื่อง: {data.stage1} ชม.</span></div>
                              <div className={styles.tooltipItem}><div className={styles.dotIndicator} style={{backgroundColor: STATUS_COLORS['กำลังดำเนินการ']}}></div><span>ประสานงาน: {data.stage2} ชม.</span></div>
                              <div className={styles.tooltipItem}><div className={styles.dotIndicator} style={{backgroundColor: STATUS_COLORS['เสร็จสิ้น']}}></div><span>ปฏิบัติงาน: {data.stage3} ชม.</span></div>
                            </div>
                          );
                        } return null; 
                      }} 
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['รอรับเรื่อง']} name="รอรับเรื่อง" barSize={16} radius={[4, 0, 0, 4]} />
                    <Bar dataKey="stage2" stackId="a" fill={STATUS_COLORS['กำลังดำเนินการ']} name="ประสานงาน" barSize={16} />
                    <Bar dataKey="stage3" stackId="a" fill={STATUS_COLORS['เสร็จสิ้น']} name="ปฏิบัติงาน" barSize={16} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีข้อมูลประสิทธิภาพ</div>}
            </div>
          </section>

          {/* --- Problem Type Graph --- */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div><h2 className={styles.sectionTitle}><Activity color="#6366f1" size={20} />ประเภท vs เวลา</h2><p className={styles.sectionSubtitle}>จำนวน/เวลาเฉลี่ย ({timeRange.toUpperCase()})</p></div>
            </div>
            
            <div className={styles.chartWrapper}>
                {problemTypeData.length > 0 ? (
                  <ResponsiveContainer 
                    width="99%" /* แก้ไข width */
                    height="100%" 
                    key={`type-${isMobile}-${problemTypeData.length}`}
                  >
                    <ComposedChart 
                        data={problemTypeData.slice(0, 5)} 
                        layout="vertical" 
                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#f3f4f6" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={isMobile ? 90 : 100} 
                        tickFormatter={(value) => truncateText(value, 12)}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10}} 
                        reversed={true}
                      />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                      <Bar dataKey="count" name="จำนวน" barSize={16} fill={STATUS_COLORS['ส่งต่อ']} />
                      <Bar dataKey="avgTime" name="เวลา(ชม.)" barSize={16} fill={STATUS_COLORS['กำลังดำเนินการ']} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : <p className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีข้อมูล</p>}
            </div>
          </section>
        </div>

        <div className={styles.responsiveGrid2}>
            <section className={styles.sectionCard}>
                <h3 className={styles.h3Custom} style={{fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', fontSize: '16px'}}>ความพึงพอใจ</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: STATUS_COLORS['กำลังดำเนินการ']}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const percent = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{backgroundColor: STATUS_COLORS['กำลังดำเนินการ'], width: `${percent}%`}}></div>
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
                    <div className={styles.topBadge}><Users size={14} style={{marginRight: '4px'}}/>ทั้งหมด: {totalStaffCount} คน</div>
                </div>
                
                <div className={`${styles.chartWrapper} ${styles.largeHeight}`}>
                    {staffData.length > 0 ? (
                      <ResponsiveContainer 
                        width="99%" /* แก้ไข width */
                        height="100%" 
                        key={`staff-${isMobile}-${staffData.length}`}
                      >
                        <BarChart layout="vertical" data={staffData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={isMobile ? 100 : 140}
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(val) => truncateText(val, isMobile ? 12 : 20)}
                            tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} 
                            reversed={true}
                          />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          {Object.keys(STATUS_COLORS).filter(k => k !== 'NULL' && k !== 'ทั้งหมด' && k !== 'กำลังประสาน' && k !== 'ดำเนินการ').map((status) => (
                            <Bar key={status} dataKey={status} stackId="staff" fill={STATUS_COLORS[status]} barSize={20} name={status} />
                          ))}
                          <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default StatisticsView;
