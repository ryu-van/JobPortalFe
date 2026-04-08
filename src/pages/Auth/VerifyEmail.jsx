import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MailCheck, HeartHandshake, Briefcase, Building2 } from "lucide-react";
import BrandButton from "../../components/form/BrandButton";
import authService from "../../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/userSlice";
import { roles } from "../../constants/roles";
const VerifyEmail = () => {
  const length = 6;
  const [values, setValues] = useState(Array(length).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const refs = useRef([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((s) => s.user.token);
  const currentUser = useSelector((s) => s.user.userInfo);
  const { state } = useLocation();
  const email = state?.email || localStorage.getItem("pending_verify_email") || "";
  const [emailState, setEmailState] = useState(email);
  const skipCooldown = (state?.skipCooldown ?? (localStorage.getItem("verify_skip_cooldown") === "1")) || false;
  const [cooldown, setCooldown] = useState(skipCooldown ? 0 : 60);

  const code = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (emailState) return;
    const fromStore = localStorage.getItem("pending_verify_email") || "";
    if (fromStore) {
      setEmailState(fromStore);
      return;
    }
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        const em = u?.email || u?.u?.email || "";
        if (em) setEmailState(em);
      } catch { /* empty */ }
    })();
  }, [emailState]);

  const handleChange = (idx, v) => {
    const val = v.replace(/\D/g, "").slice(0, 1);
    const next = [...values];
    next[idx] = val;
    setValues(next);
    if (val && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (values[idx]) {
        const next = [...values];
        next[idx] = "";
        setValues(next);
        return;
      }
      if (idx > 0) refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
    if (e.key === "Enter" && code.length === length) submit();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const arr = Array(length)
      .fill("")
      .map((_, i) => text[i] || "");
    setValues(arr);
    const filled = Math.min(text.length, length);
    refs.current[Math.max(0, filled - 1)]?.focus();
  };

  const resolveNextRoute = (user) => {
    if (!user) return "/";
    const roleId = user.roleId ?? user.roleID ?? user.role_id ?? null;
    const hasPhone = !!user.phoneNumber;
    const companyId = user.companyId ?? user.companyID ?? user.company_id ?? user.CompanyId ?? null;
    const hasCompany = !!companyId;

    if (!hasPhone) return "/additional-information";

    if (roleId === roles.ADMIN) {
      return "/admin/dashboard";
    }

    if (roleId === roles.COMPANY_ADMIN) {
      return "/company-admin/dashboard";
    }

    if (roleId === roles.HR) {
      if (!hasCompany) return "/create-company";
      return "/hr/dashboard";
    }

    return "/";
  };

  const submit = async () => {
    if (code.length !== length) return;
    setSubmitting(true);
    setError("");
    try {
      await authService.verifyEmail(code);
      localStorage.removeItem("pending_verify_email");
      localStorage.removeItem("verify_skip_cooldown");
      let updatedUser = null;
      try {
        updatedUser = await authService.getCurrentUser();
      } catch {
        updatedUser = currentUser;
      }
      if (updatedUser && token) {
        dispatch(loginSuccess({ user: updatedUser, token }));
      }
      const next = resolveNextRoute(updatedUser || currentUser);
      navigate(next);
    } catch (err) {
      setError(err.response?.data?.message || "Xác minh thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      let targetEmail = emailState;
      if (!targetEmail) {
        targetEmail = localStorage.getItem("pending_verify_email") || "";
      }
      if (!targetEmail) {
        try {
          const u = await authService.getCurrentUser();
          targetEmail = u?.email || u?.u?.email || "";
        } catch {
          // Silently ignore getCurrentUser failure
        }
      }
      if (!targetEmail) {
        setError("Không tìm thấy email để gửi lại mã");
        return;
      }
      await authService.resendVerification(targetEmail);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Gửi lại mã thất bại");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F9F9F4] via-[#F0EDE5] to-[#E7E4DC] relative overflow-hidden font-sans">
      <header className="w-full bg-[#27592D] text-white">
        <div className="flex items-center justify-between px-4 sm:px-10 py-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6" />
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Ryu Career</h2>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <a href="#" className="text-white/80 hover:text-white flex items-center gap-1 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Tìm việc</span>
            </a>
            <a href="#" className="text-white/80 hover:text-white flex items-center gap-1 text-sm">
              <Building2 className="w-4 h-4" />
              <span>Nhà tuyển dụng</span>
            </a>
            <a href="#" className="flex items-center justify-center rounded-lg h-10 px-4 bg-white/20 text-white text-sm font-bold hover:bg-white/30">Đăng ký</a>
          </div>
        </div>
      </header>

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

      <div className="flex-1 w-full flex items-center justify-center p-6">
        <motion.div
          className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/30"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6 text-[#27592D]">
            <MailCheck className="w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-semibold">Xác minh Email</h1>
          </div>
          <p className="text-center text-[#27592D] mb-6">Nhập mã 6 số đã gửi tới email của bạn.</p>

          <div className="grid grid-cols-6 gap-3 sm:gap-4 mb-6" onPaste={handlePaste}>
            {Array.from({ length }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-semibold border rounded-xl bg-white/60 focus:ring-2 focus:border-transparent outline-none transition border-[#C7A59D]/40 focus:ring-[#27592D] text-[#27592D]"
                value={values[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <BrandButton type="button" disabled={submitting || code.length !== length} onClick={submit}>
            Xác minh
          </BrandButton>

          {error && (
            <div className="text-center text-sm text-[#AA423A] mt-3">{error}</div>
          )}

          <div className="text-center text-sm text-[#27592D] mt-6">
            {cooldown > 0 ? (
              <span>Gửi lại mã sau {cooldown}s</span>
            ) : (
              <button className="font-semibold text-[#27592D] hover:opacity-80" onClick={resend}>Gửi lại mã</button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
