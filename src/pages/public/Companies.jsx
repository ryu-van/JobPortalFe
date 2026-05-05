import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, X, MapPin } from "lucide-react";
import companyService from "../../services/companyService";
import addressService from "../../services/addressService";
import SelectField from "../../components/form/SelectField";
import BrandButton from "../../components/form/BrandButton";
import Pagination from "../../components/commons/Pagination";
import ClientLayout from "../../components/candidate/ClientLayout";

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
      <div className="space-y-12">
        {/* Page Header */}
        <section className="text-left py-8 border-b border-ivory-deep">
          <p className="vw-section-label">Industry Leaders</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand">Partner Network.</h1>
          <p className="text-brand/60 mt-4 max-w-2xl font-medium">Explore the companies shaping the future of global industries.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-12 items-start">
          {/* Search/Filter sidebar */}
          <aside className="space-y-8 sticky top-10">
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-brand/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  className="vw-input !pl-12 !bg-transparent border-ivory-deep focus:border-brand"
                  placeholder="Company name..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <SelectField
                  name="province"
                  value={provinceCode}
                  onChange={(e) => setProvinceCode(e.target.value)}
                  options={provinces}
                  placeholder="City or location"
                  size="sm"
                  className="!vw-input !pl-12 !py-0 !bg-transparent border-ivory-deep focus:border-brand"
                />
              </div>
            </div>

            {/* Banner */}
            <div className="bg-brand p-8 rounded-sm text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">For Employers</p>
                <h4 className="text-xl font-bold mb-4">Post your mission.</h4>
                <BrandButton
                  variant="ghost"
                  className="!bg-white !text-brand !min-h-[40px] !px-4"
                  onClick={() => navigate("/register")}
                >
                  Join the Network
                </BrandButton>
              </div>
              <Building2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            </div>
          </aside>

          {/* Company Grid */}
          <main className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-deep">
              <p className="text-xs font-bold text-brand uppercase tracking-widest">
                <span className="text-brand-light">{pagination?.totalElements || 0} Companies</span> verified
              </p>
            </div>

            {error && <div className="p-4 bg-rust/5 text-rust text-sm font-medium border border-rust/10">{error}</div>}

            {/* Empty state */}
            {!loading && companies.length === 0 && !error && (
              <div className="vw-card text-center py-16 text-brand/40 border-dashed">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-brand">No companies found</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(loading ? Array.from({ length: PAGE_SIZE }) : companies).map((item, idx) => (
                <article
                  key={item?.id ?? idx}
                  className="vw-card p-8 flex flex-col h-full hover:shadow-card group cursor-pointer"
                  onClick={() => item?.id && navigate(`/companies/${item.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-sm border border-ivory-deep bg-white flex items-center justify-center overflow-hidden">
                      {loading ? (
                        <div className="w-full h-full bg-ivory-warm animate-pulse" />
                      ) : item?.logoUrl ? (
                        <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-brand/20" />
                      )}
                    </div>
                    {!loading && item?.isVerified && (
                      <span className="px-3 py-1 bg-brand/10 text-brand text-[9px] font-bold uppercase tracking-widest rounded-full">Verified</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-brand mb-2 group-hover:text-brand-light transition-colors line-clamp-1">
                    {loading ? <div className="h-6 w-3/4 bg-ivory-warm animate-pulse rounded" /> : item?.name}
                  </h3>
                  <p className="text-sm text-brand/60 font-medium mb-6">
                    {loading ? <div className="h-4 w-1/2 bg-ivory-warm animate-pulse rounded" /> : [item?.industry, item?.companySize].filter(Boolean).join(" • ")}
                  </p>

                  <div className="pt-6 border-t border-ivory-deep flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-brand/40 uppercase tracking-widest">
                      {loading ? "" : item?.address?.provinceName || "Global"}
                    </span>
                    <button className="text-[10px] font-bold text-brand uppercase tracking-widest group-hover:text-brand-light">View Profile →</button>
                  </div>
                </article>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-12">
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
