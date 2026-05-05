import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bookmark, MapPin, Trash2, Briefcase } from "lucide-react";
import jobService from "../../services/jobService";
import BrandButton from "../../components/form/BrandButton";
import ClientLayout from "../../components/candidate/ClientLayout";
import CandidateAccountSidebar from "../../components/candidate/CandidateAccountSidebar";

// TODO: Backend contract gap.
// GET /jobs/saved-jobs currently returns JobBaseResponse without savedJobId, but
// DELETE /jobs/saved-jobs/{savedJobId} requires the saved-job record id. Backend must
// return savedJobId from the save response or saved-jobs list response before unsave
// can work reliably on this page.

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
    if (!savedJobId) {
      return;
    }
    e.stopPropagation();
    setRemoving(savedJobId);
    try {
      await jobService.removeJobFromSavedJobs(savedJobId);
      setSavedJobs((prev) => prev.filter((s) => s.savedJobId !== savedJobId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <ClientLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <CandidateAccountSidebar />

        <div className="space-y-6">
          <section className="text-left py-6 border-b border-ivory-deep">
            <p className="vw-section-label">Danh sách quan tâm</p>
            <h1 className="text-4xl font-bold tracking-tight text-brand">Việc làm đã lưu.</h1>
          </section>

          {error && (
            <div className="p-4 bg-rust/5 text-rust text-sm font-medium border border-rust/10">
              {error}
            </div>
          )}

          {!loading && !error && savedJobs.length === 0 && (
            <div className="vw-card text-center py-24 text-brand/40 border-dashed">
              <div className="w-16 h-16 rounded-full bg-ivory-alt flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-8 h-8 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-brand mb-2">Chưa có việc làm nào được lưu</h3>
              <p className="text-sm font-medium mb-8">Lưu việc làm yêu thích để xem lại sau</p>
              <BrandButton onClick={() => navigate("/jobs")}>TÌM VIỆC NGAY</BrandButton>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="vw-card p-5 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-ivory-deep flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-ivory-deep rounded" />
                      <div className="h-3 w-32 bg-ivory-deep rounded" />
                    </div>
                  </div>
                ))
              : savedJobs.map((saved) => {
                  const job = saved.job ?? saved;
                  const savedId = saved.savedJobId ?? null;
                  const canRemove = savedId !== null;

                  return (
                    <article
                      key={savedId ?? `job-${job?.id}`}
                      onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
                      className="vw-card vw-card-hover p-5 flex items-center gap-4 cursor-pointer group"
                    >
                      {job?.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-ivory-deep"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand font-bold text-lg">
                            {job?.companyName?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm group-hover:text-brand transition-colors truncate">
                          {job?.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{job?.companyName}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {job?.address?.provinceName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.address.provinceName}
                            </span>
                          )}
                          <span className="text-brand font-medium">
                            {formatSalary(
                              job?.salaryMin,
                              job?.salaryMax,
                              job?.salaryCurrency,
                              job?.isSalaryNegotiable
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleRemove(savedId, e)}
                        disabled={!canRemove || removing === savedId}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Bỏ lưu"
                        aria-label="Bỏ lưu việc làm"
                      >
                        <Trash2
                          className={`w-4 h-4 ${removing === savedId ? "animate-pulse" : ""}`}
                        />
                      </button>
                    </article>
                  );
                })}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
