import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Globe, Users, Briefcase, Building2, ArrowLeft, Bookmark } from "lucide-react";
import companyService from "../services/companyService";
import jobService from "../services/jobService";
import ClientLayout from "../components/candidate/ClientLayout";
import useSaveJob from "../hooks/useSaveJob";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

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

function CompanyJobCard({ job, navigate }) {
  const { isSaved, toggle } = useSaveJob({ savedJobId: job?.savedJobId ?? null, jobId: job?.id });
  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-[#F4F1EB] rounded-xl p-4 flex items-center gap-3 hover:bg-[#ece9e1] transition-colors cursor-pointer group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm group-hover:text-[#27592D] transition-colors truncate">{job.title}</p>
        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
          {job?.address?.provinceName && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.address.provinceName}</span>
          )}
          <span className="text-[#27592D] font-medium">
            {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
          </span>
        </div>
      </div>
      <button
        onClick={toggle}
        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isSaved ? "text-[#27592D]" : "text-gray-300 hover:text-[#27592D]"}`}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#27592D]" : ""}`} />
      </button>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await companyService.getCompanyDetail(id);
        setCompany(res?.data ?? res);
      } catch (e) {
        setError(e?.friendlyMessage || "Không thể tải thông tin công ty.");
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await jobService.getJobsByCompany(id, { page: 0, size: 10, sort: "published_at", direction: "DESC" });
        setJobs(extractList(res));
      } catch { setJobs([]); }
      finally { setJobsLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-100 rounded" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </ClientLayout>
    );
  }

  const address = company?.addresses?.find((a) => a.isPrimary) ?? company?.addresses?.[0];

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#27592D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Company header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-5">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-20 h-20 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-[#27592D]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold">{company?.name}</h1>
                {company?.isVerified && (
                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">Đã xác minh</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {company?.industry?.name && (
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{company.industry.name}</span>
                )}
                {company?.companySize && (
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{company.companySize} nhân viên</span>
                )}
                {address?.provinceName && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{address.provinceName}</span>
                )}
                {company?.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#27592D] hover:underline">
                    <Globe className="w-4 h-4" />{company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          {company?.description && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h2 className="font-semibold text-sm mb-2">Giới thiệu công ty</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>
          )}
        </div>

        {/* Jobs from this company */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-base mb-4">
            Việc làm đang tuyển
            {!jobsLoading && jobs.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({jobs.length})</span>
            )}
          </h2>

          {jobsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!jobsLoading && jobs.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Hiện chưa có vị trí tuyển dụng nào.</p>
          )}

          <div className="space-y-2">
            {jobs.map((job) => (
              <CompanyJobCard key={job.id} job={job} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
