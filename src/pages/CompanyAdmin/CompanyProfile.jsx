import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  Building2,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Pencil,
  Save,
  X,
} from "lucide-react";
import companyService from "../../services/companyService";
import { useToast } from "../../components/commons/ToastContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldSkeleton({ wide }) {
  return (
    <div className={`animate-pulse ${wide ? "col-span-2" : ""}`}>
      <div className="h-2.5 w-24 bg-brand/10 rounded mb-2" />
      <div className="h-10 bg-brand/5 rounded-xl" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-10">
      <section className="pb-8 border-b border-ivory-deep">
        <div className="h-2.5 w-40 bg-brand/10 rounded mb-4 animate-pulse" />
        <div className="h-9 w-64 bg-brand/10 rounded animate-pulse" />
      </section>
      <div className="vw-card p-8 !rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-48 h-48 bg-brand/5 rounded-2xl animate-pulse" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton wide />
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationBadge({ isVerified }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <XCircle className="w-3.5 h-3.5" />
      Not Verified
    </span>
  );
}

function LogoUpload({ preview, onUploadClick, onFileChange, inputRef, readOnly }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full lg:w-48 shrink-0">
      <div
        onClick={() => !readOnly && onUploadClick()}
        className={`w-full lg:w-48 h-48 rounded-2xl border-2 border-dashed border-brand/20 bg-brand/5 flex items-center justify-center overflow-hidden relative group transition-all ${
          !readOnly ? "cursor-pointer hover:border-brand/40 hover:bg-brand/10" : ""
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Company logo"
              className="w-full h-full object-contain p-2"
            />
            {!readOnly && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white p-2 rounded-full text-brand shadow-lg">
                  <Upload className="w-5 h-5" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand/30">
            <ImageIcon className="w-10 h-10" />
            {!readOnly && (
              <span className="text-xs font-medium text-center px-4">
                Click to upload logo
              </span>
            )}
          </div>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={onUploadClick}
          className="flex items-center gap-1.5 text-xs font-bold text-brand/60 hover:text-brand transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Change logo
        </button>
      )}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyProfile() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const companyId = userInfo?.companyId;
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const logoInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      website: "",
      industryId: "",
      companySize: "",
      description: "",
      taxCode: "",
      establishmentDate: "",
    },
  });

  // Fetch industries and company data in parallel on mount
  useEffect(() => {
    if (!companyId) return;

    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [companyRes, industriesRes] = await Promise.all([
          companyService.getCompanyDetail(companyId),
          companyService.getAllIndustries(),
        ]);

        if (!mounted) return;

        // Populate industries dropdown
        const industryItems = Array.isArray(industriesRes)
          ? industriesRes
          : industriesRes?.data || [];
        setIndustries(
          industryItems.map((i) => ({ value: String(i.id), label: i.name }))
        );

        // Populate form
        const data = companyRes?.data ?? companyRes;
        if (data) {
          setIsVerified(!!data.isVerified);
          setLogoPreview(data.logoUrl || "");
          reset({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            website: data.website || "",
            industryId: data.industryId ? String(data.industryId) : "",
            companySize: data.companySize || "",
            description: data.description || "",
            taxCode: data.taxCode || "",
            establishmentDate: data.establishmentDate
              ? data.establishmentDate.split("T")[0]
              : "",
          });
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load company information. Please try again."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [companyId, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "Logo file must be under 5 MB.");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (formData) => {
    if (!companyId) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        website: formData.website || null,
        industryId: formData.industryId ? Number(formData.industryId) : null,
        companySize: formData.companySize || null,
        description: formData.description || null,
        taxCode: formData.taxCode || null,
        establishmentDate: formData.establishmentDate || null,
      };

      await companyService.updateCompany(companyId, payload, logoFile);
      setLogoFile(null); // clear pending file after successful save
      addToast("success", "Company profile updated successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update company profile.";
      addToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <section className="text-left pb-8 border-b border-ivory-deep">
        <p className="vw-section-label">Company Admin workspace</p>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-4xl font-bold tracking-tight text-brand">
            Company Profile
          </h1>
          <VerificationBadge isVerified={isVerified} />
        </div>
        <p className="text-brand/60 mt-4 max-w-2xl font-medium">
          Keep your company information up to date so candidates can find you.
        </p>
      </section>

      {/* Inline error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="vw-card p-8 !rounded-2xl space-y-8">
          {/* Logo + basic fields */}
          <div className="flex flex-col lg:flex-row gap-10">
            <LogoUpload
              preview={logoPreview}
              onUploadClick={() => logoInputRef.current?.click()}
              onFileChange={handleLogoChange}
              inputRef={logoInputRef}
            />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Company name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Acme Corporation"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition ${
                        errors.name ? "border-red-400" : "border-brand/10"
                      }`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Contact Email
                </label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="contact@company.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition ${
                        errors.email ? "border-red-400" : "border-brand/10"
                      }`}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Phone Number
                </label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      placeholder="+84 24 3999 8888"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand/10 text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />
                  )}
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true;
                      try {
                        const url = new URL(value);
                        return (
                          url.protocol === "http:" ||
                          url.protocol === "https:" ||
                          "Website must start with http:// or https://"
                        );
                      } catch {
                        return "Enter a valid URL (e.g. https://company.com)";
                      }
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      placeholder="https://company.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition ${
                        errors.website ? "border-red-400" : "border-brand/10"
                      }`}
                    />
                  )}
                />
                {errors.website && (
                  <p className="text-xs text-red-500">{errors.website.message}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Industry
                </label>
                <Controller
                  name="industryId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand/10 text-sm text-brand bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    >
                      <option value="">Select industry</option>
                      {industries.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              {/* Company Size */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Company Size
                </label>
                <Controller
                  name="companySize"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand/10 text-sm text-brand bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              {/* Tax Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Tax Code
                </label>
                <Controller
                  name="taxCode"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="0123456789"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand/10 text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />
                  )}
                />
              </div>

              {/* Establishment Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
                  Established
                </label>
                <Controller
                  name="establishmentDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true;
                      const d = new Date(value);
                      if (isNaN(d.getTime())) return "Invalid date";
                      if (d > new Date())
                        return "Establishment date cannot be in the future";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-brand bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/20 transition ${
                        errors.establishmentDate
                          ? "border-red-400"
                          : "border-brand/10"
                      }`}
                    />
                  )}
                />
                {errors.establishmentDate && (
                  <p className="text-xs text-red-500">
                    {errors.establishmentDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description — full width */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/50">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={5}
                  placeholder="Tell candidates about your company's mission, culture, and what makes it a great place to work..."
                  className="w-full px-4 py-3 rounded-xl border border-brand/10 text-sm text-brand bg-brand/5 placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition resize-none"
                />
              )}
            />
          </div>

          {/* Verification status — read-only info row */}
          <div className="flex items-center gap-3 pt-2 border-t border-brand/5">
            <Building2 className="w-4 h-4 text-brand/40" />
            <span className="text-xs font-medium text-brand/50">
              Verification status:
            </span>
            <VerificationBadge isVerified={isVerified} />
            <span className="text-xs text-brand/30 ml-1">
              (managed by platform administrators)
            </span>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="vw-btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
