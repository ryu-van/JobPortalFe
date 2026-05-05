import React, { useEffect, useState, useRef } from "react";
import InputField from "../../components/form/InputField";
import SelectField from "../../components/form/SelectField";
import BrandButton from "../../components/form/BrandButton";
import { useToast } from "../../components/commons/ToastContext";
import authService from "../../services/authService";
import userService from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/userSlice";
import { Camera, MapPin, User, Info, Pencil, Plus, Image as ImageIcon } from "lucide-react";
import { roles } from "../../constants/roles";
import AddressSelect from "../../components/commons/AddressSelect";
const AdditionalInformation = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
    dateOfBirth: "",
    gender: null,
    CompanyId: null,
    roleId: null,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Check token before calling getCurrentUser to avoid 403 error
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          return;
        }
        
        const u = await authService.getCurrentUser();
        console.log("AdditionalInformation getCurrentUser:", u);

        if (!mounted || !u) {
          return;
        }
        const safeId = u.id ?? u.userId ?? u._id ?? u.uuid ?? null;
        if (!safeId) {
          addToast("error", "Không xác định được ID người dùng");
          return;
        }
        setUserId(safeId);
        const addr = u.address || {};
        setForm((prev) => ({
          ...prev,
          ...u,
          gender: u?.gender ? String(u.gender).toUpperCase() : prev.gender,
          dateOfBirth: u?.dateOfBirth ?? u?.date_of_birth ?? prev.dateOfBirth,
          city: addr.provinceCode || "",
          provinceName: addr.provinceName || "",
          ward: addr.communeCode || "",
          communeName: addr.communeName || "",
          street: addr.detailAddress || "",
        }));
        if (u?.phoneNumber) {
          navigate("/");
          return;
        }

        const initialAvatar = u.avatarUrl || u.avatar || "";
        if (initialAvatar && /^https?:\/\/.+/.test(initialAvatar)) {
          setAvatarPreview(initialAvatar);
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressChange = (val) => {
    setForm((prev) => ({
      ...prev,
      city: val.provinceCode,
      provinceName: val.provinceName,
      ward: val.communeCode,
      communeName: val.communeName,
    }));
    setErrors((prev) => ({ ...prev, city: "", ward: "" }));
  };

  const onAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarError("");
    setAvatarFile(file);

    if (!file) {
      setAvatarPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setAvatarError("Vui lòng chọn ảnh hợp lệ");
      setAvatarPreview("");
      setAvatarFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ảnh đại diện không được vượt quá 5MB");
      setAvatarPreview("");
      setAvatarFile(null);
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onAvatarClick = () => fileInputRef.current?.click();

  const validate = () => {
    const next = {};
    if (!form.phoneNumber) next.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(form.phoneNumber.replace(/\s/g, "")))
      next.phoneNumber = "Số điện thoại không hợp lệ (ví dụ: 0912345678)";

    if (!form.gender) next.gender = "Vui lòng chọn giới tính";

    if (!form.city) next.city = "Vui lòng chọn tỉnh/thành phố";
    if (!form.ward) next.ward = "Vui lòng chọn phường/xã";

    if (!form.dateOfBirth) {
      next.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else {
      const dob = new Date(form.dateOfBirth);
      const now = new Date();
      if (isNaN(dob.getTime()) || dob >= now) {
        next.dateOfBirth = "Ngày sinh phải là ngày trong quá khứ";
      } else {
        const age = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 15 || age > 100) {
          next.dateOfBirth = "Tuổi phải từ 15 đến 100";
        }
      }
    }

    return next;
  };

  const onSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (!userId) {
      addToast("error", "Không tìm thấy thông tin người dùng");
      return;
    }

    setLoading(true);

    try {
      let uploadedUrl = null;

      if (avatarFile) {
        uploadedUrl = await userService.updateAvatar(userId, avatarFile);
      }

      const addressRequest = {
        addressType: "HOME",
        provinceCode: form.city || "",
        provinceName: form.provinceName || "",
        communeCode: form.ward || "",
        communeName: form.communeName || "",
        detailAddress: form.street || "",
        isPrimary: true,
      };

      const payload = {
        ...form,
        avatarUrl: uploadedUrl ?? form.avatarUrl,
        addressRequest,
      };

      await userService.updateUser(userId, payload);

      addToast("success", "Cập nhật thành công!");
      
      // Fetch updated user and sync Redux store BEFORE navigating,
      // so ProtectedRoute sees the new phoneNumber and doesn't redirect back.
      const updatedUser = await authService.getCurrentUser();
      dispatch(loginSuccess({ user: updatedUser }));

      const userRole = updatedUser?.roleId;

      if (userRole === roles.ADMIN) {
        navigate("/admin/dashboard");
      } else if (userRole === roles.COMPANY_ADMIN) {
        navigate("/create-company");
      } else if (userRole === roles.HR) {
        if (updatedUser?.companyId) {
          navigate("/hr/dashboard");
        } else {
          navigate("/create-company");
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      addToast("error", err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center bg-white px-4 py-8">
      <div className="pointer-events-none absolute w-96 h-96 bg-brand/10 rounded-full blur-3xl top-[-100px] left-[-100px]" />

      <div className="pointer-events-none absolute w-96 h-96 bg-brand/5 rounded-full blur-3xl bottom-[-120px] right-[-80px]" />

      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-white shadow-2xl rounded-3xl p-8 md:p-10 border border-gray-100 relative z-20 pb-24">
        <h1 className="text-3xl text-center font-semibold text-brand mb-2">
          Thông tin bổ sung
        </h1>

        <div className="flex justify-center mb-6 relative z-30">
          <div
            className="relative w-28 h-28 md:w-40 md:h-40 rounded-full bg-gray-50 overflow-hidden cursor-pointer"
            onClick={onAvatarClick}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand">
                Avatar
              </div>
            )}

            <button
              className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow"
              type="button"
            >
              <Camera className="w-5 h-5 text-brand" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFileChange}
            />
          </div>
        </div>

        {avatarError && (
          <p className="text-red-500 text-sm text-center mb-4">{avatarError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 relative z-30">
          <div className="col-span-full relative z-40">
            <AddressSelect
              value={{ provinceCode: form.city, communeCode: form.ward }}
              onChange={handleAddressChange}
              errors={errors}
              labels={{ province: "Tỉnh/Thành phố", ward: "Phường/Xã" }}
            />
          </div>

          <div className="relative z-30">
            <InputField
              name="street"
              value={form.street}
              onChange={updateField}
              placeholder="Số nhà, đường"
              error={errors.street}
            />
          </div>

          <div className="relative z-30">
            <InputField
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={updateField}
              placeholder="Số điện thoại"
              error={errors.phoneNumber}
            />
          </div>

          <div className="relative z-30">
            <InputField
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={updateField}
              placeholder="Ngày sinh"
              error={errors.dateOfBirth}
            />
          </div>

          <div className="relative z-30">
            <SelectField
              name="gender"
              label="Giới tính"
              value={form.gender ?? ""}
              onChange={updateField}
              options={[
                { label: "Nam", value: "MALE" },
                { label: "Nữ", value: "FEMALE" },
                { label: "Khác", value: "OTHER" },
                { label: "Không muốn tiết lộ", value: "PREFER_NOT_TO_SAY" },
              ]}
              placeholder="Chọn giới tính"
              error={errors.gender}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-[100] flex justify-between gap-3 md:left-6 md:right-6 md:bottom-6 pointer-events-none">
        <BrandButton
          fullWidth={false}
          className="px-5 py-2 md:px-6 pointer-events-auto"
          onClick={() => navigate("/")}
        >
          Quay lại
        </BrandButton>
        <BrandButton
          fullWidth={false}
          className="px-5 py-2 md:px-6 pointer-events-auto"
          disabled={loading || !userId}
          onClick={onSubmit}
        >
          {loading ? "Đang lưu..." : "Lưu và tiếp tục"}
        </BrandButton>
      </div>
    </div>
  );
};

export default AdditionalInformation;
