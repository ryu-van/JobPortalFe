import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bookmark, MapPin, Trash2, Briefcase } from "lucide-react";
import jobService from "../services/jobService";
import ClientLayout from "../components/candidate/ClientLayout";

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Thỏa thuận";
  if (min == null && max == null) return "Chưa cập nhật";
  const fmt = (v) =>
    new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(v || 0) +
    (currency ? ` ${currency}` : "");
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
};

export default function SavedJobs() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user.userInfo);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!userInfo?.id) { setLoading(false); return; }
    (async () => {
      try {
        const res = await jobService.getSavedJobs(userInfo.id);
        // res is the data array from handleApi (ApiResponse.data)
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setSavedJobs(list);
      } catch (e) {
        setError(e?.friendlyMessage || "Không thể tải danh sách việc làm đã lưu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userInfo?.id]);

  const handleRemove = async (savedJobId, e) => {
    e.stopPropagation();
    setRemoving(savedJobId);
    try {
      await jobService.removeJobFromSavedJobs(savedJobId);
      setSavedJobs((prev) => prev.filter((s) => (s.savedJobId ?? s.id) !== savedJobId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Page title */}
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-[#27592D]" />
          <h1 className="text-2xl font-extrabold">Việc làm đã lưu</h1>
          {!loading && savedJobs.length > 0 && (
            <span className="text-sm text-gray-400 font-normal">({savedJobs.length})</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && savedJobs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Briefcase className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">Chưa có việc làm nào được lưu</p>
            <p className="text-sm mt-1 mb-6">Lưu việc làm yêu thích để xem lại sau</p>
            <button
              onClick={() => navigate("/jobs")}
              className="px-6 py-2.5 bg-[#27592D] text-white rounded-xl text-sm font-semibold hover:bg-[#1f4022] transition-colors"
            >
              Tìm việc ngay
            </button>
          </div>
        )}

        {/* Job list */}
        <div className="space-y-3">
          {savedJobs.map((saved) => {
            // Backend returns JobBaseResponse directly (getSavedJobs maps saved → job)
            // savedJobId may be on saved.savedJobId or saved.id depending on response shape
            const job = saved.job ?? saved;
            const savedId = saved.savedJobId ?? saved.id;

            return (
              <div
                key={savedId}
                onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Logo */}
                {job?.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#27592D] font-bold text-lg">{job?.companyName?.charAt(0) || "?"}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm group-hover:text-[#27592D] transition-colors truncate">{job?.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{job?.companyName}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {job?.address?.provinceName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{job.address.provinceName}
                      </span>
                    )}
                    <span className="text-[#27592D] font-medium">
                      {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => handleRemove(savedId, e)}
                  disabled={removing === savedId}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Bỏ lưu"
                >
                  <Trash2 className={`w-4 h-4 ${removing === savedId ? "animate-pulse" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ClientLayout>
  );
}
