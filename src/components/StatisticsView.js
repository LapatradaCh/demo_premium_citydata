import React, { useState, useEffect } from "react";

// --- (*** NEW: Inline SVG Icons ***) ---
// (แทนที่ react-icons/fa)

const FaStar = ({ className = "w-5 h-5", style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

const FaChevronDown = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const FaChevronUp = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M14.77 12.79a.75.75 0 01-1.06-.02L10 9.06l-3.71 3.71a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 01.02 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const FaTimes = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

// --- (*** END NEW: Inline SVG Icons ***) ---


// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติเดิม ***)

// (Component ย่อยสำหรับกล่อง KPI แบบละเอียด 8 กล่อง)
const StatsDetailBox = ({ title, value, percentage, note, color, cssClass }) => (
  <div
    className={`bg-white p-3 md:p-4 rounded-lg shadow-sm border-t-4 flex flex-col justify-between ${cssClass}`}
    style={{ borderTopColor: color }}
  >
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
      <span className="text-xs md:text-sm font-semibold text-gray-600 order-2 sm:order-1">{title}</span>
      <span className="text-xl md:text-2xl font-bold text-gray-900 order-1 sm:order-2">{value}</span>
    </div>
    <span className="text-xs text-gray-500 mb-1">({percentage}%)</span>
    {note && <span className="text-xs text-gray-500 italic">{note}</span>}
  </div>
);

// (Component ย่อยสำหรับ Horizontal Bar Chart - รองรับข้อมูลจริง)
const DynamicHorizontalBarChart = ({ data }) => {
  const colors = ["#007bff", "#ffc107", "#057A55", "#6c757d", "#dc3545", "#20c997"];
  const maxCount = Math.max(...data.map(item => item.count), 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-600 mb-2">ไม่มีข้อมูลเรื่องแจ้ง</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

        return (
          <div key={item.issue_type_name} className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-28 sm:w-32 flex-shrink-0 truncate" title={item.issue_type_name}>
              {item.issue_type_name}
            </span>
            <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${widthPercent}%`,
                  background: colors[index % colors.length]
                }}
                title={`${item.issue_type_name}: ${item.count}`}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-800 w-10 text-right">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
};

// (Component ย่อยสำหรับกล่อง "ประเภทปัญหา" - ดึงข้อมูลจริง)
const ProblemTypeStats = ({ organizationId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false); 
        return; 
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch chart data: ${response.statusText}`);
        }

        const data = await response.json();

        const formattedData = data.map(item => ({
          ...item,
          count: parseInt(item.count, 10)
        })).sort((a, b) => b.count - a.count); 

        setChartData(formattedData);
      } catch (err) {
         if (err instanceof SyntaxError) {
          setError("Failed to parse JSON. API might be returning HTML (404).");
         } else {
          setError(err.message);
         }
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [organizationId]); 

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h4 className="text-lg font-bold text-gray-800 mb-4">สัดส่วนเรื่องแจ้งตามประเภท</h4>
      <div className="w-full">
        {loading && <p className="text-sm text-gray-600 mb-2">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-sm text-red-500 mb-2">เกิดข้อผิดพลาด: {error}</p>}
        {chartData && <DynamicHorizontalBarChart data={chartData} />}
      </div>
    </div>
  );
};


// (*** MODIFIED: Component 'SatisfactionBox' - ดึงข้อมูลจริง ***)
const SatisfactionBox = ({ organizationId }) => {
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (useEffect สำหรับดึงข้อมูลความพึงพอใจ)
  useEffect(() => {
    const fetchSatisfactionData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
        return; 
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch satisfaction data: ${response.statusText}`);
        }

        const data = await response.json();
        
        setSatisfactionData(data);

      } catch (err) {
         if (err instanceof SyntaxError) {
          setError("Failed to parse JSON. API might be returning HTML (404).");
         } else {
          setError(err.message);
         }
      } finally {
        setLoading(false);
      }
    };

    fetchSatisfactionData();
  }, [organizationId]); // (ให้ re-fetch เมื่อ organizationId เปลี่ยน)

  // (Helper function สำหรับ Render ดาวตามคะแนนเฉลี่ย)
  const renderStars = (average) => {
    const roundedAverage = Math.round(average);

    return (
      <div className="flex gap-0.5 text-yellow-400 text-xl">
        {[...Array(roundedAverage)].map((_, i) => <FaStar key={`full-${i}`} className="w-5 h-5" />)}
        {[...Array(5 - roundedAverage)].map((_, i) => <FaStar key={`empty-${i}`} className="w-5 h-5 text-gray-300" />)}
      </div>
    );
  };

  // (*** MODIFIED: ส่วน Render ที่ใช้ข้อมูลจริง ***)
  
  // (1. Loading State)
  if (loading) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4">ความพึงพอใจของประชาชน</h4>
        <div className="flex flex-col gap-3">
           <p className="text-sm text-gray-600 mb-2">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // (2. Error State)
  if (error) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4">ความพึงพอใจของประชาชน</h4>
        <div className="flex flex-col gap-3">
           <p className="text-sm text-red-500 mb-2">เกิดข้อผิดพลาด: {error}</p>
        </div>
      </div>
    );
  }
  
  // (3. No Data State)
  if (!satisfactionData || satisfactionData.total_count === 0) {
     return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4">ความพึงพอใจของประชาชน</h4>
        <div className="flex flex-col gap-3">
           <p className="text-sm text-gray-600 mb-2">ไม่มีข้อมูลความพึงพอใจ</p>
        </div>
      </div>
    );
  }

  // (4. Success State - คำนวณ % สำหรับ breakdown)
  const { overall_average, total_count, breakdown } = satisfactionData;

  const breakdownWithPercent = breakdown.map(item => ({
    stars: item.score,
    count: item.count,
    percent: total_count > 0 ? (item.count / total_count) * 100 : 0 
  }));

  // (Render UI จริง)
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h4 className="text-lg font-bold text-gray-800 mb-4">ความพึงพอใจของประชาชน</h4>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 border-b pb-3 mb-2">
          
          <span className="text-2xl font-bold text-gray-900">
            {overall_average.toFixed(2)}/5 
          </span>
          
          {renderStars(overall_average)}
          
          <span className="text-sm text-gray-500">
            ({total_count} ความเห็น)
          </span>

        </div>

        {breakdownWithPercent.map((item) => (
          <div key={item.stars} className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-600 w-12 flex-shrink-0">
              {item.stars} <FaStar className="w-4 h-4 text-yellow-400" />
            </span>
            <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${item.percent.toFixed(2)}%`, 
                  backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 w-10 text-right">
              {item.percent.toFixed(0)}% 
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
// (*** END MODIFIED SatisfactionBox ***)


// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab, organizationId }) => {
  const [isOpsUnitsOpen, setIsOpsUnitsOpen] = useState(false);

  // (State สำหรับสถิติหลัก)
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (State สำหรับจำนวนเจ้าหน้าที่)
  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

  // (CSS Classes สำหรับ KPI Boxes)
  // (*** MODIFIED: เปลี่ยนจาก cssClass ใน object เป็นการ map ภายนอก)
  const kpiColorsAndClasses = {
    total: { color: "#6c757d", className: "bg-gray-100 border-gray-400" },
    รอรับเรื่อง: { color: "#dc3545", className: "bg-red-50 border-red-500" },
    กำลังประสานงาน: { color: "#9b59b6", className: "bg-purple-50 border-purple-500" },
    กำลังดำเนินการ: { color: "#ffc107", className: "bg-yellow-50 border-yellow-400" },
    เสร็จสิ้น: { color: "#057A55", className: "bg-green-50 border-green-600" },
    ส่งต่อ: { color: "#007bff", className: "bg-blue-50 border-blue-500" },
    เชิญร่วม: { color: "#20c997", className: "bg-teal-50 border-teal-400" },
    ปฏิเสธ: { color: "#6c757d", className: "bg-gray-100 border-gray-400" },
  };

  // (โครงสร้าง KPI)
  const kpiStructure = [
    { id: "total", title: "ทั้งหมด", note: null },
    { id: "รอรับเรื่อง", title: "รอรับเรื่อง", note: "เกิน 1 เดือน {pending_overdue} เรื่อง" },
    { id: "กำลังประสานงาน", title: "กำลังประสานงาน", note: null },
    { id: "กำลังดำเนินการ", title: "กำลังดำเนินการ", note: "เกิน 1 เดือน {inprogress_overdue} เรื่อง" },
    { id: "เสร็จสิ้น", title: "เสร็จสิ้น", note: "จัดการเอง {completed_self} เรื่อง ({completed_self_perc}%)" },
    { id: "ส่งต่อ", title: "ส่งต่อ", note: "(ส่งต่อหน่วยงานอื่น)" },
    { id: "เชิญร่วม", title: "เชิญร่วม", note: null },
    { id: "ปฏิเสธ", title: "ปฏิเสธ", note: "จัดการเอง {rejected_self} เรื่อง ({rejected_self_perc}%)" },
  ];

  // (useEffect สำหรับดึงสถิติหลัก)
  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError("Missing auth token from localStorage");
        setLoading(false);
        return;
      }
      if (!organizationId) {
        setLoading(true); 
        return;
      }

      try {
        setLoading(true);
        setError(null); 

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();

        const statsObject = data.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count, 10);
          return acc;
        }, {});

        setStatsData(statsObject);
      } catch (err) {
        if (err instanceof SyntaxError) {
          setError("Failed to parse JSON. API might be returning HTML (404).");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]); 

  // (useEffect สำหรับดึงข้อมูล Staff Count)
  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setStaffError("Missing auth token");
        setStaffLoading(false);
        return;
      }
      if (!organizationId) {
        setStaffLoading(true); // รอ organizationId
        return;
      }

      try {
        setStaffLoading(true);
        setStaffError(null);

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404).");
          }
          throw new Error(`Failed to fetch staff count: ${response.statusText}`);
        }
        
        const data = await response.json(); 

        if (data.staff_count !== undefined) { 
            setStaffCount(parseInt(data.staff_count, 10)); 
        } else {
            throw new Error("Invalid data structure from staff API (expected 'staff_count')");
        }

      } catch (err) {
        if (err instanceof SyntaxError) {
          setStaffError("Failed to parse JSON (API 404?).");
        } else {
          setStaffError(err.message);
        }
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaffCount();
  }, [organizationId]); 


  // (สร้าง kpiDetails แบบไดนามิก)
  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;

  const kpiDetailsWithData = kpiStructure.map(kpi => {
    let value = 0;
    if (kpi.id === 'total') {
      value = totalCases;
    } else {
      value = statsData?.[kpi.id] || 0;
    }
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    const note = kpi.note ? kpi.note
      .replace("{pending_overdue}", 0) // (*** TODO: ดึงข้อมูลจริงสำหรับ overdue ***)
      .replace("{inprogress_overdue}", 0) // (*** TODO: ดึงข้อมูลจริงสำหรับ overdue ***)
      .replace("{completed_self}", 0) // (*** TODO: ดึงข้อมูลจริง ***)
      .replace("{completed_self_perc}", "0.0") // (*** TODO: ดึงข้อมูลจริง ***)
      .replace("{rejected_self}", 0) // (*** TODO: ดึงข้อมูลจริง ***)
      .replace("{rejected_self_perc}", "0.0") // (*** TODO: ดึงข้อมูลจริง ***)
      : null;

    const styling = kpiColorsAndClasses[kpi.id] || kpiColorsAndClasses.total;

    return { ...kpi, value, percentage, note, ...styling };
  });


  // (ส่วน Render)
  return (
    <div className="p-4 md:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
      {/* 1. Header (ชื่อหน้า) */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">ภาพรวมสถิติ</h1>
      </div>

      {/* 2. Sub-Header (วันที่ และ Subtitle) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 text-gray-500">
        <span className="text-sm">
          {new Date().toLocaleDateString("th-TH", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
        <span className="text-sm mt-1 sm:mt-0">
          ข้อมูลปัจจุบัน (จำนวนข้อมูลเรื่องทั้งหมด ที่ประชาชนแจ้งเข้ามา)
        </span>
      </div>

      {/* 4. Detailed KPI Grid (ตาราง KPI 8 กล่อง) */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mb-6 animate-pulse">
          {kpiStructure.map((kpi) => {
             const styling = kpiColorsAndClasses[kpi.id] || kpiColorsAndClasses.total;
             return (
             <div
                key={kpi.id}
                className={`rounded-lg h-28 ${styling.className} opacity-50`}
                style={{ borderTopColor: styling.color, borderTopWidth: '4px' }}
             >
                {/* Placeholder content */}
             </div>
             );
          })}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 p-10 bg-white rounded-lg shadow text-red-500">
          <FaTimes className="w-6 h-6" />
          <span>ไม่สามารถโหลดสถิติได้: {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mb-6">
          {kpiDetailsWithData.map((kpi) => (
            <StatsDetailBox
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              percentage={kpi.percentage}
              note={kpi.note}
              color={kpi.color}
              cssClass={kpi.className} // (*** MODIFIED: ใช้ className ที่เราสร้าง)
            />
          ))}
        </div>
      )}

      {/* 5. Main Chart Grid (2 คอลัมน์) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* คอลัมน์ที่ 1: ประเภทปัญหา + ความพึงพอใจ */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProblemTypeStats organizationId={organizationId} />
          
          <SatisfactionBox organizationId={organizationId} />
        
        </div>

        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-bold text-gray-800 mb-4">การปฏิบัติงานของเจ้าหน้าที่</h4>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-700">เจ้าหน้าที่ทั้งหมด</span>
              <strong className="text-base font-bold text-gray-900">
                {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
              </strong>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">ค่าเฉลี่ยโดยประมาณของระยะเวลาการทำงาน</span>
              <span className="text-sm font-semibold text-gray-800">3.2 วัน</span>
            </div>
            <div
              className="border-b pb-2"
              onClick={() => setIsOpsUnitsOpen(!isOpsUnitsOpen)}
            >
              <div className="flex justify-between items-center w-full cursor-pointer">
                <span className="text-sm text-gray-600">หน่วยงานที่ร่วมรับผิดชอบ</span>
                <span className="text-sm font-semibold text-gray-800 flex items-center">
                  5 หน่วยงาน
                  {isOpsUnitsOpen ? (
                    <FaChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <FaChevronDown className="w-4 h-4 ml-2" />
                  )}
                </span>
              </div>
              {isOpsUnitsOpen && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                  <div className="text-sm text-gray-600">xxxx หน่วยงานที่ 1</div>
                  <div className="text-sm text-gray-600">xxxx หน่วยงานที่ 2</div>
                  <div className="text-sm text-gray-600">xxxx หน่วยงานที่ 3</div>
                  <div className="text-sm text-gray-600">xxxx หน่วยงานที่ 4</div>
                  <div className="text-sm text-gray-600">xxxx หน่วยงานที่ 5</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
