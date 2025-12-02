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
// 1. ปรับค่าสี Hex Code ให้ตรงกับในไฟล์ CSS เป๊ะๆ เพื่อให้กราฟสีเดียวกับ Text
const STATUS_COLORS = {
  'รอรับเรื่อง': '#ff4d4f',      // waiting (แดง)
  'กำลังประสานงาน': '#9c27b0',   // coordinating (ม่วง)
  'กำลังดำเนินการ': '#ffc107',   // action (เหลือง)
  'เสร็จสิ้น': '#4caf50',        // finished (เขียว)
  'ส่งต่อ': '#2196f3',         // forward (ฟ้า)
  'เชิญร่วม': '#00bcd4',         // invite (Cyan)
  'ปฏิเสธ': '#64748b',         // reject (เทา)
  'NULL': '#d1d5db'
};

// 2. สร้าง Mapping เพื่อเชื่อมชื่อไทย -> ชื่อ Class ใน CSS
// (เช่น 'รอรับเรื่อง' -> styles['text-waiting'])
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

// --- Mock Data ---
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
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      // หากต้องการ test โดยไม่มี token/orgId ให้ comment บรรทัดนี้ชั่วคราว
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

        // 4. Staff Count
        const staffCountRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) {
          const data = await staffCountRes.json();
          const count = data.staff_count ? parseInt(data.staff_count, 10) : 0;
          setTotalStaffCount(count);
        }

        // 5. Staff Activities
        const staffRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
               const name = item.staff_name || "Unknown";
               const status = item.new_status || "NULL"; 
               const count = item.count || 0; 

               if (!grouped[name]) {
                 grouped[name] = { name: name, total: 0 };
               }
               if (!grouped[name][status]) {
                 grouped[name][status] = 0;
               }
               grouped[name][status] += count;
               grouped[name].total += count;
            });
          }

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

  // กำหนดข้อมูลพื้นฐานของการ์ด (ตัด bg/color hardcode ออก แล้วใช้ key แทน)
  const statusCardConfig = [
    { title: 'ทั้งหมด', count: getTotalCases(), key: 'total' },
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), key: 'waiting' },
    { title: 'กำลังประสาน', count: getStatusCount('กำลังประสานงาน'), key: 'coordinating' },
    { title: 'ดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), key: 'action' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), key: 'finished' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), key: 'forward' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), key: 'invite' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), key: 'reject' },
  ];

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
           <p style={{textAlign: 'center', color: '#9ca3af'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className={styles.responsiveGrid4}>
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              
              // Map ชื่อ key (เช่น 'waiting') ไปเป็นชื่อ class ใน CSS (เช่น styles['text-waiting'])
              const cssKey = STATUS_KEY_MAP[card.title] || 'total';
              
              const textClass = styles[`text-${cssKey}`];      // e.g. styles['text-waiting']
              const badgeClass = styles[`badge-${cssKey}`];    // e.g. styles['badge-waiting']
              const badgeBaseClass = styles['badge-status'];   // Base class for styling

              return (
                <div key={idx} className={styles.statusCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    {/* ใช้ Class จาก CSS แทนการใส่ style color ตรงๆ */}
                    <span className={`${styles.cardCount} ${textClass}`}>
                      {card.count}
                    </span>
                  </div>
                  {/* ใช้ Class Badge จาก CSS */}
                  <div className={`${badgeBaseClass} ${badgeClass}`}>
                    {percent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้ม (7 วัน)
              </h2>
              <p className={styles.sectionSubtitle}>ยอดรับเรื่อง vs สถานะ</p>
            </div>
          </div>
          <div className={styles.chartContainer}>
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
                {/* ใช้สีจาก STATUS_COLORS ที่แก้ให้ตรงกับ CSS แล้ว */}
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} dot={{r: 3}} name="ทั้งหมด" />
                <Line type="monotone" dataKey="pending" stroke={STATUS_COLORS['รอรับเรื่อง']} strokeWidth={2} dot={{r: 2}} name="รอรับ" />
                <Line type="monotone" dataKey="coordinating" stroke={STATUS_COLORS['กำลังประสานงาน']} strokeWidth={2} dot={{r: 2}} name="ประสาน" />
              </LineChart>
            </ResponsiveContainer>
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
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={efficiencyData} 
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="id" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10}} 
                  />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                  {/* ใช้สีจาก STATUS_COLORS */}
                  <Bar dataKey="stage1" stackId="a" fill={STATUS_COLORS['รอรับเรื่อง']} name="รอรับ" barSize={16} />
                  <Bar dataKey="stage2" stackId="a" fill={STATUS_COLORS['กำลังประสานงาน']} name="ประสาน" barSize={16} />
                  <Bar dataKey="stage3" stackId="a" fill={STATUS_COLORS['กำลังดำเนินการ']} name="ดำเนินการ" barSize={16} />
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
                <p className="sectionSubtitle">ความสัมพันธ์ (จำนวน/เวลา)</p>
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
                        <BarChart 
                          layout="vertical" 
                          data={staffData} 
                          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={140} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} 
                          />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                          {Object.keys(STATUS_COLORS).filter(k => k !== 'NULL').map((status) => (
                            <Bar 
                              key={status} 
                              dataKey={status} 
                              stackId="staff" 
                              fill={STATUS_COLORS[status]} 
                              barSize={20}
                              name={status}
                            />
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
