import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireRole({ roles, children, fallback = "/" }) {
  const user = useSelector((s) => s.user.userInfo);
  if (!user) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(roles) ? roles : [roles];
  console.log("RequireRole check:", { roleId: user.roleId, allowed });
  if (allowed.length && !allowed.includes(user.roleId)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
