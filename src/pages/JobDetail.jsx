import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin, Briefcase, Users, Clock, DollarSign,
  Building2, ArrowLeft, Bookmark, CheckCircle, Calendar,
  Globe, Star,
} from "lucide-react";
import jobService from "../services/jobService";
import ClientLayout from "../components/candidate/ClientLayout";
import useSaveJob from "../hooks/useSaveJob";

const fmt = (v, currency) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(v || 0) +
  (currency ? ` ${currency}` : "");

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Lương thỏa thuận";
  if (min == null && max == null) return "Chưa cập nhật";
  if (min != null && max != null) return `${fmt(min, currency)} – ${fmt(max, currency)}`;
  if (min != null) return `Từ ${fmt(min, currency)}`;
  return `Đến ${fmt(max, currency)}`;
};

const formatDate = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-[#27592D]/10 text-[#27592D]",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 className="font-bold text-base mb-4 text-[#1a1a1a]">{title}</h2>
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user.userInfo);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isSaved, loading: saveLoading, toggle: toggleSave } = useSaveJob({
    savedJobId: null,
    jobId: Number(id),
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await jobService.getJobDetail(id);
        // handleApi returns ApiResponse.data — the job object is directly res
        setJob(res);
      } catch (e) {
        setError(e?.friendlyMessage || "Không thể tải thông tin việc làm.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {[120, 200, 160].map((h, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className={`h-${h === 120 ? "6" : "4"} w-3/4 bg-gray-100 rounded mb-3`} />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-64" />
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="max-w-5xl mx-auto">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </ClientLayout>
    );
  }

  const deadline = formatDate(job?.applicationDeadline);
  const published = formatDate(job?.publishedAt);
  const companyId = job?.companyId;

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#27592D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                {job?.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-[#27592D]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-extrabold leading-tight">{job?.title}</h1>
                      <p className="text-sm text-gray-500 mt-1">
                        {companyId ? (
                          <Link to={`/companies/${companyId}`} className="hover:text-[#27592D] transition-colors">
                            {job?.companyName}
                          </Link>
                        ) : job?.companyName}
                      </p>
                    </div>
                    <button
                      onClick={toggleSave}
                      disabled={saveLoading}
                      className={`p-2.5 rounded-xl border transition-colors flex-shrink-0 ${
                        isSaved
                          ? "border-[#27592D] bg-[#27592D]/10 text-[#27592D]"
                          : "border-gray-200 text-gray-400 hover:border-[#27592D] hover:text-[#27592D]"
                      }`}
                      title={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#27592D]" : ""}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {job?.isFeatured && <Badge color="amber">⭐ Nổi bật</Badge>}
                    {job?.workType && <Badge color="blue">{job.workType}</Badge>}
                    {job?.employmentType && <Badge color="green">{job.employmentType}</Badge>}
                    {job?.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    {job?.address?.provinceName && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.address.provinceName}</span>
                    )}
                    <span className="flex items-center gap-1.5 font-semibold text-[#27592D]">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
                    </span>
                    {job?.numberOfPositions && (
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{job.numberOfPositions} vị trí</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                {job?.applied ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Đã ứng tuyển {job.appliedAt ? `(${formatDate(job.appliedAt)})` : ""}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!userInfo) { navigate("/login"); return; }
                      // TODO: open apply modal or navigate to apply page
                    }}
                    className="px-6 py-2.5 bg-[#27592D] text-white rounded-xl text-sm font-semibold hover:bg-[#1f4022] transition-colors"
                  >
                    Ứng tuyển ngay
                  </button>
                )}
                {deadline && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Hạn: {deadline}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {job?.description && (
              <Section title="Mô tả công việc">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </Section>
            )}

            {/* Requirements */}
            {job?.requirements && (
              <Section title="Yêu cầu ứng viên">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </Section>
            )}

            {/* Responsibilities */}
            {job?.responsibilities && (
              <Section title="Trách nhiệm công việc">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </Section>
            )}

            {/* Benefits */}
            {job?.benefits && (
              <Section title="Quyền lợi">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.benefits}
                </div>
              </Section>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            {/* Job info */}
            <Section title="Thông tin chung">
              <InfoRow icon={Briefcase} label="Loại hình" value={job?.employmentType} />
              <InfoRow icon={Globe} label="Hình thức" value={job?.workType} />
              <InfoRow icon={Star} label="Kinh nghiệm" value={job?.experienceLevel} />
              <InfoRow icon={Users} label="Số lượng" value={job?.numberOfPositions ? `${job.numberOfPositions} người` : null} />
              <InfoRow icon={MapPin} label="Địa điểm" value={job?.address?.provinceName} />
              <InfoRow icon={Calendar} label="Hạn nộp" value={deadline} />
              <InfoRow icon={Calendar} label="Ngày đăng" value={published} />
            </Section>

            {/* Skills */}
            {job?.skills && job.skills.size > 0 || (Array.isArray(job?.skills) && job.skills.length > 0) ? (
              <Section title="Kỹ năng yêu cầu">
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(job.skills) ? job.skills : [...(job.skills ?? [])]).map((s) => (
                    <Badge key={s} color="green">{s}</Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            {/* Company card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                {job?.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#27592D]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#27592D]" />
                  </div>
                )}
                <p className="font-semibold text-sm">{job?.companyName}</p>
              </div>
              {companyId && (
                <Link
                  to={`/companies/${companyId}`}
                  className="block w-full text-center py-2 rounded-xl border border-[#27592D] text-[#27592D] text-xs font-semibold hover:bg-[#27592D] hover:text-white transition-colors"
                >
                  Xem hồ sơ công ty
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
