import React, { useState, useEffect } from "react";
import { BriefcaseBusiness, UserRoundSearch, FileText, TrendingUp } from "lucide-react";
import BarChartOne from "../../components/charts/BarChartOne";
import LineChartOne from "../../components/charts/LineChartOne";

const statCards = [
  { label: "Tin dang tuyen", value: "128", delta: "+12.4%", up: true, icon: BriefcaseBusiness },
  { label: "Ung vien moi", value: "2,341", delta: "+8.1%", up: true, icon: UserRoundSearch },
  { label: "Ho so dang xu ly", value: "312", delta: "-3.2%", up: false, icon: FileText },
  { label: "Ti le chuyen doi", value: "18.6%", delta: "+1.9%", up: true, icon: TrendingUp },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ivory-deep border-t-brand mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="text-left pb-8 border-b border-gray-100">
        <p className="vw-section-label">Hệ thống quản trị</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Tổng quan hệ thống.</h1>
        <p className="text-gray-500 mt-4 max-w-2xl font-medium">Bố cục thông tin đầy đủ, bề mặt sáng và cấu trúc phân cấp rõ ràng cho quản trị viên.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map(({ label, value, delta, up, icon: Icon }) => (
          <div key={label} className="vw-card p-8 !rounded-2xl hover:shadow-md group cursor-default bg-white border border-brand/10 hover:border-brand/30 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">{label}</p>
                <p className="text-4xl font-bold text-gray-900">{value}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-brand/5 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300">
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className={`vw-badge ${up ? "vw-badge-success" : "vw-badge-danger"}`}>
                {delta}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="vw-card p-10 !rounded-2xl bg-white border border-brand/10 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="vw-section-label">Hiệu suất</p>
              <h2 className="text-xl font-bold text-gray-900">Xu hướng tuyển dụng</h2>
            </div>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
              <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-gray-900 shadow-sm rounded-full">30 ngày</button>
              <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors rounded-full">90 ngày</button>
            </div>
          </div>
          <div className="h-[350px]">
            <LineChartOne />
          </div>
        </div>

        <div className="vw-card p-10 !rounded-2xl bg-white border border-brand/10 hover:border-brand/30 transition-all">
          <div className="mb-10">
            <p className="vw-section-label">Phân bổ</p>
            <h2 className="text-xl font-bold text-gray-900">Nguồn ứng viên</h2>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <BarChartOne />
          </div>
        </div>
      </div>
    </div>
  );
}
