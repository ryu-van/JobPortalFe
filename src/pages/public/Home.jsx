import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Building2, MapPin,
  Award, Zap, TrendingUp, Sparkles, Users, ShieldCheck, Globe2, Briefcase
} from "lucide-react";
import SelectField from "../../components/form/SelectField";
import BrandButton from "../../components/form/BrandButton";
import addressService from "../../services/addressService";
import jobService from "../../services/jobService";
import companyService from "../../services/companyService";
import CandidateNavbar from "../../components/candidate/CandidateNavbar";

const extractList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const formatSalary = (min, max, currency, negotiable) => {
  if (negotiable) return "Thỏa thuận";
  if (min == null && max == null) return "Đang cập nhật";
  const fmt = (v) =>
    new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(v || 0) +
    (currency ? ` ${currency}` : "");
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  if (min != null) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max)}`;
};

const EXPERTISE = [
  { 
    id: 1, 
    name: "Quản trị & Điều hành", 
    icon: Award, 
    count: "1.2k+", 
    desc: "Vị trí lãnh đạo cấp cao và quản lý chiến lược doanh nghiệp.",
    tags: ["CEO", "Director", "Operations"]
  },
  { 
    id: 2, 
    name: "Công nghệ & Kỹ thuật", 
    icon: Zap, 
    count: "2.5k+", 
    desc: "Phát triển phần mềm, AI và hạ tầng kỹ thuật số hiện đại.",
    tags: ["Frontend", "AI/ML", "DevOps"]
  },
  { 
    id: 3, 
    name: "Tài chính & Ngân hàng", 
    icon: TrendingUp, 
    count: "800+", 
    desc: "Phân tích đầu tư, quản lý rủi ro và giải pháp tài chính.",
    tags: ["Audit", "CFA", "Investment"]
  },
  { 
    id: 4, 
    name: "Marketing & Sáng tạo", 
    icon: Sparkles, 
    count: "1.5k+", 
    desc: "Xây dựng thương hiệu và chiến dịch truyền thông đa phương tiện.",
    tags: ["Branding", "SEO", "Content"]
  },
  { 
    id: 5, 
    name: "Nhân sự & Pháp lý", 
    icon: Users, 
    count: "600+", 
    desc: "Quản trị nguồn nhân lực và tuân thủ khung pháp lý doanh nghiệp.",
    tags: ["HRBP", "Legal", "L&D"]
  },
  { 
    id: 6, 
    name: "Bán hàng & Dịch vụ", 
    icon: Briefcase, 
    count: "1.8k+", 
    desc: "Phát triển thị trường và tối ưu hóa trải nghiệm khách hàng.",
    tags: ["Sales B2B", "CS", "Account"]
  },
  { 
    id: 7, 
    name: "Y tế & Dược phẩm", 
    icon: ShieldCheck, 
    count: "450+", 
    desc: "Chăm sóc sức khỏe và nghiên cứu phát triển dược phẩm mới.",
    tags: ["Pharmacist", "Doctor", "R&D"]
  },
  { 
    id: 8, 
    name: "Giáo dục & Đào tạo", 
    icon: Globe2, 
    count: "700+", 
    desc: "Giảng dạy, đào tạo kỹ năng và quản lý giáo dục hiện đại.",
    tags: ["Teaching", "EdTech", "Curriculum"]
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [provinceCode, setProvinceCode] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState({ jobs: false, companies: false });

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
      } catch {
        setProvinces([]);
      }
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
        page: 0,
        size: 3,
        sort: "published_at",
        direction: "DESC",
      });
      setJobs(extractList(res));
    } catch {
      setJobs([]);
    } finally {
      setLoading((s) => ({ ...s, jobs: false }));
    }
  };

  const fetchCompanies = async () => {
    setLoading((s) => ({ ...s, companies: true }));
    try {
      const res = await companyService.getAllCompanies({ isActive: true, page: 0, size: 2 });
      setCompanies(extractList(res));
    } catch {
      setCompanies([]);
    } finally {
      setLoading((s) => ({ ...s, companies: false }));
    }
  };

  useEffect(() => {
    fetchJobs({});
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (locationName) params.set("location", locationName);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-[#15803d] selection:text-white">
      <div className="flex-1">
        <div className="px-4 md:px-10 xl:px-16 border-b border-gray-50 bg-white sticky top-0 z-50">
          <CandidateNavbar />
        </div>

        {/* ── HERO SECTION ── */}
        <section className="relative bg-[#15803d] text-white pt-16 pb-20 md:pt-24 md:pb-28 text-center px-4 overflow-hidden">
          {/* Subtle Background Pattern/Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">Nền tảng tuyển dụng chuyên nghiệp</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold tracking-[-0.03em] leading-[1] mb-6 md:mb-10">
              Sự nghiệp của bạn.<br />
              <span className="text-white/30">Được lưu trữ.</span>
            </h1>
            <p className="text-white/70 text-base md:text-xl font-medium max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed">
              Truy cập các vị trí quản lý và điều hành uy tín nhất.<br className="hidden sm:block" />
              Kết nối chính xác cho các chuyên gia tầm cỡ.
            </p>

            {/* Redesigned Search Bar */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-[24px] border border-white/10 w-full max-w-4xl mx-auto shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_auto] items-center gap-2">
                <div className="relative flex items-center h-14 pl-6 border-b md:border-b-0 md:border-r border-gray-100">
                  <Search className="w-5 h-5 text-gray-300 mr-4" />
                  <input
                    className="w-full h-full text-[15px] text-gray-900 outline-none bg-transparent font-medium placeholder:text-gray-300"
                    placeholder="Chức danh, từ khóa, công ty..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="relative flex items-center h-14 pl-6">
                  <MapPin className="w-5 h-5 text-gray-300 mr-4" />
                  <SelectField
                    name="provinceCode"
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value)}
                    options={provinces}
                    placeholder="Địa điểm"
                    size="sm"
                    className="!vw-input !border-0 !shadow-none !bg-transparent !py-0 !pl-0 !h-full !min-h-0 !text-[15px] font-medium !text-gray-900"
                  />
                </div>
                <button type="submit" className="bg-[#15803d] hover:bg-[#14532d] text-white px-10 h-14 rounded-[18px] text-[15px] font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20">
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── MAIN CONTENT GRID ── */}
        <section className="px-4 md:px-10 xl:px-16 py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
              
              {/* Left: Urgent Openings (8/12) */}
              <div className="lg:col-span-8 space-y-10">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-2">Lựa chọn ưu tiên</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Việc làm khẩn cấp</h2>
                  </div>
                  <button 
                    onClick={() => navigate('/jobs')} 
                    className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand transition-all"
                  >
                    Xem tất cả <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(loading.jobs ? Array.from({ length: 4 }) : jobs).map((job, idx) => (
                    loading.jobs ? (
                      /* Skeleton */
                      <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5 animate-pulse">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-gray-50 rounded w-1/3" />
                          <div className="h-4 bg-gray-50 rounded w-1/4" />
                        </div>
                      </div>
                    ) : (
                      <article
                        key={job?.id ?? idx}
                        onClick={() => job?.id && navigate(`/jobs/${job.id}`)}
                        className="group bg-white border border-gray-100 hover:border-brand/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 flex items-center gap-6 cursor-pointer transition-all relative overflow-hidden"
                      >
                        {/* Status bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand transform -translate-x-full group-hover:translate-x-0 transition-transform" />

                        {/* Logo */}
                        <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                          {job?.companyLogo ? (
                            <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover p-2" />
                          ) : (
                            <span className="text-brand/40 text-lg font-bold">
                              {job?.companyName?.slice(0, 2).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
                              {job?.title}
                            </h3>
                            {job?.isFeatured && (
                              <span className="px-2.5 py-1 rounded-lg bg-brand/5 text-brand text-[10px] font-bold border border-brand/10">
                                NỔI BẬT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <span className="truncate">{job?.companyName}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <MapPin className="w-3.5 h-3.5 opacity-50" />
                              {job?.location || job?.address?.provinceName}
                            </span>
                          </div>
                        </div>

                        {/* Salary + Action */}
                        <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-lg font-bold text-brand">
                            {formatSalary(job?.salaryMin, job?.salaryMax, job?.salaryCurrency || job?.currency, job?.isSalaryNegotiable || job?.negotiable)}
                          </span>
                          <span className="text-[11px] font-bold text-gray-300 group-hover:text-brand/60 transition-colors uppercase tracking-widest">Xem chi tiết</span>
                        </div>
                      </article>
                    )
                  ))}
                </div>
              </div>

              {/* Right: Top Companies (4/12) */}
              <div className="lg:col-span-4 space-y-10">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-2">ĐỐI TÁC TIÊU BIỂU</p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Công ty hàng đầu</h2>
                  </div>
                  <button 
                    onClick={() => navigate('/companies')} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand transition-all"
                  >
                    Tất cả
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {(loading.companies ? Array.from({ length: 2 }) : companies).map((co, idx) => (
                    <article
                      key={co?.id ?? idx}
                      onClick={() => co?.id && navigate(`/companies/${co.id}`)}
                      className="group bg-white p-8 rounded-[32px] border border-gray-100 hover:border-brand/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                          {co?.logoUrl || co?.logo ? (
                            <img src={co.logoUrl || co.logo} alt={co.name} className="w-full h-full object-cover p-2" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-200" />
                          )}
                        </div>
                        {co?.isVerified && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 rounded-full border border-brand/10">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Đã xác minh</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-brand transition-colors">{co?.name || "Đang tải..."}</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 line-clamp-2">
                        {co?.description || "Dẫn đầu trong việc cung cấp các giải pháp nhân sự và chiến lược tăng trưởng bền vững."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                              <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand">24 VỊ TRÍ ĐANG TUYỂN</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── THE GOLD STANDARD SECTION ── */}
        <section className="bg-[#15803d] text-white py-16 md:py-24 lg:py-32 overflow-hidden relative">
          <div className="px-4 md:px-6 lg:px-10 xl:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="space-y-8 md:space-y-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                Tiêu chuẩn vàng<br />
                trong tuyển dụng chuyên nghiệp.
              </h2>
              <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                Chúng tôi không chỉ đăng tin tuyển dụng; chúng tôi kiến tạo di sản. Mọi vị trí trên RyuCareer đều trải qua quy trình xác thực 7 bước để đảm bảo tính liêm chính của tổ chức.
              </p>
              <div className="grid grid-cols-2 gap-6 md:gap-10">
                <div>
                  <p className="text-3xl md:text-4xl font-bold mb-2">98%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tỷ lệ tuyển dụng thành công</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold mb-2">450+</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Đối tác chiến lược</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                  alt="Professional Office" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <section className="py-16 md:py-24 lg:py-32 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-[#15803d] tracking-tight mb-8 md:mb-12 leading-tight">
              Sẵn sàng để bắt đầu<br />
              Chương tiếp theo?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <BrandButton className="!h-12 md:!h-14 px-8 md:px-12 !text-[13px] !font-bold w-full sm:w-auto">
                Tạo hồ sơ miễn phí
              </BrandButton>
              <BrandButton variant="secondary" className="!h-12 md:!h-14 px-8 md:px-12 !text-[13px] !font-bold w-full sm:w-auto !border-[#15803d] !text-[#15803d]">
                Tìm kiếm công việc
              </BrandButton>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-[#15803d] py-16 text-white border-t border-white/5">
        <div className="px-4 md:px-10 xl:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <a href="/" className="font-bold text-2xl text-white tracking-tighter">RyuCareer</a>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-3">© 2026 RYUCAREER ARCHIVE. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {['Bảo mật', 'Điều khoản', 'Cookies', 'Liên hệ'].map(link => (
                <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
