import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, X, Bookmark, Building2, SlidersHorizontal } from "lucide-react";
import jobService from "../../services/jobService";
import companyService from "../../services/companyService";
import addressService from "../../services/addressService";
import SelectField from "../../components/form/SelectField";
import Pagination from "../../components/commons/Pagination";
import ClientLayout from "../../components/candidate/ClientLayout";
import useSaveJob from "../../hooks/useSaveJob";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Lương thỏa thuận";
  if (min == null && max == null) return "Chưa cập nhật";
  const fmt = (v) =>
    new Intl.NumberFormat("vi-VN").format(v || 0) +
    (currency ? ` ${currency}` : "");
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
};

const PAGE_SIZE = 9;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Toàn thời gian" },
  { value: "part_time", label: "Bán thời gian" },
  { value: "intern", label: "Thực tập" },
  { value: "contract", label: "Hợp đồng" },
  { value: "freelance", label: "Freelance" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "intern", label: "Thực tập sinh" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior (dưới 2 năm)" },
  { value: "mid", label: "Mid-level (2–5 năm)" },
  { value: "senior", label: "Senior (trên 5 năm)" },
  { value: "lead", label: "Quản lý / Lead" },
];

const SALARY_RANGES = [
  { label: "Dưới 10 triệu",   min: null,      max: 10_000_000 },
  { label: "10 – 20 triệu",   min: 10_000_000, max: 20_000_000 },
  { label: "20 – 30 triệu",   min: 20_000_000, max: 30_000_000 },
  { label: "30 – 50 triệu",   min: 30_000_000, max: 50_000_000 },
  { label: "Trên 50 triệu",   min: 50_000_000, max: null },
];

function JobCard({ job, loading, navigate, idx }) {
  const { isSaved, toggle } = useSaveJob({
    savedJobId: job?.savedJobId ?? null,
    jobId: job?.id,
  });

  /* Skeleton */
  if (loading) {
    return (
      <article className="vw-card p-5 flex flex-col gap-4 animate-pulse !rounded-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-ivory-warm flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 bg-ivory-warm rounded w-40" />
              <div className="h-3 bg-ivory-warm rounded w-28" />
            </div>
          </div>
          <div className="w-8 h-8 bg-ivory-warm rounded-xl" />
        </div>
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
      </article>
    );
  }

  const salary = formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable);

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
    <article
      onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
      className={`bg-white border-[3px] border-gray-200 hover:border-brand hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col group cursor-pointer !rounded-2xl transition-all ${job?.isFeatured ? "ring-2 ring-brand/40 border-brand/30" : ""}`}
    >
      {/* ── Header: logo + title + save ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
            {job?.companyLogo ? (
              <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover p-2" />
            ) : (
              <span className="text-brand/40 text-base font-bold">
                {job?.companyName?.slice(0, 1).toUpperCase() || <Building2 className="w-5 h-5 text-brand/20" />}
              </span>
            )}
          </div>

          {/* Title + featured badge */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-brand transition-colors line-clamp-1 leading-tight">
                {job?.title}
              </h3>
              {job?.isFeatured && (
                <span className="px-2 py-0.5 rounded-lg bg-brand/5 text-brand text-[9px] font-bold border border-brand/10 whitespace-nowrap">
                  NỔI BẬT
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 font-medium truncate">
              <span className="hover:text-brand transition-colors">{job?.companyName}</span>
              {(job?.location || job?.address?.provinceName) && (
                <>
                  <span className="mx-2 opacity-30">|</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 opacity-50" />
                    {job?.location || job?.address?.provinceName}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(e); }}
          className={`p-2 rounded-xl transition-all ${
            isSaved ? "text-brand bg-brand/5" : "text-gray-300 hover:text-brand hover:bg-brand/5"
          }`}
          title={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
          aria-label={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand" : ""}`} />
        </button>
      </div>

      {/* ── Tags ── */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, i) => (
            <span key={i} className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide ${tag.className}`}>
              {tag.label.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* ── Description ── */}
      {job?.description && (
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-6 font-medium">
          {job.description}
        </p>
      )}

      {/* ── Footer: salary · time · apply ── */}
      <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-brand">
            {salary}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{job?.publishedAtText || "Mới đăng"}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job?.id}`); }}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-brand transition-all flex items-center gap-2 group/btn"
        >
          Ứng tuyển 
          <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
        </button>
      </div>
    </article>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [provinceCode, setProvinceCode] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryRange, setSalaryRange] = useState(null);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false); // mobile drawer

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [industries, setIndustries] = useState([]);

  const debounceRef = useRef(null);

  const locationName = useMemo(
    () => provinces.find((p) => p.value === String(provinceCode))?.label || locationFilter || "",
    [provinceCode, provinces, locationFilter]
  );

  useEffect(() => {
    addressService.getProvinces().then((res) => {
      if (res?.success) {
        setProvinces(
          (res.data || []).map((p) => ({
            value: String(p.code || p.province_code),
            label: p.name || p.province_name,
          }))
        );
      }
    }).catch(() => {});

    companyService.getAllIndustries().then((res) => {
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setIndustries(list.filter((i) => i.isActive !== false).map((i) => ({ value: String(i.id), label: i.name })));
    }).catch(() => {});
  }, []);

  const fetchJobs = async ({
    kw = keyword,
    loc = locationName,
    ind = industryId,
    empType = employmentType,
    expLevel = experienceLevel,
    salIdx = salaryRange,
    pg = page,
  } = {}) => {
    setLoading(true);
    setError("");
    const sr = salIdx !== null && salIdx !== undefined ? SALARY_RANGES[salIdx] : null;
    // backend filter by category name — dùng industry name
    const indName = ind ? (industries.find((i) => i.value === ind)?.label || undefined) : undefined;
    try {
      const res = await jobService.getBaseJobs({
        keyword: kw || undefined,
        location: loc || undefined,
        category: indName || undefined,
        employmentType: empType || undefined,
        experienceLevel: expLevel || undefined,
        salaryMin: sr?.min ?? undefined,
        salaryMax: sr?.max ?? undefined,
        page: pg - 1,
        size: PAGE_SIZE,
        sort: "published_at",
        direction: "DESC",
      });
      setJobs(extractList(res));
      setPagination(res?.pagination ?? null);
    } catch (e) {
      setError(e?.friendlyMessage || "Không thể tải việc làm. Vui lòng thử lại.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchJobs({ kw: keyword, pg: 1 });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
    fetchJobs({ pg: 1 });
  }, [provinceCode, industryId, employmentType, experienceLevel, salaryRange]);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setKeyword("");
    setProvinceCode("");
    setLocationFilter("");
    setIndustryId("");
    setEmploymentType("");
    setExperienceLevel("");
    setSalaryRange(null);
    setPage(1);
  };

  const hasFilters = Boolean(keyword || provinceCode || industryId || locationFilter || employmentType || experienceLevel || salaryRange !== null);

  return (
    <ClientLayout>
      <div className="space-y-12 md:space-y-16 py-8">
        {/* Page Header */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand mb-3">Khám phá cơ hội mới</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Tìm kiếm sự nghiệp<br />
                <span className="text-gray-300">phi thường của bạn.</span>
              </h1>
              <p className="text-gray-500 mt-6 max-w-xl font-medium text-base md:text-lg leading-relaxed">
                Cơ hội tinh tuyển dành cho các chuyên gia trong lĩnh vực báo chí, truyền thông và chiến lược toàn cầu.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          {/* ── Filter sidebar ── */}
          <aside className={`
            lg:col-span-3 space-y-8
            lg:sticky lg:top-24
            ${filterOpen
              ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto"
              : "hidden lg:block"
            }
            bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm
          `}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <span className="text-xl font-bold text-gray-900">Bộ lọc</span>
              <button onClick={() => setFilterOpen(false)} className="p-2 bg-gray-50 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Group */}
            <div className="space-y-4 lg:mt-0 mt-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tìm kiếm</p>
              <div className="relative group">
                <Search className="w-4 h-4 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand" />
                <input
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-brand/30 transition-all"
                  placeholder="Chức danh, công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            {/* Location & Industry */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Phân loại</p>
              <div className="space-y-3">
                <SelectField
                  name="province"
                  value={provinceCode}
                  onChange={(e) => setProvinceCode(e.target.value)}
                  options={provinces}
                  placeholder="Tất cả địa điểm"
                  className="!rounded-xl !bg-gray-50 !border-gray-100 focus-within:!border-brand/30"
                />
                <SelectField
                  name="industry"
                  value={industryId}
                  onChange={(e) => setIndustryId(e.target.value)}
                  options={industries}
                  placeholder="Tất cả ngành nghề"
                  className="!rounded-xl !bg-gray-50 !border-gray-100 focus-within:!border-brand/30"
                />
              </div>
            </div>

            {/* Radio Groups */}
            <div className="space-y-8 pt-4">
              {/* Type */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hình thức làm việc</p>
                <div className="flex flex-col gap-3">
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="empType"
                          value={opt.value}
                          checked={employmentType === opt.value}
                          onChange={() => setEmploymentType(opt.value)}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:border-brand checked:bg-brand transition-all cursor-pointer"
                        />
                        <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mức lương (VND)</p>
                <div className="flex flex-col gap-3">
                  {SALARY_RANGES.map((range, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="salaryRange"
                          checked={salaryRange === idx}
                          onChange={() => setSalaryRange(idx)}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:border-brand checked:bg-brand transition-all cursor-pointer"
                        />
                        <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-400 hover:text-rust hover:border-rust/20 transition-all flex items-center justify-center gap-2"
              >
                Làm mới bộ lọc
              </button>
            )}
          </aside>

          {/* Jobs List */}
          <main className="lg:col-span-9 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Danh sách việc làm</h2>
                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-full border border-gray-100">
                  {pagination?.totalElements || 0} KẾT QUẢ
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Sắp xếp</span>
                <select className="bg-white border border-gray-100 rounded-lg px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:border-brand/30 transition-all cursor-pointer shadow-sm">
                  <option>Mới nhất</option>
                  <option>Lương cao nhất</option>
                </select>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-sm font-medium">{error}</div>}

            {!loading && !error && jobs.length === 0 && (
              <div className="py-20 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Briefcase className="w-8 h-8 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy việc làm</h3>
                <p className="text-gray-500 font-medium">Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <button onClick={clearFilters} className="mt-8 text-brand font-bold text-sm underline underline-offset-4">Xóa tất cả bộ lọc</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {(loading ? Array.from({ length: PAGE_SIZE }) : jobs).map((job, idx) => (
                <JobCard key={job?.id ?? idx} job={job} loading={loading} navigate={navigate} idx={idx} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-12 md:pt-16 border-t border-gray-50">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </ClientLayout>
  );
}
