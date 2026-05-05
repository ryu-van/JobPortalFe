import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin, Briefcase, Users, Clock, DollarSign,
  Building2, ArrowLeft, Bookmark, CheckCircle, Calendar,
  Globe, AlertCircle, Sparkles, ChevronRight,
} from "lucide-react";
import jobService from "../../services/jobService";
import ClientLayout from "../../components/candidate/ClientLayout";
import useSaveJob from "../../hooks/useSaveJob";
import ApplyModal from "../../components/candidate/ApplyModal";

const fmt = (v, currency) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(v || 0) +
  (currency ? ` ${currency}` : "");

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Thỏa thuận";
  if (min == null && max == null) return "Chưa cập nhật";
  if (min != null && max != null) return `${fmt(min, currency)} – ${fmt(max, currency)}`;
  if (min != null) return `Từ ${fmt(min, currency)}`;
  return `Đến ${fmt(max, currency)}`;
};

const formatDate = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills))
    return skills.map((s) => (typeof s === "object" ? s.name || s.skillName || "" : String(s))).filter(Boolean);
  if (typeof skills === "string") return [skills];
  return [];
};

/* ─── sub-components ──────────────────────────────────────────────────── */

/** Divider-separated content section */
const ContentSection = ({ title, children }) => (
  <div className="py-6 border-b border-ivory-deep last:border-0">
    <h2 className="text-[15px] font-bold text-brand mb-4">{title}</h2>
    <div className="text-[13px] text-brand/70 leading-relaxed">{children}</div>
  </div>
);

/** Bullet list renderer — splits on newlines or renders as-is */
const BulletList = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return <p className="whitespace-pre-line">{text}</p>;
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rust flex-shrink-0" />
          <span>{line.replace(/^[-•*]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
};

/** Right sidebar overview row */
const OverviewRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-ivory-deep last:border-0">
      <span className="text-[12px] text-brand/40">{label}</span>
      <span className="text-[13px] font-semibold text-brand text-right max-w-[55%]">{value}</span>
    </div>
  );
};

/** Similar job mini-card */
const SimilarJobCard = ({ job, navigate }) => (
  <button
    onClick={() => navigate(`/jobs/${job.id}`)}
    className="w-full text-left py-3 border-b border-ivory-deep last:border-0 hover:bg-ivory-soft transition-colors -mx-1 px-1 rounded"
  >
    <p className="text-[13px] font-bold text-brand leading-snug">{job.title}</p>
    <p className="text-[11px] text-brand/40 mt-0.5">
      {job.companyName}
      {job.address?.provinceName && <> · {job.address.provinceName}</>}
    </p>
    <p className="text-[12px] font-semibold text-rust mt-1">
      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.isSalaryNegotiable)}
    </p>
  </button>
);

/* ─── main page ───────────────────────────────────────────────────────── */
export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user.userInfo);

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { isSaved, loading: saveLoading, toggle: toggleSave } = useSaveJob({
    savedJobId: job?.savedJobId ?? null,
    jobId: Number(id),
  });

  /* fetch job detail */
  useEffect(() => {
    if (!id) return;
    setJob(null);
    setError("");
    (async () => {
      try {
        const res = await jobService.getJobDetail(id);
        const jobData = res?.data ?? res;
        setJob(jobData);
      } catch (e) {
        setError(e?.friendlyMessage || "Không thể tải thông tin việc làm.");
      }
    })();
  }, [id]);

  /* fetch similar jobs once we know the job */
  useEffect(() => {
    if (!job) return;
    (async () => {
      try {
        const res = await jobService.getBaseJobs({
          keyword: job.title?.split(" ").slice(0, 2).join(" "),
          size: 4,
          page: 1,
          sortBy: "publishedAt",
          direction: "DESC",
        });
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setSimilarJobs(list.filter((j) => j.id !== job.id).slice(0, 3));
      } catch {
        /* silent */
      }
    })();
  }, [job]);

  /* ── error / loading states ── */
  if (error) {
    return (
      <ClientLayout>
        <div className="py-24 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-16 h-16 text-rust mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-bold text-brand mb-4">Đã có lỗi xảy ra.</h2>
          <p className="text-brand/60 mb-8">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm">
            Quay lại
          </button>
        </div>
      </ClientLayout>
    );
  }

  if (!job) {
    return (
      <ClientLayout>
        <div className="py-24 text-center">
          <Sparkles className="w-12 h-12 text-brand mx-auto mb-6 animate-pulse opacity-20" />
          <p className="text-brand/40 font-bold uppercase tracking-widest text-sm">Đang tải thông tin việc làm...</p>
        </div>
      </ClientLayout>
    );
  }

  const deadline = formatDate(job?.applicationDeadline);
  const published = formatDate(job?.publishedAt);
  const skillNames = normalizeSkills(job?.skills);

  const tags = [
    job?.employmentType,
    job?.workType,
    job?.experienceLevel,
    job?.address?.provinceName,
  ].filter(Boolean);

  return (
    <ClientLayout>
      <div className="pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[12px] text-brand/40 hover:text-brand transition-colors mb-6 mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>

        {/* ── 2-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6 items-start">

          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-4">

            {/* Company + Job header card */}
            <div className="vw-card p-6 !rounded-2xl">
              {/* Company row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl border border-ivory-deep bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  {job?.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-brand/20" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-brand">{job?.companyName}</p>
                  <p className="text-[11px] text-brand/40">
                    {job?.address?.provinceName}
                    {job?.companyWebsite && <> · {job.companyWebsite}</>}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-brand mb-4 leading-snug">{job?.title}</h1>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-ivory-alt text-brand/70 text-[11px] font-medium border border-ivory-deep"
                    >
                      {tag}
                    </span>
                  ))}
                  {published && (
                    <span className="px-3 py-1 rounded-full bg-ivory-alt text-brand/50 text-[11px] font-medium border border-ivory-deep flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Đăng ngày {published}
                    </span>
                  )}
                </div>
              )}

              {/* Salary */}
              <p className="text-[22px] font-bold text-brand mb-1">
                {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
              </p>
              {job?.salaryCurrency && !job?.isSalaryNegotiable && (
                <p className="text-[11px] text-brand/40 mb-5">
                  {job.salaryCurrency} · mỗi năm
                </p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                {job?.applied ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-brand/5 text-brand rounded-xl text-[13px] font-semibold border border-brand/10">
                    <CheckCircle className="w-4 h-4" /> Đã ứng tuyển
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!userInfo) { navigate("/login"); return; }
                      setShowApplyModal(true);
                    }}
                    className="px-5 md:px-6 py-2.5 bg-brand text-white rounded-xl text-[13px] font-bold hover:bg-brand-light transition-colors"
                  >
                    Ứng tuyển ngay
                  </button>
                )}
                <button
                  onClick={toggleSave}
                  disabled={saveLoading}
                  className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors flex items-center gap-2 ${
                    isSaved
                      ? "bg-brand/5 text-brand border-brand/20"
                      : "bg-white text-brand/60 border-ivory-deep hover:border-brand/30 hover:text-brand"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand text-brand" : ""}`} />
                  {isSaved ? "Đã lưu" : "Lưu lại"}
                </button>
              </div>
            </div>

            {/* Content sections card */}
            <div className="vw-card px-6 !rounded-2xl">

              {/* 1. Mô tả công việc */}
              {job?.description && (
                <ContentSection title="Mô tả công việc">
                  <p className="whitespace-pre-line">{job.description}</p>
                </ContentSection>
              )}

              {/* 2. Trách nhiệm */}
              {job?.responsibilities && (
                <ContentSection title="Bạn sẽ làm gì">
                  <BulletList text={job.responsibilities} />
                </ContentSection>
              )}

              {/* 3. Yêu cầu */}
              {job?.requirements && (
                <ContentSection title="Yêu cầu ứng viên">
                  <BulletList text={job.requirements} />
                </ContentSection>
              )}

              {/* 4. Kỹ năng */}
              {skillNames.length > 0 && (
                <ContentSection title="Kỹ năng & công cụ">
                  <div className="flex flex-wrap gap-2">
                    {skillNames.map((name) => (
                      <span
                        key={name}
                        className="px-3 py-1 bg-ivory-alt text-brand text-[11px] font-medium rounded-full border border-ivory-deep"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* 5. Quyền lợi */}
              {job?.benefits && (
                <ContentSection title="Quyền lợi">
                  <BulletList text={job.benefits} />
                </ContentSection>
              )}

            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="space-y-4">

            {/* Job overview */}
            <div className="vw-card p-5 !rounded-2xl">
              <h3 className="text-[14px] font-bold text-brand mb-1">Thông tin chung</h3>
              <div>
                <OverviewRow label="Hình thức"     value={job?.employmentType} />
                <OverviewRow label="Địa điểm"      value={job?.address?.provinceName} />
                <OverviewRow label="Mức lương"      value={formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)} />
                <OverviewRow label="Cấp bậc"        value={job?.experienceLevel} />
                <OverviewRow label="Loại công việc" value={job?.workType} />
                <OverviewRow label="Số lượng"       value={job?.numberOfPositions ? `${job.numberOfPositions} người` : null} />
                <OverviewRow label="Hạn nộp"        value={deadline} />
              </div>
            </div>

            {/* Company card */}
            <div className="vw-card p-5 !rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-ivory-deep bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  {job?.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-brand/20" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-brand">{job?.companyName}</p>
                  {job?.companyIndustry && (
                    <p className="text-[11px] text-brand/40">{job.companyIndustry}</p>
                  )}
                </div>
              </div>

              {job?.companyDescription ? (
                <p className="text-[12px] text-brand/60 leading-relaxed mb-4 line-clamp-4">
                  {job.companyDescription}
                </p>
              ) : (
                <p className="text-[12px] text-brand/50 leading-relaxed mb-4">
                  Gia nhập {job?.companyName} và đóng góp vào những dự án có tầm ảnh hưởng lớn trong ngành.
                </p>
              )}

              {job?.companyId && (
                <Link
                  to={`/companies/${job.companyId}`}
                  className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-ivory-alt hover:bg-ivory-deep transition-colors text-[12px] font-semibold text-brand"
                >
                  Xem hồ sơ công ty
                  <ChevronRight className="w-4 h-4 text-brand/40" />
                </Link>
              )}
            </div>

            {/* Việc làm tương tự */}
            {similarJobs.length > 0 && (
              <div className="vw-card p-5 !rounded-2xl">
                <h3 className="text-[14px] font-bold text-brand mb-3">Việc làm tương tự</h3>
                <div>
                  {similarJobs.map((sj) => (
                    <SimilarJobCard key={sj.id} job={sj} navigate={navigate} />
                  ))}
                </div>
                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-3 w-full text-center text-[11px] font-semibold text-brand/40 hover:text-brand transition-colors"
                >
                  Xem thêm →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => setJob((prev) => ({ ...prev, applied: true, appliedAt: new Date().toISOString() }))}
        jobId={Number(id)}
        userId={userInfo?.id}
      />
    </ClientLayout>
  );
}
