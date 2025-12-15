import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart2, Star, Clock, Filter, AlertCircle, 
  CheckCircle, PieChart, Layers 
} from 'lucide-react';

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const TARGET_SLA_DAYS = 3.0; // เป้าหมาย KPI

const COLORS = {
  pending: "#EF4444",    // red-500
  inProgress: "#F59E0B", // amber-500
  completed: "#10B981",  // emerald-500
  forwarded: "#3B82F6",  // blue-500
  rejected: "#9CA3AF",   // gray-400
  invited: "#06B6D4"     // cyan-500 (เพิ่ม invited เข้ามาตาม API)
};

const LABELS = {
  pending: "รอรับเรื่อง",
  inProgress: "ดำเนินการ",
  completed: "เสร็จสิ้น",
  forwarded: "ส่งต่อ",
  rejected: "ปฏิเสธ",
  invited: "เชิญร่วม"
};

const PROBLEM_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", 
  "#8B5CF6", "#EC4899", "#6366F1", "#9CA3AF"
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- TAB 1: WORKLOAD ---
const WorkloadView = ({ data }) => {
  const [sortBy, setSortBy] = useState('total');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  const globalStats = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    const completed = data.reduce((acc, item) => acc + item.completed, 0);
    const pending = data.reduce((acc, item) => acc + item.pending, 0);
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pending, successRate };
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-90 mb-1">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">อัตราความสำเร็จ</span>
            </div>
            <div className="text-3xl font-bold">{globalStats.successRate.toFixed(1)}%</div>
            <div className="text-xs opacity-80 mt-1">จากเรื่องร้องเรียนทั้งหมด</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
            <PieChart size={18} />
            <span>เรื่องร้องเรียนทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{globalStats.total.toLocaleString()} <span className="text-sm font-normal text-gray-400">เรื่อง</span></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-red-500 mb-1 text-sm">
            <AlertCircle size={18} />
            <span>รอรับเรื่อง (ค้าง)</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{globalStats.pending.toLocaleString()} <span className="text-sm font-normal text-gray-400">เรื่อง</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>เรียงลำดับตาม:</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSortBy('total')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${sortBy === 'total' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>งานทั้งหมด</button>
          <button onClick={() => setSortBy('pending')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${sortBy === 'pending' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200'}`}>งานค้าง</button>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {sortedData.map((item) => {
          const itemSuccessRate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
          return (
            <div key={item.id || item.name} className="group">
              <div className="flex justify-between mb-1 items-end">
                <span className="font-medium text-gray-700 text-sm">{item.name}</span>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 mr-2">สำเร็จ {itemSuccessRate.toFixed(0)}%</span>
                  <span className="text-gray-400 text-xs">| รวม {item.total}</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {Object.keys(COLORS).map((key) => {
                  const val = item[key] || 0; // Handle undefined keys
                  const width = item.total > 0 ? (val / item.total) * 100 : 0;
                  if (width === 0) return null;
                  return (
                    <div 
                      key={key}
                      style={{ width: `${width}%`, backgroundColor: COLORS[key] }}
                      className="h-full first:pl-2 last:pr-2 flex items-center justify-center relative"
                      title={`${LABELS[key]}: ${val}`}
                    >
                       {width > 10 && <span className="text-[10px] text-white font-bold drop-shadow-md">{val}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

       {/* Legend */}
       <div className="flex flex-wrap justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
        {Object.keys(COLORS).map(key => (
          <div key={key} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[key] }}></span>
            {LABELS[key]}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TAB 2: SATISFACTION ---
const SatisfactionView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.satisfaction - a.satisfaction);
  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 3.0) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  if(data.length === 0) return <div className="p-10 text-center text-gray-400">ไม่มีข้อมูล</div>;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Highlights */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="text-emerald-800 text-xs font-semibold uppercase tracking-wider">คะแนนสูงสุด</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{sortedData[0]?.name || '-'}</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{sortedData[0]?.satisfaction.toFixed(1) || 0} <span className="text-sm font-normal text-emerald-400">/ 5.0</span></div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <div className="text-red-800 text-xs font-semibold uppercase tracking-wider">ต้องปรับปรุง</div>
          <div className="text-xl font-bold text-red-600 mt-1">{sortedData[sortedData.length - 1]?.name || '-'}</div>
          <div className="text-3xl font-bold text-red-500 mt-2">{sortedData[sortedData.length - 1]?.satisfaction.toFixed(1) || 0} <span className="text-sm font-normal text-red-400">/ 5.0</span></div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sortedData.map((item, index) => (
          <div key={item.id || index} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-400">({item.reviews} รีวิว)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.satisfaction >= 3 ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${(item.satisfaction / 5) * 100}%` }}></div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg border font-bold text-lg flex items-center gap-1 ${getScoreColor(item.satisfaction)}`}>
              {item.satisfaction.toFixed(1)} <Star size={14} className="fill-current" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TAB 3: EFFICIENCY ---
const EfficiencyView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.avgTime - b.avgTime);
  const maxVal = Math.max(...data.map(d => d.avgTime), TARGET_SLA_DAYS * 1.5) || 10;
  const overallAvg = data.reduce((acc, curr) => acc + curr.avgTime, 0) / (data.length || 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
        <div>
          <h4 className="font-bold text-blue-900">เป้าหมาย SLA: ภายใน {TARGET_SLA_DAYS} วัน</h4>
        </div>
        <div className="text-right">
          <span className="block text-xs text-blue-600">เวลาเฉลี่ยรวม</span>
          <span className="font-bold text-2xl text-blue-800">{overallAvg.toFixed(1)} <span className="text-sm font-normal">วัน</span></span>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-400 z-10" style={{ left: `${(TARGET_SLA_DAYS / maxVal) * 100}%` }}></div>

        <div className="space-y-5 relative z-0">
          {sortedData.map((item, index) => {
            const isOver = item.avgTime > TARGET_SLA_DAYS;
            return (
              <div key={item.id || index} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isOver ? 'text-red-700 font-medium' : 'text-gray-700 font-medium'}>{item.name}</span>
                  <span className={isOver ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{item.avgTime.toFixed(1)} วัน</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-r-md relative">
                  <div className={`h-full rounded-r-md flex items-center justify-end pr-2 transition-all duration-700 ${isOver ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${(item.avgTime / maxVal) * 100}%` }}>
                    {isOver && <AlertCircle size={14} className="text-white opacity-80" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- TAB 4: PROBLEM TYPES ---
const ProblemTypeView = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  let cumulativePercent = 0;
  
  const donutData = data.map((item, index) => {
    const percent = total > 0 ? item.count / total : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, startPercent, color: PROBLEM_COLORS[index % PROBLEM_COLORS.length] };
  });

  const getCoordinates = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className="animate-fadeIn">
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8 flex justify-between items-center">
         <div>
          <h4 className="text-gray-600 text-sm font-medium">เรื่องร้องเรียนทั้งหมด</h4>
          <p className="text-3xl font-bold text-gray-800 mt-1">{total.toLocaleString()} <span className="text-sm font-normal text-gray-500">เรื่อง</span></p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="relative w-64 h-64 flex-shrink-0">
          <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
            {donutData.map((item) => {
              const [startX, startY] = getCoordinates(item.startPercent);
              const [endX, endY] = getCoordinates(item.startPercent + item.percent);
              const largeArcFlag = item.percent > 0.5 ? 1 : 0;
              const pathData = item.percent === 1 
                ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`
                : `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
              return <path key={item.id} d={pathData} fill={item.color} stroke="white" strokeWidth="0.02" />;
            })}
            <circle cx="0" cy="0" r="0.65" fill="white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-800">{data.length}</span>
            <span className="text-xs text-gray-500">ประเภท</span>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 gap-3">
          {donutData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-700 font-medium text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full hidden sm:block overflow-hidden">
                  <div className="h-full" style={{ width: `${item.percent * 100}%`, backgroundColor: item.color }}></div>
                </div>
                <span className="text-gray-900 font-bold w-12 text-right">{item.count}</span>
                <span className="text-gray-400 text-xs w-10 text-right">{(item.percent * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT (CONNECTED)
// ==========================================
export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('workload');
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState([]);
  const [problemData, setProblemData] = useState([]);

  // *** ID องค์กรตามจริง ***
  const USER_ORG_ID = 74;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [orgRes, probRes] = await Promise.all([
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${USER_ORG_ID}`),
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-count-issue-type?org_id=${USER_ORG_ID}`)
        ]);

        if (orgRes.ok) {
          const rawOrg = await orgRes.json();
          // Map to match the component's expected format
          setOrgData(rawOrg.map(item => ({
             ...item,
             // Ensure all keys exist for the stacked chart
             pending: item.pending || 0,
             inProgress: item.inProgress || 0,
             completed: item.completed || 0,
             forwarded: item.forwarded || 0,
             rejected: item.rejected || 0,
             invited: item.invited || 0
          })));
        }
        
        if (probRes.ok) {
           const rawProb = await probRes.json();
           setProblemData(rawProb);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="h-96 flex items-center justify-center text-gray-400">กำลังโหลดข้อมูล...</div>;
    
    switch (activeTab) {
      case 'workload': return <WorkloadView data={orgData} />;
      case 'satisfaction': return <SatisfactionView data={orgData} />;
      case 'efficiency': return <EfficiencyView data={orgData} />;
      case 'problemType': return <ProblemTypeView data={problemData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
            สถิติองค์กร
          </h2>
          <p className="text-xs text-gray-400 mt-1 ml-4">Live Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'workload', label: 'ปริมาณงาน', icon: <BarChart2 size={20} />, color: 'blue' },
            { id: 'satisfaction', label: 'ความพึงพอใจ', icon: <Star size={20} />, color: 'yellow' },
            { id: 'efficiency', label: 'ประสิทธิภาพ (SLA)', icon: <Clock size={20} />, color: 'emerald' },
            { id: 'problemType', label: 'ประเภทปัญหา', icon: <Layers size={20} />, color: 'purple' },
          ].map(menu => (
            <button 
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 
                ${activeTab === menu.id 
                  ? `bg-${menu.color}-50 text-${menu.color}-700 shadow-sm font-medium` 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {menu.icon}
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden mb-4 pb-4 border-b">
             <h2 className="text-xl font-bold">สถิติองค์กร</h2>
             {/* Simple Mobile Nav could go here */}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {activeTab === 'workload' && "ภาพรวมปริมาณงานรายเขต"}
                  {activeTab === 'satisfaction' && "อันดับความพึงพอใจประชาชน"}
                  {activeTab === 'efficiency' && "ความรวดเร็วในการแก้ไขปัญหา (SLA)"}
                  {activeTab === 'problemType' && "สัดส่วนประเภทปัญหาในพื้นที่"}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-400">
                {activeTab === 'workload' && <BarChart2 size={20} />}
                {activeTab === 'satisfaction' && <Star size={20} />}
                {activeTab === 'efficiency' && <Clock size={20} />}
                {activeTab === 'problemType' && <Layers size={20} />}
              </div>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
