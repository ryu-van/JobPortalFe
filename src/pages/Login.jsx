import React, { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

import {
  Briefcase,
  FileText,
  Lightbulb,
  Target,
  User as UserIcon,
  Building2,
  Star,
  Send,
  Laptop,
  Rocket,
  Globe,
  GraduationCap,
  PenTool,
  Coffee,
  Layers,
} from "lucide-react";

import BrandButton from "../components/common/BrandButton";
import InputField from "../components/common/InputField";
import FloatingIcon from "../components/common/FloatingIcon";
import Header from "../components/common/Header";

import authService from "../services/authService";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../store/userSlice";

const ICON_DISTANCE_SCALE = 1.2;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  const handleMouseMove = (e) => {
    setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  };

  const icons = useMemo(() => {
    const base = [
      {
        icon: <Briefcase size={60} color="#27592D" />,
        x: -320,
        y: -200,
        delay: 0,
        depth: 0.3,
      },
      {
        icon: <FileText size={55} color="#AA423A" />,
        x: 330,
        y: 140,
        delay: 0.8,
        depth: 1,
      },
      {
        icon: <Lightbulb size={65} color="#FFC801" />,
        x: -260,
        y: 240,
        delay: 1.6,
        depth: 0.6,
      },
      {
        icon: <Target size={58} color="#27592D" />,
        x: 260,
        y: -220,
        delay: 1.2,
        depth: 0.9,
      },
      {
        icon: <UserIcon size={60} color="#27592D" />,
        x: -320,
        y: -50,
        delay: 0.6,
        depth: 0.4,
      },
      {
        icon: <Building2 size={58} color="#27592D" />,
        x: 160,
        y: 280,
        delay: 2.0,
        depth: 0.7,
      },
      {
        icon: <Laptop size={58} color="#AA423A" />,
        x: 300,
        y: 200,
        delay: 2.4,
        depth: 1.2,
      },
      {
        icon: <Rocket size={62} color="#FFC801" />,
        x: -340,
        y: -140,
        delay: 1.8,
        depth: 1.3,
      },
    ];

    return base.map((i) => ({
      ...i,
      x: i.x * ICON_DISTANCE_SCALE,
      y: i.y * ICON_DISTANCE_SCALE,
    }));
  }, []);
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    dispatch(loginStart());

    try {
      const res = await authService.login(data.email, data.password);
      dispatch(loginSuccess({ user: res.user, token: res.accessToken }));
      if (remember) {
        localStorage.setItem("access_token", res.accessToken);
      } else {
        sessionStorage.setItem("access_token", res.accessToken);
      }

      const route = authService.determinePostLoginRoute(res);
      navigate(route.path, { state: route.state });
    } catch (err) {
      setError(err.friendlyMessage || "Đã có lỗi xảy ra");
      dispatch(loginFailure());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F9F9F4] via-[#F0EDE5] to-[#E7E4DC]"
      onMouseMove={handleMouseMove}
    >
      <Header />

      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-10 pointer-events-none">
          {icons.map((ic, idx) => (
            <FloatingIcon
              key={idx}
              icon={ic.icon}
              x={ic.x}
              y={ic.y}
              depth={ic.depth}
              delay={ic.delay}
            />
          ))}
        </div>

        {/* LOGIN FORM */}
        <div
          className="relative z-30 bg-white/75 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/30 w-full max-w-md sm:max-w-lg md:max-w-xl p-6 md:p-12"
        >
          <h1 className="text-3xl sm:text-4xl text-center font-semibold mb-3 text-[#27592D]">
            Đăng nhập
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="email"
              control={control}
              rules={{ required: "Vui lòng nhập email" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  placeholder="Email"
                  error={errors.email?.message}
                />
              )}
            />

          <Controller
            name="password"
            control={control}
            rules={{ required: "Vui lòng nhập mật khẩu" }}
            render={({ field }) => (
              <InputField
                {...field}
                type="password"
                placeholder="Mật khẩu"
                error={errors.password?.message}
                togglePassword
              />
            )}
          />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#27592D]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <span className="text-sm text-[#27592D]">
                Chưa có tài khoản? <Link to="/register" className="underline font-medium">Đăng ký</Link>
              </span>
            </div>
            <BrandButton type="submit" disabled={submitting} className="w-full">
              {submitting ? "Đang xử lý..." : "Đăng nhập"}
            </BrandButton>

          {error && (
            <div className="text-center text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
