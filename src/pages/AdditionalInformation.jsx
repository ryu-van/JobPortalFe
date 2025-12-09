import React, { useEffect, useState, useRef } from "react";
import InputField from "../components/common/InputField";
import BrandButton from "../components/common/BrandButton";
import { useToast } from "../components/common/ToastContext";
import authService from "../services/authService";
import userService from "../services/userService";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import addressService from "../services/addressService";
import SelectField from "../components/common/SelectField";

const AdditionalInformation = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    street: "",
    ward: "",
    city: "",
    avatarUrl: "",
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

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const p = await addressService.getProvinces();
        if (p.success && mounted) {
          const mapped = p.data.map(x => ({ 
            value: x.code || x.province_code, 
            label: x.name || x.province_name 
          }));
          setProvinces(mapped);
        }

        const u = await authService.getCurrentUser();
        
        if (!mounted || !u) {
          return;
        }
        const safeId = u.id ?? u.userId ?? u._id ?? u.uuid ?? null;
        if (!safeId) {
          addToast("error", "Không xác định được ID người dùng");
          return;
        }
        setUserId(safeId);
        setForm(prev => ({ ...prev, ...u }));

        if (u.city) {
          const w = await addressService.getWardsByProvince(u.city);
          
          if (w.success && mounted) {
            const mappedWards = w.data.map(x => ({ 
              value: x.code || x.ward_code, 
              label: x.name || x.ward_name 
            }));
            setWards(mappedWards);
          }
        }

        const initialAvatar = u.avatarUrl || u.avatar || "";
        if (initialAvatar && /^https?:\/\/.+/.test(initialAvatar)) {
          setAvatarPreview(initialAvatar);
        }

      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (mounted) {
          try {
            const p = await addressService.getProvinces();
            if (p.success) {
              const mapped = p.data.map(x => ({ 
                value: x.code || x.province_code, 
                label: x.name || x.province_name 
              }));
              setProvinces(mapped);
            }
          } catch (provinceError) {
            console.error("Failed to load provinces after user error:", provinceError);
          }
        }
      }
    })();

    return () => { mounted = false; };
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleCityChange = async (e) => {
    const provinceCode = e.target.value;
    setForm(prev => ({
      ...prev,
      city: provinceCode,
      ward: "",
    }));

    if (!provinceCode) {
      setWards([]);
      return;
    }

    try {
      const res = await addressService.getWardsByProvince(provinceCode);      
      if (res.success) {
        const mappedWards = res.data.map(w => ({ 
          value: w.code || w.ward_code, 
          label: w.name || w.ward_name 
        }));
        setWards(mappedWards);
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error("💥 Error loading wards:", error);
      setWards([]);
    }
  };

  // AVATAR
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
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onAvatarClick = () => fileInputRef.current?.click();

  const validate = () => {
    const next = {};
    if (!form.phoneNumber) next.phoneNumber = "Vui lòng nhập số điện thoại";
    if (form.phoneNumber && !/^\+?[0-9]{9,15}$/.test(form.phoneNumber))
      next.phoneNumber = "Số điện thoại không hợp lệ";

    if (!form.city) next.city = "Vui lòng chọn tỉnh/thành phố";
    if (!form.ward) next.ward = "Vui lòng chọn phường/xã";

    return next;
  };

  // SUBMIT
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

      const payload = {
        ...form,
        avatarUrl: uploadedUrl ?? form.avatarUrl,
      };

      await userService.updateUser(userId, payload);

      addToast("success", "Cập nhật thành công!");
      navigate("/");

    } catch (err) {
      addToast("error", err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#F9F9F4] via-[#F0EDE5] to-[#E7E4DC] px-4 py-8">

      <div className="pointer-events-none absolute w-96 h-96 bg-[#C7A59D]/30 rounded-full blur-3xl top-[-100px] left-[-100px]" />

      <div className="pointer-events-none absolute w-96 h-96 bg-[#27592D]/20 rounded-full blur-3xl bottom-[-120px] right-[-80px]" />

      <div className="w-full max-w-md md:max-w-3xl bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-6 md:p-8 border border-white/30 relative z-20 mb-20">
        <h1 className="text-3xl text-center font-semibold text-[#27592D] mb-2">
          Thông tin bổ sung
        </h1>

        <div className="flex justify-center mb-6 relative z-30">
          <div
            className="relative w-28 h-28 md:w-40 md:h-40 rounded-full bg-[#E7E4DC] overflow-hidden cursor-pointer"
            onClick={onAvatarClick}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#27592D]">
                Avatar
              </div>
            )}

            <button className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow" type="button">
              <Camera className="w-5 h-5 text-[#27592D]" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 relative z-30">
          <div className="relative z-40">
            <SelectField
              name="city"
              label="Tỉnh/Thành phố"
              value={form.city}
              onChange={handleCityChange}
              options={provinces}
              placeholder="Chọn tỉnh/thành phố"
              error={errors.city}
            />
          </div>

          <div className="relative z-40">
            <SelectField
              name="ward"
              label="Phường/Xã"
              value={form.ward}
              onChange={updateField}
              options={wards}
              placeholder="Chọn phường/xã"
              error={errors.ward}
              disabled={wards.length === 0}
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
        </div>

      </div>

      <div className="fixed bottom-4 left-4 right-4 z-[100] flex justify-between gap-3 md:left-6 md:right-6 md:bottom-6 pointer-events-none">
        <BrandButton fullWidth={false} className="px-5 py-2 md:px-6 pointer-events-auto" onClick={() => navigate(-1)}>
          Quay lại
        </BrandButton>
        <BrandButton fullWidth={false} className="px-5 py-2 md:px-6 pointer-events-auto" disabled={loading || !userId} onClick={onSubmit}>
          {loading ? "Đang lưu..." : "Lưu và tiếp tục"}
        </BrandButton>
      </div>
    </div>
  );
};

export default AdditionalInformation;
