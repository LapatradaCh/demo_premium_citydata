import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity,
  Clock
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

// Mapping สีตามสถานะ
const STATUS_COLORS = {
  'รอรับเรื่อง': '#f87171',       // Red-400
  'กำลังประสานงาน': '#c084fc',    // Purple-400
  'กำลังดำเนินการ': '#facc15',    // Yellow-400
  'เสร็จสิ้น': '#4ade80',         // Green-400
  'ส่งต่อ': '#60a5fa',           // Blue-400
  'เชิญร่วม': '#2dd4bf',          // Teal-400
  'ปฏิเสธ': '#9ca3af',           // Gray-400
  'NULL': '#e5e7eb',             // Gray-200 (Fallback)
  'default': '#e5e7eb'
};

// ลำดับการเรียงใน Stack Bar (เพื่อให้สีเรียงสวยงามเหมือนกันทุกแถว)
const STATUS_ORDER = [
  'รอรับเรื่อง',
  'กำลังประสานงาน',
  'กำลังดำเนินการ',
  'ส่งต่อ',
  'เชิญร่วม',
  'เสร็จสิ้น',
  'ปฏิเสธ'
];

const StatisticsView = ({ organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [staffTotalCount, setStaffTotalCount] = useState(0); // State สำหรับจำนวนเจ้าหน้าที่รวม
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
      }

      setLoading(true);

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // 1. Fetch Overview Stats
        const statsRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Fetch Problem Types
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

        // 3. Fetch Satisfaction
        const satRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) {
          const data = await satRes.json();
          setSatisfactionData(data);
        }

        // 4. Fetch Staff Total Count (New API)
        const staffCountRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) {
          const data = await staffCountRes.json();
          // สมมติ API return { count: 15 } หรือ return เป็นตัวเลขโดยตรง
          const count = typeof data === 'object' ? (data.count || data.total || 0) : data;
          setStaffTotalCount(count);
        }

        // 5. Fetch Staff Activities & Process for Stacked Bar
        const staffRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          
          const grouped = {};
          rawData.forEach(item => {
             const name = item.staff_name || "Unknown";
             const count = parseInt(item.count, 10) || 0;
             const status = item.status || "NULL"; // สมมติว่า API ส่ง status มาด้วย
             
             if (!grouped[name]) {
               grouped[name] = { total: 0, breakdown: {} };
             }
             
             grouped[name].total += count;
             
             if (!grouped[name].breakdown[status]) {
               grouped[name].breakdown[status] = 0;
             }
             grouped[name].breakdown[status] += count;
          });

          // แปลง Object เป็น Array แล้ว Sort ตาม Total
          const staffArray = Object.entries(grouped)
            .map(([name, data]) => ({ 
              name, 
              count: data.total, 
              breakdown: data.breakdown 
            }))
            .sort((a, b) => b.count - a.count)
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

  const maxStaffCount = Math.max(...staffData.map(s => s.count), 0);

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

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้มเรื่องร้องเรียน (Trend Analysis)
              </h2>
              <p className={styles.sectionSubtitle}>เปรียบเทียบยอดรับเรื่อง vs สถานะในช่วง 7 วันที่ผ่านมา (Mockup)</p>
            </div>
            <div className={styles.legendContainer}>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#3b82f6'}}></div> ทั้งหมด
               </span>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#f87171'}}></div> รอรับเรื่อง
               </span>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#c084fc'}}></div> กำลังประสาน
               </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="เรื่องทั้งหมด" />
                <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} dot={{r: 3}} name="รอรับเรื่อง" />
                <Line type="monotone" dataKey="coordinating" stroke="#c084fc" strokeWidth={2} dot={{r: 3}} name="กำลังประสานงาน" />
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
                  เจาะลึกประสิทธิภาพ (Time Breakdown)
                </h2>
                <p className={styles.sectionSubtitle}>วิเคราะห์คอขวดของเวลาในแต่ละขั้นตอน (Mockup)</p>
              </div>
            </div>
            
            <div className={styles.summaryBadge}>
                <span className={styles.summaryText}>ค่าเฉลี่ยรวม: 1 วัน 4 ชม.</span>
                <span className={styles.summaryTag}>เร็วขึ้น 12.5%</span>
            </div>

            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="id" type="category" width={70} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รอรับเรื่อง (ชม.)" radius={[4, 0, 0, 4]} barSize={20} />
                  <Bar dataKey="stage2" stackId="a" fill="#d8b4fe" name="ประสานงาน (ชม.)" barSize={20} />
                  <Bar dataKey="stage3" stackId="a" fill="#fde047" name="ดำเนินการ (ชม.)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Activity color="#6366f1" size={20} />
                  ความสัมพันธ์ ประเภท vs เวลา
                </h2>
                <p className={styles.sectionSubtitle}>ประเภทปัญหาเทียบกับเวลาแก้ไข (Count Real / Time Mock)</p>
              </div>
            </div>

            {problemTypeData.length > 0 ? (
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid stroke="#f3f4f6" horizontal={true} vertical={true} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="จำนวนเรื่อง" barSize={20} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgTime" name="เวลาเฉลี่ย (Mock ชม.)" barSize={20} fill="#f97316" radius={[0, 4, 4, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyState}>ไม่มีข้อมูลประเภทปัญหา</p>
            )}
          </section>

        </div>

        <div className={styles.responsiveGrid2}>
            <section className={styles.sectionCard}>
                <h3 style={{fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', marginTop: 0}}>ความพึงพอใจของประชาชน</h3>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>
                          {satisfactionData.overall_average.toFixed(2)}
                        </span>
                        <span style={{color: '#9ca3af', paddingBottom: '4px'}}>/ 5</span>
                        <div style={{color: '#facc15', paddingBottom: '4px'}}>
                            {'★'.repeat(Math.round(satisfactionData.overall_average))}
                            {'☆'.repeat(5 - Math.round(satisfactionData.overall_average))}
                        </div>
                        <span style={{fontSize: '12px', color: '#9ca3af', paddingBottom: '4px'}}>
                          ({satisfactionData.total_count} ความเห็น)
                        </span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const count = item ? item.count : 0;
                           const percent = satisfactionData.total_count > 0 ? (count / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div 
                                      className={styles.progressBar} 
                                      style={{
                                        backgroundColor: percent > 0 ? '#facc15' : '#e5e7eb', 
                                        width: `${percent}%`
                                      }}
                                    ></div>
                                </div>
                                <span className={styles.starPercent}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : (
                    <div className={styles.emptyState}>ไม่มีข้อมูลความพึงพอใจ</div>
                )}
            </section>

            {/* 6. Staff Performance with Stacked Bar */}
            <section className={styles.sectionCard}>
                <div className={styles.topHeader}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <h3 style={{fontWeight: 'bold', color: '#1f2937', margin: 0}}>10 อันดับเจ้าหน้าที่</h3>
                    </div>
                    {/* แสดงจำนวนเจ้าหน้าที่ที่ fetch มาได้ */}
                    <div className={styles.topBadge}>
                      เจ้าหน้าที่ทั้งหมด: {staffTotalCount}
                    </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {staffData.length > 0 ? staffData.map((staff, i) => {
                        // คำนวณความกว้างของ Bar ทั้งหมดเทียบกับเจ้าหน้าที่ที่ทำได้มากที่สุด (maxStaffCount)
                        const totalBarWidthPercent = maxStaffCount > 0 ? (staff.count / maxStaffCount) * 100 : 0;
                        
                        return (
                          <div key={i} className={styles.staffRow}>
                              <div className={styles.staffInfo}>
                                  <div className={styles.staffAvatar}>
                                      {staff.name.charAt(0)}
                                  </div>
                                  <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span className={styles.staffName}>{staff.name}</span>
                                  </div>
                              </div>
                              <div className={styles.staffStats}>
                                  {/* Stacked Bar Container */}
                                  <div className={styles.stackedBarContainer}>
                                      {/* ตัว Bar หลักที่ความยาวแปรผันตาม Total Count */}
                                      <div 
                                        className={styles.stackedBarWrapper}
                                        style={{ width: `${totalBarWidthPercent}%` }}
                                      >
                                        {/* วนลูปสร้าง Segment สีตาม Status */}
                                        {STATUS_ORDER.map((statusKey) => {
                                          const count = staff.breakdown[statusKey] || 0;
                                          if (count === 0) return null;
                                          
                                          // ความกว้างของ Segment นี้ เทียบกับ Total ของเจ้าหน้าที่คนนี้
                                          const segmentPercent = (count / staff.count) * 100;
                                          const color = STATUS_COLORS[statusKey] || STATUS_COLORS['default'];

                                          return (
                                            <div
                                              key={statusKey}
                                              className={styles.stackedSegment}
                                              style={{ 
                                                width: `${segmentPercent}%`,
                                                backgroundColor: color
                                              }}
                                              title={`${statusKey}: ${count}`} // Tooltip แบบ Simple
                                            />
                                          );
                                        })}
                                        {/* จัดการกับ Status อื่นๆ ที่ไม่อยู่ใน Order ถ้ามี */}
                                        {Object.keys(staff.breakdown).map(key => {
                                            if (STATUS_ORDER.includes(key)) return null;
                                            const count = staff.breakdown[key];
                                            const segmentPercent = (count / staff.count) * 100;
                                            return (
                                              <div 
                                                key={key} 
                                                className={styles.stackedSegment}
                                                style={{ width: `${segmentPercent}%`, backgroundColor: STATUS_COLORS['NULL'] }}
                                                title={`${key}: ${count}`}
                                              />
                                            );
                                        })}
                                      </div>
                                  </div>
                                  <span className={styles.staffCount}>{staff.count}</span>
                              </div>
                          </div>
                        );
                    }) : (
                       <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>
                    )}
                </div>

                {/* Legend สำหรับ Stacked Bar */}
                <div className={styles.stackedLegend}>
                   {STATUS_ORDER.map(status => (
                     <div key={status} className={styles.legendItem}>
                        <div className={styles.dot} style={{backgroundColor: STATUS_COLORS[status]}}></div>
                        <span>{status}</span>
                     </div>
                   ))}
                </div>
            </section>
        </div>

      </main>
    </div>
  );
};

export default StatisticsView;
