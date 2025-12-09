import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  FileText,
  Lightbulb,
  Target,
  User,
  Send,
  Star,
  HeartHandshake,
  Building2,
  Laptop,
  Rocket,
  Coffee,
  Globe,
  Layers,
  PenTool,
  GraduationCap,
} from "lucide-react";
import InputField from "../components/common/InputField";
import SelectField from "../components/common/SelectField";
import BrandButton from "../components/common/BrandButton";
import authService from "../services/authService";
const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    user: {
      name: "",
      email: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
    hr: {
      name: "",
      email: "",
      gender: "",
      password: "",
      confirmPassword: "",
      inviteCode: "",
    },
  });
  const [fieldErrors, setFieldErrors] = useState({
    user: {
      name: "",
      email: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
    hr: {
      name: "",
      email: "",
      gender: "",
      password: "",
      confirmPassword: "",
      inviteCode: "",
    },
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMousePosition({ x, y });
  };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [name]: value },
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [type]: { ...prev[type], [name]: "" },
    }));
  };

  const handleSubmit = async () => {
    const data = role === "user" ? formData.user : formData.hr;
    setError("");
    const errors = {};
    if (role === "user") {
      if (!data.name) errors.name = "Vui lòng nhập họ và tên.";
      if (!data.email) errors.email = "Vui lòng nhập email.";
      if (!data.gender) errors.gender = "Vui lòng chọn giới tính.";
      if (!data.password) errors.password = "Vui lòng nhập mật khẩu.";
      if (!data.confirmPassword)
        errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      if (
        data.password &&
        data.confirmPassword &&
        data.password !== data.confirmPassword
      ) {
        errors.confirmPassword = "Mật khẩu nhập lại không khớp.";
      }
    }
    if (role === "hr") {
      if (!data.name) errors.name = "Vui lòng nhập họ và tên.";
      if (!data.email) errors.email = "Vui lòng nhập email.";
      if (!data.gender) errors.gender = "Vui lòng chọn giới tính.";
      if (!data.password) errors.password = "Vui lòng nhập mật khẩu.";
      if (!data.confirmPassword)
        errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      if (
        data.password &&
        data.confirmPassword &&
        data.password !== data.confirmPassword
      ) {
        errors.confirmPassword = "Mật khẩu nhập lại không khớp.";
      }
      if (!data.inviteCode) errors.inviteCode = "Vui lòng nhập mã mời.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [role]: { ...prev[role], ...errors },
      }));
      return;
    }

    const genderBool =
      data.gender === "male" ? true : data.gender === "female" ? false : null;
    const payload =
      role === "user"
        ? {
            fullName: data.name,
            email: data.email,
            password: data.password,
            gender: genderBool,
            roleId: 1,
            codeInvitation: "",
          }
        : {
            fullName: data.name,
            email: data.email,
            password: data.password,
            gender: genderBool,
            roleId: 3,
            codeInvitation: data.inviteCode,
          };

    try {
      await authService.register(payload);
      alert(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản."
      );
      navigate("/login");
    } catch (err) {
      const friendly = err.friendlyMessage || "Đã có lỗi xảy ra.";
      const raw = err.rawMessage?.toLowerCase() || "";

      setError(friendly);

      const update = {};

      if (raw.includes("email")) update.email = friendly;
      if (raw.includes("invite") || raw.includes("code"))
        update.inviteCode = friendly;
      if (raw.includes("password")) update.password = friendly;

      setFieldErrors((prev) => ({
        ...prev,
        [role]: { ...prev[role], ...update },
      }));
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  };

  // 🌟 Icon trang trí
  const floatingIcons = [
    {
      icon: <Briefcase size={60} color="#27592D" />,
      x: -260,
      y: -140,
      delay: 0,
    },
    { icon: <FileText size={55} color="#AA423A" />, x: 240, y: 100, delay: 1 },
    {
      icon: <Lightbulb size={65} color="#FFC801" />,
      x: -180,
      y: 180,
      delay: 2,
    },
    { icon: <Target size={58} color="#27592D" />, x: 180, y: -160, delay: 1.5 },
    { icon: <User size={60} color="#27592D" />, x: 0, y: -60, delay: 0.7 },
    { icon: <Send size={50} color="#AA423A" />, x: -220, y: 40, delay: 2.5 },
    { icon: <Star size={50} color="#FFC801" />, x: 280, y: -100, delay: 3 },
    {
      icon: <HeartHandshake size={58} color="#27592D" />,
      x: 100,
      y: 200,
      delay: 3.5,
    },
    {
      icon: <Building2 size={60} color="#27592D" />,
      x: -200,
      y: 140,
      delay: 4,
    },
    { icon: <Laptop size={58} color="#AA423A" />, x: 200, y: 160, delay: 4.5 },
    {
      icon: <Rocket size={62} color="#FFC801" />,
      x: -300,
      y: -100,
      delay: 2.8,
    },
    { icon: <Globe size={58} color="#27592D" />, x: 300, y: 60, delay: 1.2 },
    {
      icon: <GraduationCap size={58} color="#AA423A" />,
      x: -280,
      y: 80,
      delay: 3.4,
    },
    { icon: <PenTool size={55} color="#27592D" />, x: 260, y: -40, delay: 2 },
    { icon: <Coffee size={50} color="#AA423A" />, x: -240, y: 200, delay: 1.7 },
    { icon: <Layers size={55} color="#27592D" />, x: 120, y: -200, delay: 4 },
    { icon: <Star size={58} color="#FFC801" />, x: -180, y: -220, delay: 1.3 },
    {
      icon: <Lightbulb size={64} color="#FFC801" />,
      x: 150,
      y: 220,
      delay: 2.6,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F9F4] via-[#F0EDE5] to-[#E7E4DC] p-6 relative overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
    >
      {/* Blur background circles */}
      <motion.div
        className="absolute w-96 h-96 bg-[#C7A59D]/30 rounded-full blur-3xl top-[-100px] left-[-100px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-[#27592D]/20 rounded-full blur-3xl bottom-[-120px] right-[-80px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🌿 Main layout */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-24 z-10 px-4">
        {/* Left: Logo + Icons */}
        <div className="relative hidden lg:flex flex-[1.2] items-center justify-center h-[480px] mr-12">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              className="absolute opacity-90"
              animate={{
                y: [item.y, item.y - 25, item.y],
                x: [item.x, item.x + 12, item.x],
                rotate: [0, 10, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 12 + Math.random() * 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
              style={{
                transform: `translate(
                  calc(${item.x}px + ${mousePosition.x * 25}px),
                  calc(${item.y}px + ${mousePosition.y * 25}px)
                )`,
              }}
            >
              {item.icon}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="font-extrabold text-4xl md:text-6xl tracking-wide text-[#27592D] drop-shadow-md select-none"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${
                mousePosition.y * 10
              }px)`,
            }}
          >
            <span className="text-[#27592D]">Ryu</span>{" "}
            <span className="text-[#AA423A]">Career</span>
          </motion.div>
        </div>

        {/* Mobile brand header */}
        <div className="md:hidden w-full flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-wide text-[#27592D]">
              Ryu
            </span>
            <span className="font-extrabold text-3xl tracking-wide text-[#AA423A]">
              Career
            </span>
          </div>
        </div>

        <motion.div
          className="w-full max-w-md bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-white/30"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ring-2 ${
                    role === "user"
                      ? "bg-[#27592D]/10 ring-[#27592D] text-[#27592D]"
                      : "bg-transparent ring-transparent text-[#27592D] hover:text-[#27592D] hover:bg-[#27592D]/5"
                  }`}
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setRole("hr")}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ring-2 ${
                    role === "hr"
                      ? "bg-[#27592D]/10 ring-[#27592D] text-[#27592D]"
                      : "bg-transparent ring-transparent text-[#27592D] hover:text-[#27592D] hover:bg-[#27592D]/5"
                  }`}
                >
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="mb-8 text-center">
                <h2
                  className={`text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 ${
                    role === "user" ? "text-[#27592D]" : "text-[#27592D]"
                  }`}
                >
                  {role === "user"
                    ? "Đăng ký ứng viên"
                    : "Đăng ký nhà tuyển dụng"}
                </h2>
                <p className="text-[#27592D] text-sm sm:text-base">
                  {role === "user"
                    ? "Tạo tài khoản để tìm công việc mơ ước của bạn."
                    : "Tạo tài khoản để tuyển dụng nhân tài nhanh chóng."}
                </p>
              </div>

              <div className="space-y-5">
                {role === "user" ? (
                  <>
                    <InputField
                      name="name"
                      type="text"
                      value={formData.user.name}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Họ và tên"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      error={fieldErrors.user.name}
                    />
                    <InputField
                      name="email"
                      type="email"
                      value={formData.user.email}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Email"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      error={fieldErrors.user.email}
                    />

                    <SelectField
                      name="gender"
                      value={formData.user.gender}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Chọn giới tính"
                      theme="primary"
                      options={[
                        { value: "male", label: "Nam ♂" },
                        { value: "female", label: "Nữ ♀" },
                        { value: "other", label: "Khác ⚧" },
                      ]}
                      error={fieldErrors.user.gender}
                    />

                    <InputField
                      name="password"
                      type="password"
                      value={formData.user.password}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Mật khẩu"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      togglePassword
                      error={fieldErrors.user.password}
                    />
                    <InputField
                      name="confirmPassword"
                      type="password"
                      value={formData.user.confirmPassword}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Nhập lại mật khẩu"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      togglePassword
                      error={fieldErrors.user.confirmPassword}
                    />
                  </>
                ) : (
                  <>
                    <InputField
                      name="name"
                      type="text"
                      value={formData.hr.name}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Họ và tên"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      error={fieldErrors.hr.name}
                    />
                    <InputField
                      name="email"
                      type="email"
                      value={formData.hr.email}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Email"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      error={fieldErrors.hr.email}
                    />
                    <SelectField
                      name="gender"
                      value={formData.hr.gender}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Chọn giới tính"
                      theme="primary"
                      options={[
                        { value: "male", label: "Nam ♂" },
                        { value: "female", label: "Nữ ♀" },
                        { value: "other", label: "Khác ⚧" },
                      ]}
                      error={fieldErrors.hr.gender}
                    />
                    <InputField
                      name="password"
                      type="password"
                      value={formData.hr.password}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Mật khẩu"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      togglePassword
                      error={fieldErrors.hr.password}
                    />
                    <InputField
                      name="confirmPassword"
                      type="password"
                      value={formData.hr.confirmPassword}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Nhập lại mật khẩu"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      togglePassword
                      error={fieldErrors.hr.confirmPassword}
                    />
                    <InputField
                      name="inviteCode"
                      type="text"
                      value={formData.hr.inviteCode}
                      onChange={(e) => handleInputChange(e, "hr")}
                      placeholder="Mã mời"
                      className="border-[#C7A59D]/40 rounded-xl px-5 py-3 bg-white/60 focus:ring-[#27592D]"
                      error={fieldErrors.hr.inviteCode}
                    />
                    <div className="flex items-center gap-2 text-sm text-[#27592D]">
                      <span>Chưa có công ty?</span>
                      <button
                        type="button"
                        onClick={() => navigate("/company/create")}
                        className="inline-flex items-center gap-1 font-semibold text-[#27592D] hover:opacity-80"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Tạo mới</span>
                      </button>
                    </div>
                  </>
                )}

                <BrandButton onClick={handleSubmit}>Đăng ký ngay</BrandButton>
                {error && (
                  <div className="mt-2 text-center text-[#AA423A] text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 text-center text-[#27592D]">
                Đã có tài khoản?{" "}
                <button
                  className={`font-semibold ${
                    role === "user"
                      ? "text-[#27592D] hover:text-[#27592D]"
                      : "text-[#27592D] hover:text-[#27592D]"
                  }`}
                >
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
