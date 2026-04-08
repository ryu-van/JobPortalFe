import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, MapPin, Briefcase, X, Bookmark } from "lucide-react";
import jobService from "../services/jobService";
import categoryService from "../services/categoryService";
import addressService from "../services/addressService";
import SelectField from "../components/form/SelectField";
import Pagination from "../components/commons/Pagination";
import ClientLayout from "../components/candidate/ClientLayout";
import useSaveJob from "../hooks/useSaveJob";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Lương thỏa thuận";
  if (min == null && max == null) return "Chưa cập nhật";
  const fmt = (v) =>
    new Intl.NumberFormat("vi-VN").format(v || 0) + (currency ? ` ${currency}` : "");
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
};

const PAGE_SIZE = 9;

function JobCard({ job, loading, navigate }) {
  const { isSaved, toggle } = useSaveJob({
    savedJobId: job?.savedJobId ?? null,
    jobId: job?.id,
  });

  return (
    <article
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-8 h-8 rounded bg-gray-100 animate-pulse flex-shrink-0" />
          ) : job?.companyLogo ? (
            <img src={job.companyLogo} alt={job.companyName} className="w-8 h-8 rounded object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#27592D] font-bold text-xs">{job?.companyName?.charAt(0) || "?"}</span>
            </div>
          )}
          <div>
            <p className="font-bold text-sm leading-tight">
              {loading ? <span className="inline-block w-32 h-4 bg-gray-100 rounded animate-pulse" /> : job?.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? <span className="inline-block w-20 h-3 bg-gray-100 rounded animate-pulse" /> : job?.companyName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {job?.isFeatured && !loading && (
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">Nổi bật</span>
          )}
          {!loading && (
            <button
              onClick={toggle}
              className={`p-1.5 rounded-lg transition-colors ${isSaved ? "text-[#27592D] bg-[#27592D]/10" : "text-gray-300 hover:text-[#27592D] hover:bg-gray-50"}`}
              title={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#27592D]" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {loading ? (
          <>
            <span className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
            <span className="w-28 h-5 bg-gray-100 rounded animate-pulse" />
          </>
        ) : (
          <>
            {job?.address?.provinceName && (
              <span className="px-2 py-1 bg-gray-50 rounded-lg flex items-center gap-1">
                <MapPin className="w-3 h-3" />{job.address.provinceName}
              </span>
            )}
            <span className="px-2 py-1 bg-gray-50 rounded-lg">
              {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency, job?.isSalaryNegotiable)}
            </span>
            {(job?.skills ?? []).slice(0, 3).map((s) => (
              <span key={s} className="px-2 py-1 bg-green-50 text-[#27592D] rounded-lg">{s}</span>
            ))}
          </>
        )}
      </div>
    </article>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Seed initial state from URL query params (from Home search)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [provinceCode, setProvinceCode] = useState("");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);

  const debounceRef = useRef(null);

  const locationName = useMemo(() => {
    // If user selected a province from dropdown, use its label
    // Otherwise fall back to the text location passed from Home search
    return provinces.find((p) => p.value === String(provinceCode))?.label || locationFilter || "";
  }, [provinceCode, provinces, locationFilter]);

  // Load filter data
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

    categoryService.getCategories({ keyword: "" }).then((res) => {
      setCategories(
        extractList(res).map((c) => ({ value: String(c.id), label: c.name }))
      );
    }).catch(() => {});
  }, []);

  const fetchJobs = async ({ kw = keyword, loc = locationName, cat = categoryId, pg = page } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await jobService.getBaseJobs({
        keyword: kw || undefined,
        location: loc || undefined,
        categoryId: cat || undefined,
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

  // Debounced keyword search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchJobs({ kw: keyword, pg: 1 });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  // Immediate filter changes
  useEffect(() => {
    setPage(1);
    fetchJobs({ pg: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode, categoryId]);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setKeyword("");
    setProvinceCode("");
    setLocationFilter("");
    setCategoryId("");
    setPage(1);
  };

  const hasFilters = keyword || provinceCode || categoryId || locationFilter;

  return (
    <ClientLayout>
      {/* Search bar */}
      <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <h1 className="text-2xl font-extrabold mb-4">Tìm việc làm phù hợp</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                className="w-full text-sm outline-none"
                placeholder="Chức danh, từ khóa, công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button onClick={() => setKeyword("")}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="border border-gray-200 rounded-xl px-3 py-1">
              <SelectField
                name="province"
                value={provinceCode}
                onChange={(e) => setProvinceCode(e.target.value)}
                options={provinces}
                placeholder="Tỉnh / Thành phố"
                size="sm"
                className="!border-0 !px-0 !py-0 !bg-transparent"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3 py-1">
              <SelectField
                name="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories}
                placeholder="Danh mục"
                size="sm"
                className="!border-0 !px-0 !py-0 !bg-transparent"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-gray-500 hover:text-[#27592D] flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Xóa bộ lọc
            </button>
          )}
        </section>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.totalElements.toLocaleString("vi-VN")} việc làm` : ""}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Không tìm thấy việc làm phù hợp</p>
            <p className="text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(loading ? Array.from({ length: PAGE_SIZE }) : jobs).map((job, idx) => (
            <JobCard key={job?.id ?? idx} job={job} loading={loading} navigate={navigate} />
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
    </ClientLayout>
  );
}
