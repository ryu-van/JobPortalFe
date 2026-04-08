import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight, Bookmark, Building2 } from "lucide-react";
import SelectField from "../components/form/SelectField";
import addressService from "../services/addressService";
import jobService from "../services/jobService";
import companyService from "../services/companyService";
import CandidateNavbar from "../components/candidate/CandidateNavbar";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Thỏa thuận";
  if (min == null && max == null) return "—";
  const fmt = (v) =>
    new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(v || 0) +
    (currency ? ` ${currency}` : "");
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
};

export default function Home() {
  const navigate = useNavigate();
  const [provinceCode, setProvinceCode] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState({ jobs: false, companies: false });
  const [jobPagination, setJobPagination] = useState(null);
  const [companiesPagination, setCompaniesPagination] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await addressService.getProvinces();
        if (!mounted || !res?.success) return;
        setProvinces(
          (res.data || []).map((p) => ({
            value: String(p.code || p.province_code),
            label: p.name || p.province_name,
          }))
        );
      } catch { setProvinces([]); }
    })();
    return () => { mounted = false; };
  }, []);

  const locationName = useMemo(
    () => provinces.find((p) => p.value === String(provinceCode))?.label || "",
    [provinceCode, provinces]
  );

  const fetchJobs = async ({ kw = keyword, loc = locationName } = {}) => {
    setLoading((s) => ({ ...s, jobs: true }));
    try {
      const res = await jobService.getBaseJobs({
        keyword: kw || undefined,
        location: loc || undefined,
        page: 0, size: 6,
        sort: "published_at", direction: "DESC",
      });
      setJobs(extractList(res));
      setJobPagination(res?.pagination ?? null);
    } catch { setJobs([]); setJobPagination(null); }
    finally { setLoading((s) => ({ ...s, jobs: false })); }
  };

  const fetchCompanies = async () => {
    setLoading((s) => ({ ...s, companies: true }));
    try {
      const res = await companyService.getAllCompanies({ isActive: true, page: 0, size: 4 });
      setCompanies(extractList(res));
      setCompaniesPagination(res?.pagination ?? null);
    } catch { setCompanies([]); setCompaniesPagination(null); }
    finally { setLoading((s) => ({ ...s, companies: false })); }
  };

  useEffect(() => { fetchJobs({}); fetchCompanies(); /* eslint-disable-next-line */ }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (locationName) params.set("location", locationName);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EB] text-[#1a1a1a] font-sans">

      {/* ── Navbar ── */}
      <div className="px-4 md:px-10 xl:px-16 pt-5">
        <CandidateNavbar />
      </div>

      {/* ── Hero ── */}
      <section className="px-4 md:px-10 xl:px-16 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-[#27592D] font-semibold mb-4">
          Nền tảng tuyển dụng hàng đầu
        </p>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-4">
          Sự nghiệp của bạn,
          <br />
          <span className="text-[#9e9e8e]">Đặt đúng vị trí.</span>
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-10">
          Khám phá hàng nghìn cơ hội việc làm chất lượng cao. Kết nối với nhà tuyển dụng hàng đầu ngay hôm nay.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch gap-0 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 px-4 py-3.5 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
              placeholder="Chức danh, từ khóa..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-1 flex-1">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <SelectField
              name="provinceCode"
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              options={provinces}
              placeholder="Địa điểm"
              size="sm"
              className="!border-0 !px-0 !py-0 !bg-transparent !text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-[#27592D] text-white text-sm font-semibold hover:bg-[#1f4022] transition-colors flex-shrink-0"
          >
            Tìm kiếm
          </button>
        </form>
      </section>

      {/* ── Main two-column section ── */}
      <section className="px-4 md:px-10 xl:px-16 pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* LEFT — Urgent Openings (list style) */}
        <div className="lg:col-span-3">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Ưu tiên tuyển dụng</p>
              <h2 className="text-2xl font-bold">Việc làm nổi bật</h2>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="text-xs text-[#27592D] font-semibold hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {(loading.jobs ? Array.from({ length: 5 }) : jobs.slice(0, 5)).map((job, idx) => (
              <div
                key={job?.id ?? idx}
                onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F4F1EB]/60 transition-colors cursor-pointer group"
              >
                {/* Logo */}
                <div className="flex-shrink-0">
                  {loading.jobs ? (
                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                  ) : job?.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#27592D]/10 flex items-center justify-center">
                      <span className="text-[#27592D] font-bold text-sm">{job?.companyName?.charAt(0) || "?"}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {loading.jobs ? (
                    <>
                      <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-1.5" />
                      <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm truncate group-hover:text-[#27592D] transition-colors">{job?.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {[job?.companyName, job?.address?.provinceName].filter(Boolean).join(" · ")}
                      </p>
                    </>
                  )}
                </div>

                {/* Salary + badge */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  {loading.jobs ? (
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      {job?.isFeatured && (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#27592D]/10 text-[#27592D] mb-1">
                          Nổi bật
                        </span>
                      )}
                      <p className="text-xs font-semibold text-gray-700">
                        {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
                      </p>
                    </>
                  )}
                </div>

                <Bookmark className="w-4 h-4 text-gray-300 group-hover:text-[#27592D] transition-colors flex-shrink-0" />
              </div>
            ))}

            {!loading.jobs && jobs.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Không có việc làm nào.</p>
            )}
          </div>
        </div>

        {/* RIGHT — Top Companies (vertical cards) */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Đối tác tiêu biểu</p>
              <h2 className="text-2xl font-bold">Công ty nổi bật</h2>
            </div>
            <button
              onClick={() => navigate("/companies")}
              className="text-xs text-[#27592D] font-semibold hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(loading.companies ? Array.from({ length: 4 }) : companies).map((item, idx) => (
              <div
                key={item?.id ?? idx}
                onClick={() => item?.id && navigate(`/companies/${item.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Logo */}
                  {loading.companies ? (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                  ) : item?.logoUrl ? (
                    <img src={item.logoUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#27592D] font-bold text-lg">{item?.name?.charAt(0) || "?"}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {loading.companies ? (
                      <>
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-1.5" />
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                      </>
                    ) : (
                      <>
                        {item?.isVerified && (
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 mb-1.5">
                            Đã xác minh
                          </span>
                        )}
                        <p className="font-semibold text-sm truncate group-hover:text-[#27592D] transition-colors">{item?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {[item?.industry, item?.companySize].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-xs text-[#27592D] font-medium mt-1.5">
                          {item?.address?.provinceName || ""}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!loading.companies && companies.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có công ty nào.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Dark green CTA banner ── */}
      <section className="bg-[#1e3d24] text-white">
        <div className="px-4 md:px-10 xl:px-16 py-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Tiêu chuẩn vàng<br />của tuyển dụng chuyên nghiệp.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-md mb-8">
              Mỗi tin tuyển dụng trên RyuCareer đều được kiểm duyệt kỹ lưỡng. Chúng tôi kết nối ứng viên chất lượng với nhà tuyển dụng uy tín.
            </p>
            <div className="flex items-center gap-10">
              <div>
                <p className="text-3xl font-extrabold">
                  {loading.jobs ? "—" : (jobPagination?.totalElements ?? 0).toLocaleString("vi-VN")}
                </p>
                <p className="text-white/60 text-xs mt-1">Việc làm đang tuyển</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">
                  {loading.companies ? "—" : (companiesPagination?.totalElements ?? 0).toLocaleString("vi-VN")}
                </p>
                <p className="text-white/60 text-xs mt-1">Công ty đối tác</p>
              </div>
            </div>
          </div>

          {/* Right side — decorative card */}
          <div className="hidden md:flex justify-end">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 w-72 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Đăng tin tuyển dụng</p>
                  <p className="text-xs text-white/60">Tiếp cận hàng nghìn ứng viên</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/create-company")}
                className="w-full py-2.5 rounded-xl bg-white text-[#1e3d24] text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Bắt đầu ngay →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#F4F1EB] border-t border-gray-200">
        <div className="px-4 md:px-10 xl:px-16 py-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-[#27592D] tracking-tight">RyuCareer</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            <a href="#" className="hover:text-[#27592D]">Chính sách bảo mật</a>
            <a href="#" className="hover:text-[#27592D]">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-[#27592D]">Cookie</a>
            <a href="#" className="hover:text-[#27592D]">Trung tâm hỗ trợ</a>
          </nav>

          <p className="text-xs text-gray-400">© 2026 RyuCareer. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
}
