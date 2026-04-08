import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, X } from "lucide-react";
import companyService from "../services/companyService";
import addressService from "../services/addressService";
import SelectField from "../components/form/SelectField";
import Pagination from "../components/commons/Pagination";
import ClientLayout from "../components/candidate/ClientLayout";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const PAGE_SIZE = 12;

export default function Companies() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provinces, setProvinces] = useState([]);

  const debounceRef = useRef(null);

  const locationName =
    provinces.find((p) => p.value === String(provinceCode))?.label || "";

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
  }, []);

  const fetchCompanies = async ({ kw = keyword, loc = locationName, pg = page } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await companyService.getAllCompanies({
        keyword: kw || undefined,
        location: loc || undefined,
        isActive: true,
        page: pg - 1,
        size: PAGE_SIZE,
      });
      setCompanies(extractList(res));
      setPagination(res?.pagination ?? null);
    } catch (e) {
      setError(e?.friendlyMessage || "Không thể tải danh sách công ty.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCompanies({ kw: keyword, pg: 1 });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    setPage(1);
    fetchCompanies({ pg: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode]);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ClientLayout>
      {/* Search */}
      <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <h1 className="text-2xl font-extrabold mb-4">Khám phá công ty</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl md:col-span-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                className="w-full text-sm outline-none"
                placeholder="Tên công ty..."
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
          </div>
        </section>

        {pagination && (
          <p className="text-sm text-gray-500">
            {pagination.totalElements.toLocaleString("vi-VN")} công ty
          </p>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && companies.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Không tìm thấy công ty</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(loading ? Array.from({ length: PAGE_SIZE }) : companies).map((item, idx) => (
            <article
              key={item?.id ?? idx}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => item?.id && navigate(`/companies/${item.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                {loading ? (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                ) : item?.logoUrl ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#27592D]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#27592D] font-bold text-lg">{item?.name?.charAt(0) || "?"}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold truncate">
                    {loading ? <span className="inline-block w-28 h-4 bg-gray-100 rounded animate-pulse" /> : item?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {loading ? <span className="inline-block w-20 h-3 bg-gray-100 rounded animate-pulse" /> : [item?.industry, item?.companySize].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#27592D] font-medium">
                  {loading ? "" : item?.address?.provinceName || ""}
                </span>
                <span className="text-gray-400 hover:text-[#27592D]">Xem hồ sơ →</span>
              </div>
            </article>
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
