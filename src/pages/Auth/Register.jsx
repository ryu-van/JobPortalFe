import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { User, Building } from "lucide-react";
import authService from "../../services/authService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/userSlice";
import BackgroundRegister from "../../assets/Background-Register.jpg";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import InputField from "../../components/form/InputField";
import { roles } from "../../constants/roles";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { control, handleSubmit, watch } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("candidate"); 

  const password = watch("password");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const registerData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roleId: userType === "candidate" ? roles.CANDIDATE : roles.HR,
      };

      if (userType === "recruiter" && data.codeInvitation) {
        registerData.codeInvitation = data.codeInvitation;
      }

      const res = await authService.register(registerData);
      localStorage.setItem('token', res.accessToken);
      dispatch(loginSuccess({ user: res.user, token: res.accessToken }));

      const route = authService.determinePostLoginRoute(res);
      navigate(route.path, { state: route.state });
    } catch (err) {
      setError(err.friendlyMessage || "Đã có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="flex min-h-screen w-full bg-white overflow-hidden"
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Left Side - Image Background with Blur Overlay */}
      <div
        className="hidden lg:flex w-5/12 relative flex-col justify-center items-end overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundRegister})` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        {/* Navigation Tabs */}
        <div className="relative z-10 flex flex-col items-end gap-6 w-full">
          <button
            onClick={() => setUserType("candidate")}
            aria-pressed={userType === "candidate"}
            className={`transition-all ${
              userType === "candidate"
                ? "bg-white text-[#15803d] py-5 pl-12 pr-16 rounded-l-full shadow-xl relative -mr-[1px]"
                : "pr-12 text-green-100 hover:text-white"
            }`}
          >
            <span className={userType === "candidate" ? "text-2xl font-bold tracking-tight flex items-center gap-2" : "text-xl font-medium tracking-wide flex items-center gap-2"}>
              <User className={userType === "candidate" ? "w-5 h-5" : "w-4 h-4"} />
              Ứng viên
            </span>
          </button>
          <button
            onClick={() => setUserType("recruiter")}
            aria-pressed={userType === "recruiter"}
            className={`transition-all ${
              userType === "recruiter"
                ? "bg-white text-[#15803d] py-5 pl-12 pr-16 rounded-l-full shadow-xl relative -mr-[1px]"
                : "pr-12 text-green-100 hover:text-white"
            }`}
          >
            <span className={userType === "recruiter" ? "text-2xl font-bold tracking-tight flex items-center gap-2" : "text-xl font-medium tracking-wide flex items-center gap-2"}>
              <Building className={userType === "recruiter" ? "w-5 h-5" : "w-4 h-4"} />
              Tuyển dụng
            </span>
          </button>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col relative h-screen overflow-y-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between lg:justify-end px-6 py-6 lg:absolute lg:top-0 lg:right-0 lg:p-8 z-20">
          <div className="flex items-center gap-3 text-gray-900">
            <div className="w-8 h-8 text-[#15803d]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">JobPortal</h2>
          </div>
          <Link to="/login" className="lg:hidden text-[#15803d] font-semibold text-sm">
            Login instead
          </Link>
        </div>

        {/* Mobile User Type Selector */}
        <div className="lg:hidden flex gap-3 px-6 mb-6">
          <button
            onClick={() => setUserType("candidate")}
            aria-pressed={userType === "candidate"}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              userType === "candidate"
                ? "bg-[#15803d] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Ứng viên
            </span>
          </button>
          <button
            onClick={() => setUserType("recruiter")}
            aria-pressed={userType === "recruiter"}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              userType === "recruiter"
                ? "bg-[#15803d] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4" />
              Tuyển dụng
            </span>
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[520px]">
            <div className="space-y-8 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
              <div className="text-center lg:text-left space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                  {userType === "candidate" ? "Tạo tài khoản ứng viên" : "Tạo tài khoản nhà tuyển dụng"}
                </h1>
                <p className="text-gray-600">
                  {userType === "candidate"
                    ? "Tham gia với chúng tôi để tìm công việc mơ ước của bạn."
                    : "Đăng ký để tìm kiếm ứng viên tiềm năng cho công ty."}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Full Name */}
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: "Vui lòng nhập họ tên",
                  minLength: { value: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                  maxLength: { value: 100, message: "Họ tên không được vượt quá 100 ký tự" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputField
                    label="Họ và tên"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Họ và tên"
                    error={error?.message}
                  />
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ"
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputField
                    label="Email"
                    name={field.name}
                    type="email"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Địa chỉ Email"
                    error={error?.message}
                  />
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Vui lòng nhập mật khẩu",
                  minLength: {
                    value: 8,
                    message: "Mật khẩu phải có ít nhất 8 ký tự"
                  },
                  validate: (value) => {
                    if (!/[A-Z]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
                    if (!/[a-z]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ thường";
                    if (!/[0-9]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ số";
                    return true;
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputField
                    label="Mật khẩu"
                    name={field.name}
                    type="password"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Mật khẩu"
                    togglePassword
                    error={error?.message}
                  />
                )}
              />

              {/* Confirm Password */}
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: value => value === password || "Mật khẩu không khớp"
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputField
                    label="Xác nhận mật khẩu"
                    name={field.name}
                    type="password"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Xác nhận mật khẩu"
                    togglePassword
                    error={error?.message}
                  />
                )}
              />

              {/* Company Name (only for recruiters) */}
              {userType === "recruiter" && (
                <Controller
                  name="codeInvitation"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-1">
                      <InputField
                        label="Mã mời công ty"
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Mã mời công ty"
                        error={error?.message}
                      />
                      <p className="text-xs text-gray-500">
                        Nếu chưa có công ty, hãy để trống Mã mời.
                      </p>
                    </div>
                  )}
                />
              )}

              {/* Terms Checkbox */}
              <Controller
                name="agreedToTerms"
                control={control}
                rules={{ required: "Bạn phải đồng ý với các điều khoản" }}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <div className="flex items-center gap-3 pt-1 pl-1">
                      <div className="flex h-5 items-center">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#15803d] focus:ring-[#15803d] cursor-pointer"
                        />
                      </div>
                      <div className="text-sm leading-tight">
                        <label className="font-medium text-gray-500" htmlFor="terms">
                          Tôi đồng ý với{" "}
                          <a className="text-[#15803d] hover:text-[#14532d] hover:underline transition-colors" href="#">
                            Điều khoản dịch vụ
                          </a>
                          {" "}&amp;{" "}
                          <a className="text-[#15803d] hover:text-[#14532d] hover:underline transition-colors" href="#">
                            Chính sách bảo mật
                          </a>
                          .
                        </label>
                      </div>
                    </div>
                    {error && <p className="mt-1 text-sm text-red-600 pl-1">{error.message}</p>}
                  </div>
                )}
              />

              {/* Error Message */}
              {error && (
                <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full cursor-pointer rounded-lg h-12 bg-[#15803d] hover:bg-[#14532d] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#15803d]/30 text-white text-base font-bold tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#15803d] focus:ring-offset-2"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng ký"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  HOẶC
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Login */}
              <div className="flex justify-center">
                <button
                  type="button"
                  className="w-full max-w-sm flex items-center justify-center gap-2 rounded-xl h-12 border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]/40"
                  aria-label="Đăng ký với Google"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Google</span>
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-500 mt-4">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-[#15803d] font-semibold hover:text-[#14532d] hover:underline transition-colors">
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
