import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity,
  Clock,
  Users // เพิ่ม icon สำหรับจำนวน Staff
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

import styles from './StatisticsView.module.css';

// --- Configuration ---
// กำหนดสีตาม Status ที่ระบุในภาพ
const STATUS_COLORS = {
  'รอรับเรื่อง': '#ef4444',      // Red
  'กำลังประสานงาน': '#a855f7',   // Purple
  'กำลังดำเนินการ': '#f59e0b',   // Amber
  'เสร็จสิ้น': '#22c55e',        // Green
  'ส่งต่อ': '#3b82f6',           // Blue
  'เชิญร่วม': '#06b6d4',         // Cyan
  'ปฏิเสธ': '#6b7280',           // Gray
  'NULL': '#d1d5db'              // Light Gray
};

// --- Mock Data (ส่วนที่ยังไม่มี API) ---
const trendData = [
  { date: '12/11', total: 2, pending: 1, coordinating: 0, completed: 1 },
  { date: '13/11', total: 3, pending: 2, coordinating: 1, completed: 0 },
  { date: '14/11', total: 1, pending: 0, coordinating: 1, completed: 0 },
  { date: '15/11', total: 4, pending: 1, coordinating: 3, completed: 0 },
  { date: '16/11', total: 2, pending: 1, coordinating: 1, completed: 0 },
  { date: '17/11', total: 5, pending: 2, coordinating: 3, completed: 0 }, 
  { date: '18/11', total: 5, pending: 2, coordinating: 3, completed: 0 }, 
];

const efficiencyData = [
  { id: 'Ticket-001', stage1: 0.5, stage2: 2, stage3: 24, total: 26.5, type: 'ไฟฟ้า' },
  { id: 'Ticket-002', stage1: 1.0, stage2: 4, stage3: 12, total: 17.0, type: 'ต้นไม้' },
  { id: 'Ticket-003', stage1: 0.2, stage2: 1, stage3: 48, total: 49.2, type: 'ต้นไม้' },
  { id: 'Ticket-004', stage1: 0.8, stage2: 5, stage3: 10, total: 15.8, type: 'ต้นไม้' },
  { id: 'Ticket-005', stage1: 0.5, stage2: 3, stage3: 20, total: 23.5, type: 'ต้นไม้' },
];

const StatisticsView = ({ organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); // State สำหรับ API ใหม่
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

      setLoading(true);

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // 1. Overview Stats
        const statsRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Problem Types
        const typeRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          const formatted = data.map(item => ({
            name: item.issue_type_name,
            count: parseInt(item.count, 10),
            avgTime: Math.floor(Math.random() * 30) + 5 
          })).sort((a, b) => b.count - a.count);
          setProblemTypeData(formatted);
        }

        // 3. Satisfaction
        const satRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) {
          const data = await satRes.json();
          setSatisfactionData(data);
        }

        // 4. Staff Count (New API Requirement)
        const staffCountRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) {
          const data = await staffCountRes.json();
          // สมมติ API return { count: 50 } หรือ เป็นตัวเลขตรงๆ
          const count = data.count ? parseInt(data.count, 10) : (parseInt(data, 10) || 0);
          setTotalStaffCount(count);
        }

        // 5. Staff Activities (Adjusted for Stacked Bar)
        const staffRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          
          // Process Data: Group by Staff Name AND Status
          const grouped = {};
          rawData.forEach(item => {
             const name = item.staff_name || "Unknown";
             const status = item.status || "NULL"; // ต้องมั่นใจว่า API return field status หรือ field ที่เทียบเคียง
             const count = parseInt(item.count, 10) || 0;

             if (!grouped[name]) {
               grouped[name] = { name: name, total: 0 };
             }
             
             // เก็บค่าตาม Status Key
             if (!grouped[name][status]) {
               grouped[name][status] = 0;
             }
             grouped[name][status] += count;
             grouped[name].total += count;
          });

          // Convert to Array, Sort by Total, Limit Top 10
          const staffArray = Object.values(grouped)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

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
  }, [organizationId]);

  // Helpers
  const getTotalCases = () => {
    if (!statsData) return 0;
    return Object.values(statsData).reduce((a, b) => a + b, 0);
  };

  const getStatusCount = (statusKey) => {
    return statsData?.[statusKey] || 0;
  };

  const getPercent = (val, total) => {
    return total > 0 ? (val / total) * 100 : 0;
  };

  const statusCardConfig = [
    { title: 'ทั้งหมด', count: getTotalCases(), color: '#6c757d', bg: '#ffffff', border: '#e5e7eb' },
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), color: '#dc3545', bg: '#fef2f2', border: '#fee2e2' },
    { title: 'กำลังประสานงาน', count: getStatusCount('กำลังประสานงาน'), color: '#9b59b6', bg: '#faf5ff', border: '#f3e8ff' },
    { title: 'กำลังดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), color: '#ffc107', bg: '#fefce8', border: '#fef9c3' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), color: '#057A55', bg: '#f0fdf4', border: '#dcfce7' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), color: '#007bff', bg: '#eff6ff', border: '#dbeafe' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), color: '#20c997', bg: '#ecfeff', border: '#cffafe' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), color: '#6b7280', bg: '#f9fafb', border: '#f3f4f6' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.headerSubtitle}>
              {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลปัจจุบัน
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        
        {/* 1. Status Cards */}
        {loading && !statsData ? (
           <p style={{textAlign: 'center', color: '#9ca3af'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className={styles.responsiveGrid4}>
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              return (
                <div 
                  key={idx} 
                  className={`${styles.statusCard} ${styles.hoverShadow}`}
                  style={{
                    backgroundColor: card.bg,
                    borderColor: card.border,
                    borderTopColor: card.color
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={styles.cardCount} style={{color: card.color}}>
                      {card.count}
                    </span>
                  </div>
                  <div className={styles.cardPercent}>({percent.toFixed(2)}%)</div>
                </div>
              );
            })}
          </section>
        )}

        {/* 2. Trend Analysis */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้มเรื่องร้องเรียน (Trend Analysis)
              </h2>
              <p className={styles.sectionSubtitle}>เปรียบเทียบยอดรับเรื่อง vs สถานะในช่วง 7 วันที่ผ่านมา</p>
            </div>
            <div className={styles.legendContainer}>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#3b82f6'}}></div> ทั้งหมด</span>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#f87171'}}></div> รอรับเรื่อง</span>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#c084fc'}}></div> กำลังประสาน</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="เรื่องทั้งหมด" />
                <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} dot={{r: 3}} name="รอรับเรื่อง" />
                <Line type="monotone" dataKey="coordinating" stroke="#c084fc" strokeWidth={2} dot={{r: 3}} name="กำลังประสานงาน" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className={styles.responsiveGrid2}>
          
          {/* 3. Efficiency Breakdown */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Clock color="#f97316" size={20} />
                  เจาะลึกประสิทธิภาพ (Time Breakdown)
                </h2>
                <p className={styles.sectionSubtitle}>วิเคราะห์คอขวดของเวลาในแต่ละขั้นตอน</p>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="id" type="category" width={70} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รอรับเรื่อง" barSize={20} />
                  <Bar dataKey="stage2" stackId="a" fill="#d8b4fe" name="ประสานงาน" barSize={20} />
                  <Bar dataKey="stage3" stackId="a" fill="#fde047" name="ดำเนินการ" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 4. Correlation */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Activity color="#6366f1" size={20} />
                  ความสัมพันธ์ ประเภท vs เวลา
                </h2>
                <p className={styles.sectionSubtitle}>ประเภทปัญหาเทียบกับเวลาแก้ไข</p>
              </div>
            </div>
            {problemTypeData.length > 0 ? (
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical">
                    <CartesianGrid stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="จำนวน" barSize={20} fill="#3b82f6" />
                    <Bar dataKey="avgTime" name="เวลาเฉลี่ย" barSize={20} fill="#f97316" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyState}>ไม่มีข้อมูล</p>
            )}
          </section>

        </div>

        <div className={styles.responsiveGrid2}>
            
            {/* 5. Satisfaction */}
            <section className={styles.sectionCard}>
                <h3 style={{fontWeight: 'bold', color: '#1f2937', marginBottom: '16px'}}>ความพึงพอใจ</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: '#facc15'}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const percent = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{backgroundColor: '#facc15', width: `${percent}%`}}></div>
                                </div>
                                <span className={styles.starPercent}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
            </section>

            {/* 6. Staff Performance (UPDATED: Stacked Bar + Count API) */}
            <section className={styles.sectionCard}>
                <div className={styles.topHeader}>
                    <h3 style={{fontWeight: 'bold', color: '#1f2937', margin: 0}}>อันดับประสิทธิภาพเจ้าหน้าที่</h3>
                    {/* แสดงจำนวน Staff จาก API staff-count */}
                    <div className={styles.topBadge}>
                       <Users size={14} style={{marginRight: '4px'}}/>
                       เจ้าหน้าที่ทั้งหมด: {totalStaffCount} คน
                    </div>
                </div>
                
                <div className={styles.staffChartContainer}>
                    {staffData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          layout="vertical" 
                          data={staffData} 
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fontWeight: 500, fill: '#374151'}} 
                          />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                          {/* Stacked Bars for each status */}
                          {Object.keys(STATUS_COLORS).map((status, index) => (
                            <Bar 
                              key={status} 
                              dataKey={status} 
                              stackId="staff" 
                              fill={STATUS_COLORS[status]} 
                              barSize={24}
                              name={status}
                            />
                          ))}
                          <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
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
