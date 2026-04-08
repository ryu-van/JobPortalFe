/* eslint-disable no-unused-vars */
import React from "react";
import BrandButton from "../../components/form/BrandButton";
import InputField from "../../components/form/InputField";
import Background from "../../assets/JobFindingBackground.jpg";
import { BriefcaseBusiness, Handshake } from "lucide-react";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../store/userSlice";
import { motion } from "framer-motion";

const Login = () => {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const errs = { email: "", password: "" };
    if (!email) {
      errs.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Email không hợp lệ";
    }
    if (!password) {
      errs.password = "Mật khẩu không được để trống";
    }
    setFieldErrors(errs);
    return !errs.email && !errs.password;
  };

  const onSubmit = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    dispatch(loginStart());
    try {
      const data = await authService.login(email, password);
      dispatch(loginSuccess({ user: data.user, token: data.accessToken }));
      const next = authService.determinePostLoginRoute(data);
      navigate(next.path, { replace: true, state: next.state });
    } catch (err) {
      dispatch(loginFailure());
      setError(err.friendlyMessage || err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-[#f5f7fa] flex items-center justify-center"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2 bg-white shadow-[0_25px_80px_-45px_rgba(0,0,0,0.45)] overflow-hidden">
        {/* LEFT */}
        <div className="relative h-full bg-[#0f172a] hidden lg:block">
          <img
            src={Background}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f172a]/70" />

          <div className="absolute top-6 left-6 text-white font-semibold text-lg flex items-center gap-2">
            <BriefcaseBusiness size={32} strokeWidth={2} />
            <span>RyuCareer</span>
          </div>

          <button className="absolute top-6 right-6 text-white/80 hover:text-white text-sm">
            Quay lại trang chủ
          </button>

          <div className="absolute bottom-10 left-8 right-8 text-white space-y-4">
            <h2 className="text-3xl font-semibold leading-snug">
              Tìm việc nhanh chóng. Ứng tuyển dễ dàng.
            </h2>
            <p className="text-sm text-white/80 max-w-md">
              Khám phá hàng nghìn cơ hội việc làm phù hợp, kết nối nhà tuyển
              dụng và bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center p-6 lg:p-10 bg-white">
          <div className="absolute top-4 right-4 text-[#27592D] font-bold text-sm sm:text-base flex items-center gap-2">
            <Handshake size={32} strokeWidth={2} />
            <span>RyuCareer</span>
          </div>

          <div className="w-full max-w-lg space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[#111827]">
                Chào mừng bạn trở lại!
              </h1>
              <p className="text-sm text-[#4b5563]">
                Đăng nhập để khám phá và ứng tuyển công việc phù hợp.
              </p>
            </div>

            <div className="space-y-4">
              <InputField label="Email" name="email" value={email} onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" })); }} placeholder="Nhập email của bạn" error={fieldErrors.email} />
              <InputField label="Mật khẩu" name="password" value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" })); }} type="password" placeholder="Nhập mật khẩu" togglePassword error={fieldErrors.password} />
            </div>

            <div className="flex items-center justify-between text-sm text-[#4b5563]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#27592D]" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button className="text-[#27592D] font-semibold hover:text-[#1f4022]">
                Quên mật khẩu?
              </button>
            </div>

            <BrandButton className="w-full py-3 text-base" onClick={onSubmit} disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </BrandButton>

            {error && (
              <div className="text-center text-sm text-[#AA423A]">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#9ca3af]">
                hoặc đăng nhập bằng
              </span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            <button className="w-full py-3 border border-[#e5e7eb] rounded-full font-semibold text-[#111827] hover:bg-[#f9fafb] transition-colors flex items-center justify-center gap-2">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Đăng nhập với Google
            </button>

            <p className="text-sm text-center text-[#4b5563]">
              Bạn chưa có tài khoản?{" "}
              <button className="text-[#27592D] font-semibold hover:text-[#1f4022]" onClick={() => navigate("/register")}>
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
