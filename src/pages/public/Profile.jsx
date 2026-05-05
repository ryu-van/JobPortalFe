import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Camera, Mail, Phone, User, Calendar, MapPin,
    FileText, Globe, Loader2, AlertCircle, CheckCircle
  } from "lucide-react";
import BrandButton from "../../components/form/BrandButton";
import ClientLayout from "../../components/candidate/ClientLayout";
import CandidateAccountSidebar from "../../components/candidate/CandidateAccountSidebar";
import AddressSelect from "../../components/commons/AddressSelect";
import userService from "../../services/userService";
import { loginSuccess } from "../../store/userSlice";

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-[#15803d]" />}
      <h2 className="font-bold text-base text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputGroup = ({ label, icon: Icon, value, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#15803d] transition-colors">
      {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      {type === "textarea" ? (
        <textarea className="w-full text-sm outline-none bg-transparent resize-none" rows={3} value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        <input type={type} className="w-full text-sm outline-none bg-transparent" value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  </div>
);

export default function Profile() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const token = useSelector((s) => s.user.token);
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "", phoneNumber: "", dateOfBirth: "",
    gender: "", summary: "",
    // address
    provinceCode: "", provinceName: "",
    communeCode: "", communeName: "",
    detailAddress: "",
  });

  useEffect(() => {
    if (!userInfo?.id) return;
    (async () => {
      try {
        const res = await userService.getUserDetail(userInfo.id);
        const fullInfo = res.data?.data || res.data || res;
        if (fullInfo) {
          dispatch(loginSuccess({ user: fullInfo, token }));
        }
      } catch (err) {
        console.error("Error fetching full user details:", err);
      }
    })();
  }, [userInfo?.id, dispatch, token]);

  useEffect(() => {
    if (userInfo) {
      const addr = userInfo.address || null;
      let dob = "";
      if (userInfo.dateOfBirth) {
        if (Array.isArray(userInfo.dateOfBirth)) {
          // Handle [yyyy, mm, dd] array format
          const [y, m, d] = userInfo.dateOfBirth;
          dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        } else {
          dob = String(userInfo.dateOfBirth).split("T")[0];
        }
      }

      setForm({
        fullName:     userInfo.fullName     || "",
        phoneNumber:  userInfo.phoneNumber  || "",
        dateOfBirth:  dob,
        gender:       userInfo.gender       || "",
        summary:      userInfo.summary      || "",
        provinceCode: addr?.provinceCode    || "",
        provinceName: addr?.provinceName    || "",
        communeCode:  addr?.communeCode     || "",
        communeName:  addr?.communeName     || "",
        detailAddress: addr?.detailAddress  || "",
      });
    }
  }, [userInfo]);

  if (!userInfo) {
    return (
      <ClientLayout>
        <div className="max-w-5xl mx-auto py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#15803d]" />
        </div>
      </ClientLayout>
    );
  }

  const avatar = userInfo.avatarUrl || userInfo.avatar || null;
  const name = userInfo.fullName || userInfo.name || "Người dùng";
  const email = userInfo.email || "";

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF...).");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh đại diện không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }
    setAvatarLoading(true);
    try {
      const url = await userService.updateAvatar(userInfo.id, file);
      dispatch(loginSuccess({ user: { ...userInfo, avatarUrl: url }, token }));
    } catch {
      setError("Không thể cập nhật ảnh đại diện.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.fullName?.trim()) {
      setError("Họ và tên không được để trống.");
      return false;
    }
    if (form.fullName.trim().length > 100) {
      setError("Họ và tên không được vượt quá 100 ký tự.");
      return false;
    }
    if (form.phoneNumber) {
      const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
      if (!phoneRegex.test(form.phoneNumber.replace(/\s/g, ""))) {
        setError("Số điện thoại không hợp lệ (ví dụ: 0912345678).");
        return false;
      }
    }
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        setError("Ngày sinh phải là ngày trong quá khứ.");
        return false;
      }
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 15 || age > 100) {
        setError("Tuổi phải từ 15 đến 100.");
        return false;
      }
    }
    if (form.summary && form.summary.length > 1000) {
      setError("Giới thiệu bản thân không được vượt quá 1000 ký tự.");
      return false;
    }
    if (form.detailAddress && form.detailAddress.length > 200) {
      setError("Địa chỉ chi tiết không được vượt quá 200 ký tự.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!userInfo?.id) return;
    setError("");
    setSuccess("");
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        fullName:    form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth || null,
        gender:      form.gender || null,
        summary:     form.summary,
        addressRequest: {
          addressType:   "HOME",
          provinceCode:  form.provinceCode,
          provinceName:  form.provinceName,
          communeCode:   form.communeCode,
          communeName:   form.communeName,
          detailAddress: form.detailAddress,
          isPrimary:     true,
        },
      };
      await userService.updateUser(userInfo.id, payload);
      
      // Refresh full details after save to ensure all nested objects (like address) are updated correctly
      const res = await userService.getUserDetail(userInfo.id);
      const fullInfo = res.data?.data || res.data || res;
      dispatch(loginSuccess({ user: fullInfo || { ...userInfo, ...form }, token }));
      
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err?.friendlyMessage || "Không thể cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ClientLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <CandidateAccountSidebar />
        
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="vw-card p-8 !rounded-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-ivory-alt overflow-hidden bg-ivory-deep flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-brand/20" />
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-brand text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-brand mb-1">{name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-brand/60">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {email}</span>
                {form.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {form.phoneNumber}</span>}
              </div>
              <div className="mt-4">
                <span className="vw-badge vw-badge-active">Ứng viên</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="vw-card p-10 !rounded-sm">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-ivory-deep">
              <div className="w-8 h-8 rounded-full bg-brand/5 flex items-center justify-center text-brand">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-brand uppercase tracking-widest">Thông tin cá nhân</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Họ và tên *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand/20" />
                  <input
                    className="vw-input !pl-12"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand/20" />
                  <input
                    className="vw-input !pl-12"
                    placeholder="0123456789"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Ngày sinh</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand/20" />
                  <input
                    type="date"
                    className="vw-input !pl-12"
                    value={form.dateOfBirth ? form.dateOfBirth.split("T")[0] : ""}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Giới tính</label>
                <select
                  className="vw-input"
                  value={form.gender || ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                  <option value="prefer_not_to_say">Không muốn tiết lộ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <AddressSelect
                  value={{ provinceCode: form.provinceCode, communeCode: form.communeCode }}
                  onChange={(val) => setForm({
                    ...form,
                    provinceCode: val.provinceCode,
                    provinceName: val.provinceName,
                    communeCode: val.communeCode,
                    communeName: val.communeName
                  })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Địa chỉ chi tiết</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand/20" />
                  <input
                    className="vw-input !pl-12"
                    placeholder="Số nhà, tên đường..."
                    value={form.detailAddress}
                    onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-1">Giới thiệu bản thân</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-4 top-4 text-brand/20" />
                  <textarea
                    className="vw-input !pl-12 !py-4 min-h-[120px] resize-none"
                    placeholder="Mô tả ngắn gọn về bản thân..."
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && <p className="mt-6 text-sm font-bold text-rust flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
            {success && <p className="mt-6 text-sm font-bold text-brand flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</p>}

            <div className="mt-12 flex justify-end">
              <BrandButton
                onClick={handleSave}
                loading={saving}
                className="!rounded-sm"
              >
                Lưu thay đổi
              </BrandButton>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
