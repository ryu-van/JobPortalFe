import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { CircleChevronLeft, Pencil, Plus, Info, Search, Building2, User, BriefcaseBusiness } from "lucide-react";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import BrandButton from "../../../components/form/BrandButton";
import RadioButton from "../../../components/form/RadioButton";
import AddressSelect from "../../../components/commons/AddressSelect";
import userService from "../../../services/userService";
import companyService from "../../../services/companyService";
import { useToast } from "../../../components/commons/ToastContext";
import { roles, ROLE_NAME } from "../../../constants/roles";

const GENDER_OPTIONS = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Khác", value: "OTHER" },
  { label: "Không muốn tiết lộ", value: "PREFER_NOT_TO_SAY" },
];

const STATUS_OPTIONS = [
  { value: true, label: "Đang hoạt động" },
  { value: false, label: "Ngừng hoạt động" }
];

const ROLE_OPTIONS = [
  { value: roles.COMPANY_ADMIN, label: ROLE_NAME.COMPANY_ADMIN },
  { value: roles.HR, label: ROLE_NAME.HR },
];

const UserAvatarSection = ({ readOnly, avatarPreview, watchedAvatarUrl, avatarError, onAvatarClick, setAvatarError, fileInputRef, onAvatarFileChange }) => (
  <div className="flex-1 w-full lg:max-w-[320px] space-y-6">
    <div className="bg-[#F9F9F4] rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100">
      <div
        className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gray-100 shadow-sm flex items-center justify-center mb-4 ${readOnly ? "" : "cursor-pointer group"}`}
        onClick={onAvatarClick}
      >
        {(avatarPreview || watchedAvatarUrl) && !avatarError ? (
          <img src={avatarPreview || watchedAvatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" onError={() => setAvatarError(true)} />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        )}
        {!readOnly && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#000000] border-4 border-white text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
            <Pencil className="w-4 h-4" />
          </div>
        )}
      </div>
      {!avatarPreview && !watchedAvatarUrl && <p className="text-xs text-gray-500 font-medium">Chưa tải ảnh đại diện</p>}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFileChange} />
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
      <div className="flex items-center gap-2 text-[#000000]"><Info className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Mẹo đăng ký</span></div>
      <p className="text-sm text-gray-600 leading-relaxed">Đảm bảo tất cả thông tin liên lạc là chính xác để hệ thống xác minh.</p>
    </div>
  </div>
);

const CompanySection = ({
  searchTerm,
  setSearchTerm,
  companies,
  setValue,
  clearErrors,
  watch,
  companyError,
}) => (
  <div className="space-y-8 pt-8 border-t border-gray-100">
    <div>
      <h3 className="text-lg font-bold text-[#1F2D1F]">Liên kết công ty</h3>
      <p className="text-sm text-gray-500">Chọn một tổ chức hiện có cho người dùng này.</p>
    </div>
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700">Tìm kiếm công ty</h4>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#000000]/20 focus:border-[#000000] outline-none"
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
              <th className="px-6 py-4">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {companies.length > 0 ? (
              companies.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setValue("companyId", c.id);
                    clearErrors("companyId");
                  }}
                >
                  <td className="px-6 py-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        watch("companyId") === c.id
                          ? "border-[#000000] bg-[#000000]"
                          : "border-gray-200"
                      }`}
                    >
                      {watch("companyId") === c.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.industry || "---"}</td>
                  <td className="px-6 py-4 text-gray-500">{c.email || "---"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                  Không tìm thấy công ty nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {companyError && (
        <p className="text-red-500 text-sm mt-1">{companyError}</p>
      )}
    </div>
  </div>
);

const LinkedCompanyCard = ({ companyId, companyName, industry, navigate }) => {
  if (!companyId) return null;
  return (
    <div className="space-y-4 pt-8 border-t border-gray-100">
      <h3 className="text-lg font-bold text-[#1F2D1F]">Công ty liên kết</h3>
      <div 
        onClick={() => navigate(`/admin/companies/${companyId}`)}
        className="group cursor-pointer flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:border-[#000000] hover:bg-white transition-all shadow-sm hover:shadow-md"
      >
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#000000]/20 shadow-sm transition-colors">
          <Building2 className="w-8 h-8 text-[#000000]" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#000000] transition-colors">{companyName || "Chưa cập nhật tên công ty"}</h4>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider">ID: {companyId}</span>
            {industry && <span>• {industry}</span>}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 group-hover:bg-[#000000] group-hover:text-white transition-all shadow-sm">
          <Plus className="w-5 h-5 rotate-45" />
        </div>
      </div>
    </div>
  );
};

const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { addToast } = useToast();
  const isEditPath = location.pathname.endsWith("/edit");
  const mode = !id ? "add" : isEditPath ? "edit" : "view";
  const readOnly = mode === "view";

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("HR");
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);
  const [linkedCompanyInfo, setLinkedCompanyInfo] = useState(null);

  const { control, handleSubmit, reset, setValue, setError, clearErrors, watch, formState: { errors } } = useForm({
    defaultValues: { id: "", fullName: "", email: "", password: "", dateOfBirth: "", gender: null, roleId: roles.HR, isActive: true, phoneNumber: "", avatarUrl: "", city: "", provinceName: "", ward: "", communeName: "", street: "", companyId: "" }
  });

  const watchedRoleId = watch("roleId");

  useEffect(() => {
    if (activeTab === "HR") {
      // If currently selected role is not HR or COMPANY_ADMIN, default to HR
      if (watchedRoleId !== roles.HR && watchedRoleId !== roles.COMPANY_ADMIN) {
        setValue("roleId", roles.HR);
      }
    } else if (activeTab === "CANDIDATE") {
      setValue("roleId", roles.CANDIDATE);
    }
  }, [activeTab, setValue, watchedRoleId]);

  const watchedAvatarUrl = watch("avatarUrl");

  const handleAddressChange = (val) => {
    setValue("city", val.provinceCode);
    setValue("provinceName", val.provinceName);
    setValue("ward", val.communeCode);
    setValue("communeName", val.communeName);
    clearErrors(["city", "ward"]);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await companyService.getCompanyDropdown(searchTerm || undefined);
        if (res) {
          // Bóc tách linh hoạt: ưu tiên res.data nếu là mảng, hoặc chính res nếu là mảng
          const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
          setCompanies(list);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanies([]);
      }
    };
    const timer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await userService.getUserDetail(id);
        if (!res) return;
        
        // Bóc tách dữ liệu thực tế từ response (có thể bọc trong data)
        const data = res.data || res;
        if (!data) return;

        const addr = data?.addresses?.find(a => a.isPrimary) || data?.addresses?.[0] || data?.address;
        
        // Ensure company name and industry are extracted if nested
        const companyName = data?.companyName  || "";
        const industry = data?.company?.industry || "";

        reset({
          ...data,
          companyName,
          city: String(addr?.provinceCode || ""),
          provinceName: addr?.provinceName || "",
          ward: String(addr?.communeCode || ""),
          communeName: addr?.communeName || "",
          street: addr?.detailAddress || data?.street || ""
        });
        setLinkedCompanyInfo({ id: data?.companyId, name: companyName, industry });

        if (data.roleId === roles.CANDIDATE) setActiveTab("CANDIDATE");
        setAvatarPreview(data.avatarUrl || "");
      } catch (err) {
        console.error("Error fetching user detail:", err);
      } finally { setLoading(false); }
    })();
  }, [id, reset]);

  const onSubmit = async (data) => {
    if (readOnly) return navigate("/admin/users");
    if (!data.city) {
      setError("city", { type: "manual", message: "Vui lòng chọn tỉnh/thành phố" });
      return;
    }
    if (!data.ward) {
      setError("ward", { type: "manual", message: "Vui lòng chọn phường/xã" });
      return;
    }
    if (mode === "add" && activeTab === "HR" && !data.companyId) {
      setError("companyId", { type: "manual", message: "Vui lòng chọn công ty" });
      return;
    }
    setLoading(true);
    try {
      const companyIdToLink = data.companyId;

      const addrRequest = {
        addressType: "HOME",
        provinceCode: data.city || "",
        provinceName: data.provinceName || "",
        communeCode: data.ward || "",
        communeName: data.communeName || "",
        detailAddress: data.street || "",
        isPrimary: true,
      };

      const userPayload = {
        fullName: data.fullName,
        email: data.email,
        gender: data.gender,
        password: data.password,
        dateOfBirth: data.dateOfBirth || null,
        phoneNumber: data.phoneNumber,
        isEmailVerified: data.isEmailVerified || false,
        roleId: data.roleId,
        companyId: companyIdToLink,
        addressRequest: addrRequest,
        isActive: data.isActive
      };

      if (!id) {
        // Create mode: Use the integrated createUser that handles FormData and avatar
        await userService.createUser(userPayload, avatarFile);
        addToast("success", "Tạo người dùng thành công");
      } else {
        // Update mode
        await userService.updateUser(id, userPayload);
        if (avatarFile) {
          await userService.updateAvatar(id, avatarFile);
        }
        addToast("success", "Cập nhật người dùng thành công");
      }
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      addToast("error", err.response?.data?.message || "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1F2D1F]">{mode === "add" ? `Tạo ${activeTab} mới` : "Người dùng"}</h1><p className="text-sm text-gray-500">Quản lý hồ sơ người dùng hệ thống</p></div>
        <button type="button" onClick={() => navigate("/admin/users")} className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm shadow-sm transition-all"><CircleChevronLeft className="w-4 h-4" /><span>Quay lại</span></button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        {mode === "add" && (
          <div className="flex gap-4 border-b pb-6">
            {[{id: "HR", role: roles.HR, icon: BriefcaseBusiness, label: "Tạo HR"}, {id: "CANDIDATE", role: roles.CANDIDATE, icon: User, label: "Tạo Candidate"}].map(tab => (
              <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setValue("roleId", tab.role); }} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-semibold ${activeTab === tab.id ? "bg-[#000000] text-white shadow-md scale-105" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}><tab.icon className="w-5 h-5" /><span>{tab.label}</span></button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-[2] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="fullName"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập họ và tên",
                    minLength: { value: 2, message: "Họ và tên tối thiểu 2 ký tự" },
                    maxLength: { value: 100, message: "Họ và tên không được vượt quá 100 ký tự" },
                  }}
                  render={({field}) => <InputField {...field} label="Họ và tên *" disabled={readOnly} error={errors.fullName?.message} />}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không đúng định dạng",
                    },
                  }}
                  render={({field}) => <InputField {...field} label="Email *" disabled={mode !== "add"} error={errors.email?.message} />}
                />
              </div>
              {mode === "add" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller name="password" control={control} rules={{
                    required: "Vui lòng nhập mật khẩu",
                    minLength: { value: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                    validate: (value) => {
                      if (!/[A-Z]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
                      if (!/[a-z]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ thường";
                      if (!/[0-9]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ số";
                      return true;
                    }
                  }} render={({field}) => <InputField {...field} type="password" label="Mật khẩu *" togglePassword={true} error={errors.password?.message} />} />
                  <Controller 
                    name="dateOfBirth" 
                    control={control} 
                    rules={{
                      required: "Vui lòng chọn ngày sinh",
                      validate: (value) => {
                        if (!value) return true;
                        const dob = new Date(value);
                        const now = new Date();
                        if (isNaN(dob.getTime()) || dob > now) return "Ngày sinh không hợp lệ";
                        const age = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000));
                        if (age < 15 || age > 100) return "Tuổi phải từ 15 đến 100";
                        return true;
                      }
                    }}
                    render={({field}) => <InputField {...field} type="date" label="Ngày sinh *" error={errors.dateOfBirth?.message} />} 
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^(0|\+84)[3-9][0-9]{8}$/,
                      message: "Số điện thoại không đúng định dạng (ví dụ: 0912345678)",
                    },
                  }}
                  render={({field}) => <InputField {...field} label="Số điện thoại *" disabled={readOnly} error={errors.phoneNumber?.message} />}
                />
                <Controller name="gender" control={control} rules={{required: "Vui lòng chọn giới tính"}} render={({field}) => <SelectField {...field} label="Giới tính" placeholder="Chọn giới tính" options={GENDER_OPTIONS} disabled={readOnly} error={errors.gender?.message} />} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><span className="text-sm font-medium text-gray-700">Trạng thái</span><div className="flex gap-2"><Controller name="isActive" control={control} render={({field}) => STATUS_OPTIONS.map(o => <RadioButton key={String(o.value)} label={o.label} checked={field.value === o.value} onChange={() => field.onChange(o.value)} disabled={readOnly} className="flex-1" />)} /></div></div>
                {(mode !== "add" || activeTab === "HR") && <Controller name="roleId" control={control} render={({field}) => <SelectField {...field} label="Vai trò" options={ROLE_OPTIONS} disabled={readOnly} />} />}
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <AddressSelect 
                  value={{ provinceCode: watch("city"), communeCode: watch("ward") }}
                  onChange={handleAddressChange}
                  disabled={readOnly}
                  errors={errors}
                />
              </div>
              <Controller
                name="street"
                control={control}
                rules={{ required: "Vui lòng nhập địa chỉ chi tiết" }}
                render={({field}) => <InputField {...field} label="Địa chỉ chi tiết" disabled={readOnly} error={errors.street?.message} />}
              />
            </div>
            <UserAvatarSection readOnly={readOnly} avatarPreview={avatarPreview} watchedAvatarUrl={watchedAvatarUrl} avatarError={avatarError} onAvatarClick={() => !readOnly && fileInputRef.current.click()} setAvatarError={setAvatarError} fileInputRef={fileInputRef} onAvatarFileChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!f.type.startsWith("image/")) {
                setAvatarError("Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF...)");
                e.target.value = "";
                return;
              }
              if (f.size > 5 * 1024 * 1024) {
                setAvatarError("Ảnh đại diện không được vượt quá 5MB");
                e.target.value = "";
                return;
              }
              setAvatarError(false);
              setAvatarFile(f);
              setAvatarPreview(URL.createObjectURL(f));
            }} />
          </div>

          {mode !== "add" && linkedCompanyInfo?.id && (
            <LinkedCompanyCard 
              companyId={linkedCompanyInfo.id} 
              companyName={linkedCompanyInfo.name} 
              industry={linkedCompanyInfo.industry} 
              navigate={navigate} 
            />
          )}

          {activeTab === "HR" && mode === "add" && (
            <CompanySection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              companies={companies}
              setValue={setValue}
              clearErrors={clearErrors}
              watch={watch}
              companyError={errors.companyId?.message}
            />
          )}

          <div className="flex justify-end gap-4 pt-6 border-t"><button type="button" onClick={() => navigate("/admin/users")} className="px-6 py-2.5 rounded-xl border bg-white text-sm font-semibold">Hủy</button>{!readOnly && <BrandButton type="submit" fullWidth={false} className="px-8 py-2.5 rounded-xl text-sm" disabled={loading}>{loading ? "Đang xử lý..." : mode === "add" ? "Tạo" : "Lưu"}</BrandButton>}</div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
