import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Users, AlertCircle, CheckCircle2, XCircle, UserCheck, UserX } from "lucide-react";
import companyAdminService from "../../services/companyAdminService";
import { useToast } from "../../components/commons/ToastContext";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function UserRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 py-5 animate-pulse">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-brand/10 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-36 bg-brand/10 rounded" />
          <div className="h-2.5 w-48 bg-brand/5 rounded" />
        </div>
      </div>
      <div className="hidden sm:block h-2.5 w-28 bg-brand/5 rounded" />
      <div className="h-6 w-20 bg-brand/5 rounded-full" />
      <div className="h-8 w-24 bg-brand/5 rounded-lg" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-10">
      <section className="pb-8 border-b border-ivory-deep">
        <div className="h-2.5 w-40 bg-brand/10 rounded mb-4 animate-pulse" />
        <div className="h-9 w-64 bg-brand/10 rounded animate-pulse" />
      </section>
      <div className="vw-card p-8 !rounded-2xl">
        <div className="h-3 w-32 bg-brand/10 rounded mb-6 animate-pulse" />
        <div className="divide-y divide-brand/5">
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ isActive }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
      <XCircle className="w-3.5 h-3.5" />
      Inactive
    </span>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ user, companyId, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const { addToast } = useToast();

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.fullName ||
    user.username ||
    "—";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleToggle = async () => {
    const nextActive = !user.isActive;
    setUpdating(true);
    try {
      await companyAdminService.updateHrUserStatus(companyId, user.id, nextActive);
      onStatusChange(user.id, nextActive);
      addToast(
        "success",
        `${fullName} has been ${nextActive ? "activated" : "deactivated"}.`
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user status. Please try again.";
      addToast("error", msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-5">
      {/* Avatar + name + email */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-brand/60">{initials || "?"}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand truncate">{fullName}</p>
          <p className="text-xs text-brand/50 truncate">{user.email || "—"}</p>
        </div>
      </div>

      {/* Phone number */}
      <p className="hidden sm:block text-sm text-brand/60 shrink-0 w-36 truncate">
        {user.phoneNumber || "—"}
      </p>

      {/* Status badge */}
      <div className="shrink-0">
        <StatusBadge isActive={user.isActive} />
      </div>

      {/* Activate / Deactivate button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={updating}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          user.isActive
            ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
            : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
        }`}
      >
        {updating ? (
          <span className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
        ) : user.isActive ? (
          <UserX className="w-3.5 h-3.5" />
        ) : (
          <UserCheck className="w-3.5 h-3.5" />
        )}
        {user.isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}

// ─── Active HR Count Card ─────────────────────────────────────────────────────

function ActiveCountCard({ count }) {
  return (
    <div className="vw-card p-8 !rounded-2xl hover:shadow-card group cursor-default">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/40 mb-3">
            Active HR Users
          </p>
          <p className="text-4xl font-bold text-brand">{count}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeamManagement() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const companyId = userInfo?.companyId;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeCount = users.filter((u) => u.isActive).length;

  useEffect(() => {
    if (!companyId) return;

    let mounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await companyAdminService.getHrUsers(companyId);
        if (mounted) {
          // Normalise: service may return the array directly or wrapped in .data
          const list = Array.isArray(data) ? data : data?.data ?? [];
          setUsers(list);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load team members. Please try again."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  // Update a single user's isActive flag in local state after a successful API call
  const handleStatusChange = useCallback((userId, nextActive) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: nextActive } : u))
    );
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <section className="text-left pb-8 border-b border-ivory-deep">
        <p className="vw-section-label">Company Admin workspace</p>
        <h1 className="text-4xl font-bold tracking-tight text-brand">Team Management</h1>
        <p className="text-brand/60 mt-4 max-w-2xl font-medium">
          Manage your HR team members — activate or deactivate their accounts as needed.
        </p>
      </section>

      {/* Inline error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <>
          {/* Active HR count card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActiveCountCard count={activeCount} />
          </div>

          {/* HR user list */}
          <div className="vw-card p-8 !rounded-2xl">
            {/* Column headers */}
            <div className="flex items-center gap-4 pb-3 border-b border-brand/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 flex-1">
                Team Member
              </p>
              <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-36">
                Phone
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-20">
                Status
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-24">
                Action
              </p>
            </div>

            {users.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-brand/40">
                <Users className="w-10 h-10" />
                <p className="text-sm font-medium">No HR users found for your company.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand/5">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    companyId={companyId}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
