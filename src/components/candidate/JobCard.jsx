import React from "react";
import { Building2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import useSaveJob from "../../hooks/useSaveJob";

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

const SkeletonCard = ({ isList }) => (
  <div className={`vw-card p-5 animate-pulse !rounded-2xl ${isList ? "flex gap-5 items-center" : "flex flex-col gap-4"}`}>
    <div className="flex items-start justify-between flex-1">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-ivory-warm flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-4 bg-ivory-warm rounded w-40" />
          <div className="h-3 bg-ivory-warm rounded w-28" />
        </div>
      </div>
      <div className="w-8 h-8 bg-ivory-warm rounded-xl ml-2" />
    </div>
    {!isList && (
      <>
        <div className="flex gap-2">
          <div className="h-6 bg-ivory-warm rounded-full w-20" />
          <div className="h-6 bg-ivory-warm rounded-full w-16" />
          <div className="h-6 bg-ivory-warm rounded-full w-14" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-ivory-warm rounded w-full" />
          <div className="h-3 bg-ivory-warm rounded w-4/5" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-ivory-deep">
          <div className="h-4 bg-ivory-warm rounded w-24" />
          <div className="h-8 bg-ivory-warm rounded-xl w-20" />
        </div>
      </>
    )}
  </div>
);

const JobCard = ({ job, loading, navigate, variant = "grid" }) => {
  const { isSaved, toggle } = useSaveJob({
    savedJobId: job?.savedJobId ?? null,
    jobId: job?.id,
  });

  const isList = variant === "list";

  if (loading) return <SkeletonCard isList={isList} />;

  const salary = formatSalary(
    job?.salaryMin,
    job?.salaryMax,
    job?.salaryCurrency,
    job?.isSalaryNegotiable
  );

  const tags = [
    job?.employmentType && {
      label: job.employmentType,
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    },
    job?.experienceLevel && {
      label: job.experienceLevel,
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    },
    job?.workType && {
      label: job.workType,
      className: "bg-brand/10 text-brand border border-brand/20",
    },
    ...(job?.skills?.slice(0, 3).map((s) => ({
      label: typeof s === "string" ? s : s?.name,
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    })) || []),
  ].filter(Boolean);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
      className={`vw-card p-5 flex hover:shadow-card group cursor-pointer !rounded-2xl transition-all ${
        isList ? "flex-row items-center gap-5" : "flex-col"
      }`}
    >
      <div className={`flex items-start justify-between ${isList ? "flex-1 min-w-0" : "mb-3"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl border border-ivory-deep bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {job?.companyLogo ? (
              <img src={job.companyLogo} alt={job?.companyName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand/40 text-sm font-bold">
                {job?.companyName?.slice(0, 2).toUpperCase() || <Building2 className="w-5 h-5 text-brand/20" />}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-brand group-hover:text-brand-light transition-colors line-clamp-1 leading-snug">
                {job?.title}
              </h3>
              {job?.isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-brand/8 text-brand text-[10px] font-semibold border border-brand/15 whitespace-nowrap">
                  Nổi bật
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5 truncate">
              {job?.companyName}
              {(job?.location || job?.address?.provinceName) && (
                <>
                  <span className="mx-1.5">·</span>
                  {job?.location || job?.address?.provinceName}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggle(e); }}
          className={`ml-2 p-2 rounded-xl flex-shrink-0 transition-all ${
            isSaved ? "text-brand bg-brand/8 shadow-inner" : "text-brand/20 hover:text-brand hover:bg-brand/5"
          }`}
          aria-label={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand" : ""}`} />
        </button>
      </div>

      {!isList && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag, i) => (
            <span key={i} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${tag.className}`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {!isList && job?.description && (
        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      <div
        className={`flex items-center justify-between ${
          isList
            ? "flex-shrink-0 ml-4"
            : "mt-auto pt-4 border-t border-ivory-deep"
        }`}
      >
        <span className="text-[13px] font-bold text-brand">{salary}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">{job?.publishedAtText || "Mới đăng"}</span>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job?.id}`); }}
            className="px-4 py-2 rounded-xl bg-brand text-white text-[12px] font-bold hover:bg-brand-light transition-colors flex items-center gap-1"
          >
            Ứng tuyển <span className="text-[11px]">↗</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default JobCard;
