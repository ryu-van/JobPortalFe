import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import BrandButton from "../../../components/form/BrandButton";
import userService from "../../../services/userService";
import { useToast } from "../../../components/commons/ToastContext";
import { roles, ROLE_NAME } from "../../../constants/roles";
import { CircleChevronLeft, Pencil, Plus, Info, X, Search, Building2 } from "lucide-react";
import RadioButton from "../../../components/form/RadioButton";
import addressService from "../../../services/addressService";
import AddressSelect from "../../../components/commons/AddressSelect";
import companyService from "../../../services/companyService";
import TextArea from "../../../components/form/TextArea";

const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { addToast } = useToast();

  const isEditPath = location.pathname.endsWith("/edit");
  const initialMode = !id ? "add" : isEditPath ? "edit" : "view";

  const [mode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  
  // Use React Hook Form
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      id: "",
      fullName: "",
      code: "",
      email: "",
      gender: null,
      roleId: "",
      isActive: true,
      isEmailVerified: false,
      tokenExpiryDate: "",
      phoneNumber: "",
      avatarUrl: "",
      dateOfBirth: "",
      city: "",
      ward: "",
      street: "",
      lastLoginAt: "",
      companyId: "",
      companyName: "" // Added for display
    }
  });

  // Watch values for AddressSelect and dependent logic
  const watchedCity = watch("city");
  const watchedWard = watch("ward");
  const watchedAvatarUrl = watch("avatarUrl");
  const watchedLastLoginAt = watch("lastLoginAt");
  const watchedCompanyName = watch("companyName");

  const [avatarError, setAvatarError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [associationMode, setAssociationMode] = useState("search"); // "search" or "create"
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newCompanyData, setNewCompanyData] = useState({
    companyName: "",
    companyEmail: "",
    phoneNumber: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    isVerified: false,
    isActive: true
  });

  const [newCompanyAddresses, setNewCompanyAddresses] = useState([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [tempAddress, setTempAddress] = useState({
    addressType: "Work (Headquarters)",
    city: "",
    ward: "",
    street: ""
  });
  const [companyCommunes, setCompanyCommunes] = useState([]);

  // Fetch Companies
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await companyService.getAllCompanies({ 
          size: 1000,
          keyword: searchTerm 
        });
        if (res.success && mounted) {
          setCompanies(res.data.content || []);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchTerm]);

  const handleAddAddress = () => {
    if (!tempAddress.city || !tempAddress.street) {
      addToast("error", "Vui lòng điền Tỉnh/Thành phố và Địa chỉ chi tiết");
      return;
    }
    const selectedProvince = provinces.find(p => String(p.value) === String(tempAddress.city));
    const selectedWard = companyCommunes.find(w => String(w.value) === String(tempAddress.ward));

    const newAddr = {
      ...tempAddress,
      provinceName: selectedProvince?.label || "",
      wardName: selectedWard?.label || "",
      id: Date.now()
    };
    setNewCompanyAddresses([...newCompanyAddresses, newAddr]);
    setTempAddress({
      addressType: "Trụ sở chính",
      city: "",
      ward: "",
      street: ""
    });
    setCompanyCommunes([]);
    setShowAddAddressForm(false);
  };

  const removeAddress = (id) => {
    setNewCompanyAddresses(newCompanyAddresses.filter(a => a.id !== id));
  };

  // Fetch Provinces
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await addressService.getProvinces();
        if (p.success && mounted) {
          const mapped = p.data.map((x) => ({
            value: x.code || x.province_code,
            label: x.name || x.province_name,
          }));
          setProvinces(mapped);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch User Data
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserDetail(id);
        if (!mounted) return;

        const rawAddress = Array.isArray(data?.addresses)
          ? data.addresses.find((a) => a?.isPrimary) || data.addresses[0]
          : data?.address || null;

        const provinceCodeRaw =
          rawAddress?.provinceCode ??
          rawAddress?.province_code ??
          data?.provinceCode ??
          data?.province_code ??
          "";

        const communeCodeRaw =
          rawAddress?.communeCode ??
          rawAddress?.commune_code ??
          data?.communeCode ??
          data?.commune_code ??
          "";

        const detailAddress =
          rawAddress?.detailAddress ??
          rawAddress?.detail_address ??
          data?.street ??
          data?.address ??
          "";

        const provinceCode =
          provinceCodeRaw !== null && provinceCodeRaw !== undefined
            ? String(provinceCodeRaw)
            : "";
        const communeCode =
          communeCodeRaw !== null && communeCodeRaw !== undefined
            ? String(communeCodeRaw)
            : "";

        const companyNameVal = data?.companyName ??
          data?.company_name ??
          data?.company?.name ??
          "";
          
        reset({
          id: data?.id ?? "",
          fullName: data?.fullName || "",
          code: data?.code || "",
          email: data?.email || "",
          gender: (data?.gender === true || data?.gender === false) ? data.gender : null,
          roleId: data?.roleId ?? "",
          isActive:
            data?.isActive ??
            data?.is_active ??
            data?.active ??
            false,
          isEmailVerified:
            data?.isEmailVerified ??
            data?.is_email_verified ??
            data?.emailVerified ??
            false,
          tokenExpiryDate:
            data?.tokenExpiryDate ??
            data?.token_expiry_date ??
            "",
          phoneNumber: data?.phoneNumber || "",
          avatarUrl: data?.avatarUrl || "",
          dateOfBirth:
            data?.dateOfBirth ??
            data?.date_of_birth ??
            "",
          city: provinceCode,
          ward: communeCode,
          street: detailAddress,
          lastLoginAt:
            data?.lastLoginAt ??
            data?.last_login_at ??
            "",
          companyId: data?.companyId ?? data?.company_id ?? "",
          companyName: companyNameVal
        });

        if (provinceCode) {
          try {
            const res = await addressService.getCommunesByProvince(provinceCode);
            if (res.success && mounted) {
              const mappedWards = res.data.map((w) => ({
                value: w.code || w.ward_code,
                label: w.name || w.ward_name,
              }));
              setCommunes(mappedWards);
            }
          } catch (error) {
            console.error("Error fetching wards:", error);
          }
        }
        
        const initialAvatar = data?.avatarUrl || data?.avatar || "";
        if (initialAvatar && /^https?:\/\/.+/.test(initialAvatar)) {
          setAvatarPreview(initialAvatar);
        } else {
          setAvatarPreview(initialAvatar || "");
        }

      } catch (error) {
        if (!mounted) return;
        const message =
          error?.friendlyMessage ||
          error?.response?.data?.message ||
          "Không tải được thông tin người dùng";
        addToast("error", message);
        navigate("/admin/users");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id, addToast, navigate, reset]);

  const readOnly = mode === "view";
  
  const formatDateTime = (v) => {
    if (!v) return "";
    let d = new Date(v);
    if (isNaN(d.getTime()) && typeof v === "string") {
      const parts = v.split(".");
      const safe = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 3)}` : v;
      d = new Date(safe);
    }
    if (isNaN(d.getTime())) return String(v);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
  };

  const onAvatarClick = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarError(false);
    setAvatarFile(file || null);

    if (!file) {
      setAvatarPreview(watchedAvatarUrl || "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError(true);
      setAvatarPreview("");
      setAvatarFile(null);
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (readOnly) {
      navigate("/admin/users");
      return;
    }
    setLoading(true);
    try {
      if (!id) {
        const selectedProvince =
          provinces.find((p) => String(p.value) === String(data.city)) || null;
        const selectedCommune =
          communes.find((w) => String(w.value) === String(data.ward)) || null;
        let address = null;
        if (data.city || data.ward ) {
          address = {
            addressType: "USER",
            provinceCode: selectedProvince?.value || data.city || "",
            provinceName: selectedProvince?.label || "",
            communeCode: selectedCommune?.value || data.ward || "",
            communeName: selectedCommune?.label || "",  
            detailAddress: data.street || "",
            isPrimary: true,
          };
        }
        const payload = {
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          roleId: data.roleId || null,
          isActive: data.isActive,
          companyId: data.companyId || null,
          ...(address ? { address } : {}),
        };
        const newUser = await userService.createUser(payload);
        if (avatarFile && newUser?.id) {
          await userService.updateAvatar(newUser.id, avatarFile);
        }
        addToast("success", "Thêm người dùng thành công");
      } else {
        let uploadedUrl = null;
        if (avatarFile) {
          uploadedUrl = await userService.updateAvatar(id, avatarFile);
        }
        const payload = {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          roleId: data.roleId || null,
          isActive: data.isActive,
          companyId: data.companyId || null,
          avatarUrl: uploadedUrl ?? data.avatarUrl,
        };
        await userService.updateUser(id, payload);
        addToast("success", "Cập nhật người dùng thành công");
      }
      navigate("/admin/users");
    } catch (error) {
      const message =
        error?.friendlyMessage ||
        error?.response?.data?.message ||
        "Có lỗi xảy ra";
      addToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/users");
  };

  const title =
    mode === "add"
      ? "Tạo người dùng mới"
      : mode === "edit"
      ? "Cập nhật người dùng"
      : "Chi tiết người dùng";

  const subtitle =
    mode === "add"
      ? "Điền các thông tin dưới đây để tạo hồ sơ người dùng mới và liên kết với một công ty."
      : mode === "edit"
      ? "Cập nhật thông tin người dùng và liên kết công ty."
      : "Xem hồ sơ chi tiết của người dùng và liên kết công ty.";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2D1F]">
            {title}
          </h1>
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm shadow-sm transition-colors"
          onClick={handleClose}
          disabled={loading}
        >
          <CircleChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Form Fields */}
            <div className="flex-[2] space-y-6">
              {id && (
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Mã người dùng"
                      disabled
                    />
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "Họ và tên là bắt buộc" }}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Họ và tên"
                      disabled={loading || readOnly}
                      placeholder="vd: Nguyễn Văn A"
                      error={errors.fullName?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: "Địa chỉ Email là bắt buộc",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Địa chỉ email không hợp lệ"
                    }
                  }}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Địa chỉ Email"
                      disabled={loading || mode !== "add"}
                      placeholder="example@domain.com"
                      error={errors.email?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Số điện thoại"
                      disabled={loading || readOnly}
                      placeholder="vd: 0912345678"
                    />
                  )}
                />
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Ngày sinh"
                      type="date"
                      disabled={loading || readOnly}
                      placeholder="dd/mm/yyyy"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Giới tính
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <>
                          <RadioButton
                            name="gender"
                            value="false"
                            label="Nam"
                            checked={field.value === false}
                            disabled={loading || readOnly}
                            onChange={() => field.onChange(false)}
                            className="flex-1"
                          />
                          <RadioButton
                            name="gender"
                            value="true"
                            label="Nữ"
                            checked={field.value === true}
                            disabled={loading || readOnly}
                            onChange={() => field.onChange(true)}
                            className="flex-1"
                          />
                          <RadioButton
                            name="gender"
                            value="null"
                            label="Khác"
                            checked={field.value === null}
                            disabled={loading || readOnly}
                            onChange={() => field.onChange(null)}
                            className="flex-1"
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Trạng thái
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <>
                          <RadioButton
                            name="isActive"
                            value="true"
                            label="Đang hoạt động"
                            checked={field.value === true}
                            disabled={loading || readOnly}
                            onChange={() => field.onChange(true)}
                            className="flex-1"
                          />
                          <RadioButton
                            name="isActive"
                            value="false"
                            label="Ngừng hoạt động"
                            checked={field.value === false}
                            disabled={loading || readOnly}
                            onChange={() => field.onChange(false)}
                            className="flex-1"
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      label="Vai trò"
                      options={[
                        { value: roles.ADMIN, label: ROLE_NAME.ADMIN },
                        { value: roles.HR, label: ROLE_NAME.HR },
                        { value: roles.CANDIDATE, label: ROLE_NAME.CANDIDATE },
                        {
                          value: roles.ADMIN_COMPANY,
                          label: ROLE_NAME.ADMIN_COMPANY,
                        },
                      ]}
                      placeholder="Chọn vai trò"
                      disabled={loading || readOnly}
                    />
                  )}
                />
              </div>

              {/* Address Details Section */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Thông tin địa chỉ</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label="Tỉnh/Thành phố"
                        options={provinces}
                        placeholder="Chọn tỉnh/thành phố"
                        disabled={loading || readOnly}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue("ward", "");
                          const provinceCode = e.target.value;
                          if (provinceCode) {
                            addressService.getCommunesByProvince(provinceCode).then(res => {
                              if (res.success) {
                                const mappedWards = res.data.map((w) => ({
                                  value: w.code || w.ward_code,
                                  label: w.name || w.ward_name,
                                }));
                                setCommunes(mappedWards);
                              }
                            });
                          } else {
                            setCommunes([]);
                          }
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="ward"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label="Phường/Xã"
                        options={communes}
                        placeholder="Chọn phường/xã"
                        disabled={loading || readOnly || communes.length === 0}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Địa chỉ chi tiết"
                      disabled={loading || readOnly}
                      placeholder="Số nhà, tên đường..."
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Column: Avatar and Tips */}
            <div className="flex-1 w-full lg:max-w-[320px] space-y-6">
              <div className="bg-[#F9F9F4] rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100">
                <div
                  className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gray-100 shadow-sm flex items-center justify-center mb-4 ${
                    readOnly ? "" : "cursor-pointer group"
                  }`}
                  onClick={onAvatarClick}
                >
                  {(avatarPreview || watchedAvatarUrl) && !avatarError ? (
                    <img
                      src={avatarPreview || watchedAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  {!readOnly && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#27592D] border-4 border-white text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                      <Pencil className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {!avatarPreview && !watchedAvatarUrl && (
                  <p className="text-xs text-gray-500 font-medium">Chưa tải ảnh đại diện</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarFileChange}
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#27592D]">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mẹo đăng ký</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Đảm bảo tất cả thông tin liên lạc là chính xác để hệ thống xác minh.
                </p>
              </div>
            </div>
          </div>

          {/* Company Association Section */}
          <div className="space-y-8 pt-8 border-t border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-[#1F2D1F]">Liên kết công ty</h3>
              <p className="text-sm text-gray-500">Chọn một tổ chức hiện có hoặc tạo một tổ chức mới cho người dùng này.</p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => setAssociationMode("search")}
                className={`cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all border-2 ${
                  associationMode === "search" 
                    ? "border-[#27592D] bg-white shadow-md" 
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${associationMode === "search" ? "bg-[#27592D]/10" : "bg-gray-50"}`}>
                  <Search className={`w-6 h-6 ${associationMode === "search" ? "text-[#27592D]" : "text-gray-400"}`} />
                </div>
                <div className="text-center">
                  <h4 className={`font-bold ${associationMode === "search" ? "text-[#27592D]" : "text-gray-700"}`}>Chọn công ty hiện có</h4>
                  <p className="text-xs text-gray-400 mt-1">Tìm kiếm từ cơ sở dữ liệu các công ty đã đăng ký</p>
                </div>
              </div>

              <div 
                onClick={() => setAssociationMode("create")}
                className={`cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all border-2 ${
                  associationMode === "create" 
                    ? "border-[#27592D] bg-white shadow-md" 
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${associationMode === "create" ? "bg-[#27592D]/10" : "bg-gray-50"}`}>
                  <Building2 className={`w-6 h-6 ${associationMode === "create" ? "text-[#27592D]" : "text-gray-400"}`} />
                </div>
                <div className="text-center">
                  <h4 className={`font-bold ${associationMode === "create" ? "text-[#27592D]" : "text-gray-700"}`}>Tạo công ty mới</h4>
                  <p className="text-xs text-gray-400 mt-1">Đăng ký một hồ sơ tổ chức hoàn toàn mới</p>
                </div>
              </div>
            </div>

            {associationMode === "search" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">Tìm kiếm công ty</h4>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm theo tên..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#27592D]/20 focus:border-[#27592D] transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Chọn</th>
                        <th className="px-6 py-4">Tên công ty</th>
                        <th className="px-6 py-4">Ngành nghề</th>
                        <th className="px-6 py-4">Email công ty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {companies.length > 0 ? (
                        companies.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setValue("companyId", c.id)}>
                            <td className="px-6 py-4">
                              <Controller
                                name="companyId"
                                control={control}
                                render={({ field }) => (
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${field.value === c.id ? "border-[#27592D] bg-[#27592D]" : "border-gray-200"}`}>
                                    {field.value === c.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                  </div>
                                )}
                              />
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{c.companyName}</td>
                            <td className="px-6 py-4 text-gray-600">{c.industry || "---"}</td>
                            <td className="px-6 py-4 text-gray-500">{c.companyEmail || "---"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">Không tìm thấy công ty nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                <div className="border-2 border-gray-100 rounded-3xl p-8 bg-white shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#27592D] rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white rounded-sm"></div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Chi tiết công ty mới</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField
                        label={<span>Tên công ty <span className="text-red-500">*</span></span>}
                        placeholder="Tên pháp lý đầy đủ của công ty"
                        value={newCompanyData.companyName}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, companyName: e.target.value })}
                      />
                      <InputField
                        label={<span>Email công ty <span className="text-red-500">*</span></span>}
                        placeholder="corporate@domain.com"
                        value={newCompanyData.companyEmail}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, companyEmail: e.target.value })}
                      />
                      <InputField
                        label="Số điện thoại"
                        placeholder="+84 28..."
                        value={newCompanyData.phoneNumber}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, phoneNumber: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <SelectField
                        label="Ngành nghề"
                        placeholder="Chọn ngành nghề"
                        options={[
                          { value: "it", label: "Công nghệ thông tin" },
                          { value: "finance", label: "Tài chính" },
                          { value: "healthcare", label: "Y tế" },
                          { value: "education", label: "Giáo dục" },
                        ]}
                        value={newCompanyData.industry}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, industry: e.target.value })}
                      />
                      <SelectField
                        label="Quy mô công ty"
                        placeholder="Chọn quy mô"
                        options={[
                          { value: "1-10", label: "1-10 nhân viên" },
                          { value: "11-50", label: "11-50 nhân viên" },
                          { value: "51-200", label: "51-200 nhân viên" },
                          { value: "201-500", label: "201-500 nhân viên" },
                          { value: "500+", label: "500+ nhân viên" },
                        ]}
                        value={newCompanyData.companySize}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, companySize: e.target.value })}
                      />
                      <div className="flex flex-col gap-1 w-full text-sm">
                        <label className="font-medium text-gray-700">Trang web</label>
                        <div className="flex items-center border border-[#C7A59D]/40 rounded-xl bg-white/70 overflow-hidden h-[46px]">
                          <span className="px-4 text-gray-400 italic text-xs border-r border-[#C7A59D]/40 h-full flex items-center bg-gray-50/50">https://</span>
                          <input
                            type="text"
                            className="flex-1 px-4 outline-none bg-transparent h-full"
                            placeholder="www.example.com"
                            value={newCompanyData.website}
                            onChange={(e) => setNewCompanyData({ ...newCompanyData, website: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <TextArea
                      label="Mô tả công ty"
                      placeholder="Cung cấp một bản tóm tắt ngắn gọn về công ty..."
                      value={newCompanyData.description}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, description: e.target.value })}
                      rows={2}
                    />

                    <div className="flex items-center gap-12 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700">Đã xác minh</span>
                        <button
                          type="button"
                          onClick={() => setNewCompanyData({ ...newCompanyData, isVerified: !newCompanyData.isVerified })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${newCompanyData.isVerified ? 'bg-[#27592D]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newCompanyData.isVerified ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700">Đang hoạt động</span>
                        <button
                          type="button"
                          onClick={() => setNewCompanyData({ ...newCompanyData, isActive: !newCompanyData.isActive })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${newCompanyData.isActive ? 'bg-[#27592D]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newCompanyData.isActive ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    {/* Company Addresses Subsection */}
                    <div className="space-y-6 pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-gray-400 uppercase tracking-wider font-bold text-[10px]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Địa chỉ công ty</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newCompanyAddresses.map((addr) => (
                          <div key={addr.id} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl relative group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Building2 className="w-5 h-5 text-[#27592D]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#27592D]/10 text-[#27592D] uppercase tracking-wide">
                                  {addr.addressType.split(" ")[0]}
                                </span>
                                <span className="text-xs font-bold text-gray-900 truncate">{addr.provinceName}</span>
                              </div>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">{addr.street}</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeAddress(addr.id)}
                              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {showAddAddressForm ? (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SelectField
                              label="Loại địa chỉ"
                              options={[
                                { value: "Trụ sở chính", label: "Trụ sở chính" },
                                { value: "Chi nhánh", label: "Chi nhánh" },
                                { value: "Khác", label: "Khác" },
                              ]}
                              value={tempAddress.addressType}
                              onChange={(e) => setTempAddress({ ...tempAddress, addressType: e.target.value })}
                            />
                            <SelectField
                              label="Tỉnh/Thành phố"
                              placeholder="Chọn tỉnh/thành phố"
                              options={provinces}
                              value={tempAddress.city}
                              onChange={(e) => {
                                const provinceCode = e.target.value;
                                setTempAddress({ ...tempAddress, city: provinceCode, ward: "" });
                                if (provinceCode) {
                                  addressService.getCommunesByProvince(provinceCode).then(res => {
                                    if (res.success) {
                                      const mapped = res.data.map(w => ({
                                        value: w.code || w.ward_code,
                                        label: w.name || w.ward_name
                                      }));
                                      setCompanyCommunes(mapped);
                                    }
                                  });
                                } else {
                                  setCompanyCommunes([]);
                                }
                              }}
                            />
                            <SelectField
                              label="Quận/Huyện"
                              placeholder="Chọn quận/huyện"
                              options={companyCommunes}
                              value={tempAddress.ward}
                              onChange={(e) => setTempAddress({ ...tempAddress, ward: e.target.value })}
                              disabled={companyCommunes.length === 0}
                            />
                          </div>
                          <InputField
                            label="Địa chỉ chi tiết"
                            placeholder="Tên tòa nhà, Tầng, Số nhà, Tên đường..."
                            value={tempAddress.street}
                            onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                          />
                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button 
                              type="button" 
                              onClick={() => setShowAddAddressForm(false)}
                              className="text-sm font-bold text-gray-500 hover:text-gray-700"
                            >
                              Hủy
                            </button>
                            <button 
                              type="button" 
                              onClick={handleAddAddress}
                              className="flex items-center gap-2 px-6 py-2 bg-[#27592D] text-white rounded-xl text-sm font-bold hover:bg-[#1e4623] transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Xác nhận địa chỉ</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(true)}
                          className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-[#27592D]/20 hover:text-[#27592D] hover:bg-[#27592D]/5 transition-all"
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider">Thêm địa chỉ khác</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
            >
              Hủy
            </button>
            {mode !== "view" && (
              <BrandButton
                type="submit"
                fullWidth={false}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : mode === "add" ? "Tạo người dùng" : "Lưu thay đổi"}
              </BrandButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
