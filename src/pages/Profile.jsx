import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera, Mail, Phone, User, Calendar } from "lucide-react";
import ClientLayout from "../components/candidate/ClientLayout";
import userService from "../services/userService";
import { loginSuccess } from "../store/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const userInfo = useSelector((s) => s.user.userInfo);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: userInfo?.fullName || "",
    phoneNumber: userInfo?.phoneNumber || "",
    dateOfBirth: userInfo?.dateOfBirth || "",
    gender: userInfo?.gender || "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const avatar = userInfo?.avatarUrl || userInfo?.avatar || null;
  const name = userInfo?.fullName || userInfo?.name || "Người dùng";
  const email = userInfo?.email || "";

  useEffect(() => {
    setForm({
      fullName: userInfo?.fullName || "",
      phoneNumber: userInfo?.phoneNumber || "",
      dateOfBirth: userInfo?.dateOfBirth || "",
      gender: userInfo?.gender || "",
    });
  }, [userInfo]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userInfo?.id) return;
    setAvatarLoading(true);
    try {
      const url = await userService.updateAvatar(userInfo.id, file);
      dispatch(loginSuccess({ user: { ...userInfo, avatarUrl: url } }));
    } catch {
      setError("Không thể cập nhật ảnh đại diện.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userInfo?.id) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await userService.updateUser(userInfo.id, form);
      dispatch(loginSuccess({ user: { ...userInfo, ...form } }));
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err?.friendlyMessage || "Không thể cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Avatar + name */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#27592D]/10 flex items-center justify-center">
                <User className="w-8 h-8 text-[#27592D]" />
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#27592D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#1f4022] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-bold text-lg">{name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />{email}
            </p>
            <span className="inline-block mt-2 text-xs px-2.5 py-1 bg-[#27592D]/10 text-[#27592D] rounded-full font-medium">
              {userInfo?.role?.name || "Ứng viên"}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-base">Thông tin cá nhân</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Họ và tên</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input className="w-full text-sm outline-none bg-transparent" value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Nhập họ và tên" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Số điện thoại</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input className="w-full text-sm outline-none bg-transparent" value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} placeholder="Nhập số điện thoại" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ngày sinh</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input type="date" className="w-full text-sm outline-none bg-transparent" value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Giới tính</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="prefer_not_to_say">Không muốn tiết lộ</option>
              </select>
            </div>
          </div>

          {success && <p className="text-sm text-green-600">{success}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-[#27592D] text-white rounded-xl text-sm font-semibold hover:bg-[#1f4022] transition-colors disabled:opacity-60">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const userInfo = useSelector((s) => s.user.userInfo);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: userInfo?.fullName || "",
    phoneNumber: userInfo?.phoneNumber || "",
    dateOfBirth: userInfo?.dateOfBirth || "",
    gender: userInfo?.gender || "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const avatar = userInfo?.avatarUrl || userInfo?.avatar || null;
  const name = userInfo?.fullName || userInfo?.name || "Người dùng";
  const email = userInfo?.email || "";

  useEffect(() => {
    setForm({
      fullName: userInfo?.fullName || "",
      phoneNumber: userInfo?.phoneNumber || "",
      dateOfBirth: userInfo?.dateOfBirth || "",
      gender: userInfo?.gender || "",
    });
  }, [userInfo]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userInfo?.id) return;
    setAvatarLoading(true);
    try {
      const url = await userService.updateAvatar(userInfo.id, file);
      dispatch(loginSuccess({ user: { ...userInfo, avatarUrl: url } }));
    } catch (err) {
      setError("Không thể cập nhật ảnh đại diện.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userInfo?.id) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await userService.updateUser(userInfo.id, form);
      dispatch(loginSuccess({ user: { ...userInfo, ...form } }));
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err?.friendlyMessage || "Không thể cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      <div className="px-4 md:px-10 xl:px-16 pt-5 pb-16 max-w-3xl mx-auto space-y-6">
        <CandidateNavbar />

        {/* Avatar + name header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#27592D]/10 flex items-center justify-center">
                <User className="w-8 h-8 text-[#27592D]" />
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#27592D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#1f4022] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-bold text-lg">{name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />{email}
            </p>
            <span className="inline-block mt-2 text-xs px-2.5 py-1 bg-[#27592D]/10 text-[#27592D] rounded-full font-medium">
              {userInfo?.role?.name || "Ứng viên"}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-base">Thông tin cá nhân</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Họ và tên</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  className="w-full text-sm outline-none bg-transparent"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Số điện thoại</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  className="w-full text-sm outline-none bg-transparent"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ngày sinh</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="date"
                  className="w-full text-sm outline-none bg-transparent"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Giới tính</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="prefer_not_to_say">Không muốn tiết lộ</option>
              </select>
            </div>
          </div>

          {success && <p className="text-sm text-green-600">{success}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#27592D] text-white rounded-xl text-sm font-semibold hover:bg-[#1f4022] transition-colors disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
