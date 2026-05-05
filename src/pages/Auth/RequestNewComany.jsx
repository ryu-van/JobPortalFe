import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Upload,
  FileText,
  X,
  Camera,
  ChevronRight,
  Info,
} from "lucide-react";
import InputField from "../../components/form/InputField";
import SelectField from "../../components/form/SelectField";
import BrandButton from "../../components/form/BrandButton";
import companyService from "../../services/companyService";
import authService from "../../services/authService";
import { useToast } from "../../components/commons/ToastContext";
import AddressSelect from "../../components/commons/AddressSelect";
import { roles } from "../../constants/roles";

// ── Step indicator ────────────────────────────────────────────────────────────
const steps = ["Người đại diện", "Thông tin công ty", "Địa chỉ & Tài liệu"];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${done ? "bg-[#000000] text-white" : active ? "bg-[#000000]/20 text-[#000000] ring-2 ring-[#000000]" : "bg-white/40 text-gray-400"}`}
              >
                {done ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1 text-xs font-medium whitespace-nowrap ${active ? "text-[#000000]" : done ? "text-[#000000]/70" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 md:w-24 mx-1 mb-5 transition-all ${done ? "bg-[#000000]" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const RequestNewCompany = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef(null);

  // Documents
  const [docFiles, setDocFiles] = useState([]);
  const docInputRef = useRef(null);

  const [contact, setContact] = useState({ person: "", email: "", phone: "" });
  const [company, setCompany] = useState({
    companyName: "",
    taxCode: "",
    street: "",
    city: "",
    provinceName: "",
    ward: "",
    communeName: "",
    industryId: "",
    requestedRole: "COMPANY_ADMIN",
  });

  // ── Load industries + current user ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await companyService.getAllIndustries();
        const items = Array.isArray(res) ? res : res?.data || [];
        setIndustries(items.map((i) => ({ value: String(i.id), label: i.name })));
      } catch {
        /* ignore */
      }
    })();

    (async () => {
      try {
        const u = await authService.getCurrentUser();
        if (u) {
          setCurrentUser(u);
          setContact((prev) => ({
            ...prev,
            person: prev.person || u.fullName || "",
            email: prev.email || u.email || "",
            phone: prev.phone || u.phoneNumber || "",
          }));
          // Pre-select role based on logged-in user's role
          if (u.roleId === roles.HR) {
            setCompany((prev) => ({ ...prev, requestedRole: "HR" }));
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // ── Field handlers ──────────────────────────────────────────────────────────
  const updateContact = (e) => {
    const { name, value } = e.target;
    setContact((c) => ({ ...c, [name]: value }));
    const map = { person: "contactPerson", email: "contactEmail", phone: "contactPhone" };
    setErrors((p) => ({ ...p, [map[name]]: "" }));
  };

  const updateCompany = (e) => {
    const { name, value } = e.target;
    setCompany((c) => ({ ...c, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAddressChange = (val) => {
    setCompany((prev) => ({
      ...prev,
      city: val.provinceCode,
      provinceName: val.provinceName,
      ward: val.communeCode,
      communeName: val.communeName,
    }));
    setErrors((p) => ({ ...p, city: "", ward: "" }));
  };

  // ── Logo ────────────────────────────────────────────────────────────────────
  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("error", "Vui lòng chọn file ảnh hợp lệ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "Logo không được vượt quá 5MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Documents ───────────────────────────────────────────────────────────────
  const onDocChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setDocFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name + f.size))];
    });
    // Reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeDoc = (idx) => setDocFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Validation per step ─────────────────────────────────────────────────────
  const validateStep = (s) => {
    const next = {};
    if (s === 0) {
      if (!contact.person.trim()) next.contactPerson = "Vui lòng nhập tên người đại diện";
      else if (contact.person.trim().length > 100) next.contactPerson = "Tối đa 100 ký tự";

      if (!contact.email.trim()) next.contactEmail = "Vui lòng nhập email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) next.contactEmail = "Email không hợp lệ";

      if (!contact.phone.trim()) next.contactPhone = "Vui lòng nhập số điện thoại";
      else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(contact.phone.replace(/\s/g, "")))
        next.contactPhone = "Số điện thoại không hợp lệ (ví dụ: 0912345678)";
    }
    if (s === 1) {
      if (!company.companyName.trim()) next.companyName = "Tên công ty không được để trống";
      else if (company.companyName.trim().length > 255) next.companyName = "Tối đa 255 ký tự";

      if (!company.taxCode.trim()) next.taxCode = "Mã số thuế không được để trống";
      else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(company.taxCode.trim()))
        next.taxCode = "Định dạng: 0123456789 hoặc 0123456789-001";
    }
    if (s === 2) {
      if (!company.city) next.city = "Vui lòng chọn tỉnh/thành phố";
      if (!company.ward) next.ward = "Vui lòng chọn phường/xã";
      if (!company.street.trim()) next.street = "Vui lòng nhập địa chỉ chi tiết";
    }
    return next;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const goBack = () => { setErrors({}); setStep((s) => s - 1); };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const address = {
        addressType: "HEADQUARTERS",
        provinceCode: company.city || "",
        provinceName: company.provinceName || "",
        communeCode: company.ward || "",
        communeName: company.communeName || "",
        detailAddress: company.street || "",
        isPrimary: true,
      };

      const payload = {
        contactPerson: contact.person,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        companyName: company.companyName,
        taxCode: company.taxCode,
        requestedRole: company.requestedRole,
        industryId: company.industryId || null,
        addressRequest: address,
      };

      await companyService.createCompanyVerificationRequest(payload, logoFile, docFiles);
      addToast("success", "Gửi yêu cầu xác thực công ty thành công!");
      navigate("/");
    } catch (err) {
      addToast("error", err?.response?.data?.message || err?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-white px-4 py-10">
      {/* Background blobs */}
      <div className="pointer-events-none fixed w-96 h-96 bg-[#C7A59D]/10 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="pointer-events-none fixed w-96 h-96 bg-[#000000]/10 rounded-full blur-3xl bottom-[-120px] right-[-80px]" />

      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#000000]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#000000]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#000000]">Đăng ký công ty</h1>
            <p className="text-sm text-gray-500">Hoàn tất hồ sơ để bắt đầu tuyển dụng</p>
          </div>
        </div>

        <StepBar current={step} />

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/30">

          {/* ── Step 0: Người đại diện ── */}
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#000000]/60 mb-1">
                Bước 1 — Người đại diện
              </p>

              {/* Logo upload centered */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div
                  className="relative w-24 h-24 rounded-2xl bg-[#E7E4DC] overflow-hidden cursor-pointer border-2 border-dashed border-[#000000]/30 hover:border-[#000000]/60 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#000000]/50 gap-1">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px]">Logo</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow">
                    <Camera className="w-3 h-3 text-[#000000]" />
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
                </div>
                <span className="text-xs text-gray-400">Logo công ty (tuỳ chọn)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputField
                    label="Tên người đại diện"
                    name="person"
                    value={contact.person}
                    onChange={updateContact}
                    placeholder="Nguyễn Văn A"
                    error={errors.contactPerson}
                  />
                </div>
                <InputField
                  label="Email người đại diện"
                  name="email"
                  type="email"
                  value={contact.email}
                  onChange={updateContact}
                  placeholder="example@company.com"
                  error={errors.contactEmail}
                />
                <InputField
                  label="Số điện thoại người đại diện"
                  name="phone"
                  value={contact.phone}
                  onChange={updateContact}
                  placeholder="0912 345 678"
                  error={errors.contactPhone}
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Thông tin công ty ── */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#000000]/60 mb-1">
                Bước 2 — Thông tin doanh nghiệp
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputField
                    label="Tên công ty"
                    name="companyName"
                    value={company.companyName}
                    onChange={updateCompany}
                    placeholder="Công ty TNHH ABC"
                    error={errors.companyName}
                  />
                </div>
                <InputField
                  label="Mã số thuế"
                  name="taxCode"
                  value={company.taxCode}
                  onChange={updateCompany}
                  placeholder="0123456789"
                  error={errors.taxCode}
                />
                <SelectField
                  label="Ngành nghề"
                  name="industryId"
                  options={industries}
                  value={company.industryId}
                  onChange={updateCompany}
                  placeholder="Chọn ngành nghề (tuỳ chọn)"
                  error={errors.industryId}
                />
                <div className="md:col-span-2">
                  <SelectField
                    label="Vai trò đăng ký"
                    name="requestedRole"
                    value={company.requestedRole}
                    onChange={updateCompany}
                    options={[
                      { value: "COMPANY_ADMIN", label: "Quản trị viên công ty" },
                      { value: "HR", label: "Nhân sự (HR)" },
                    ]}
                    error={errors.requestedRole}
                  />
                </div>
              </div>

              {/* Info callout */}
              <div className="flex gap-3 bg-[#000000]/5 border border-[#000000]/15 rounded-xl p-4">
                <Info className="w-4 h-4 text-[#000000] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#000000]/80 leading-relaxed">
                  Thông tin sẽ được đội ngũ kiểm duyệt xem xét. Vui lòng cung cấp thông tin chính xác để được xử lý nhanh hơn.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Địa chỉ & Tài liệu ── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#000000]/60 mb-1">
                Bước 3 — Địa chỉ & Tài liệu
              </p>

              <div className="relative z-40">
                <AddressSelect
                  value={{ provinceCode: company.city, communeCode: company.ward }}
                  onChange={handleAddressChange}
                  errors={errors}
                  labels={{ province: "Tỉnh/Thành phố", ward: "Phường/Xã" }}
                />
              </div>

              <InputField
                label="Địa chỉ chi tiết"
                name="street"
                value={company.street}
                onChange={updateCompany}
                placeholder="Số nhà, tên đường"
                error={errors.street}
              />

              {/* Document upload */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Tài liệu đính kèm <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </p>
                <label
                  className="flex items-center gap-4 border-2 border-dashed border-[#000000]/25 rounded-xl bg-[#000000]/5 hover:border-[#000000]/50 hover:bg-[#000000]/10 transition-colors cursor-pointer p-5"
                  onClick={() => docInputRef.current?.click()}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#000000]/10 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-[#000000]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#000000]">Tải lên tài liệu xác minh</p>
                    <p className="text-xs text-gray-500 mt-0.5">Giấy phép kinh doanh, CMND/CCCD đại diện, v.v.</p>
                  </div>
                  <input ref={docInputRef} type="file" multiple className="hidden" onChange={onDocChange} />
                </label>

                {docFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {docFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 bg-white/60 border border-white/40 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#000000]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-[#000000]" />
                          </div>
                          <span className="text-sm text-gray-700 truncate">{f.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(idx)}
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <BrandButton
            fullWidth={false}
            className="px-5 py-2"
            onClick={step === 0 ? () => navigate(-1) : goBack}
          >
            {step === 0 ? "Quay lại" : "← Trước"}
          </BrandButton>

          {step < steps.length - 1 ? (
            <BrandButton fullWidth={false} className="px-6 py-2" onClick={goNext}>
              Tiếp theo →
            </BrandButton>
          ) : (
            <BrandButton
              fullWidth={false}
              className="px-6 py-2"
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </BrandButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestNewCompany;
