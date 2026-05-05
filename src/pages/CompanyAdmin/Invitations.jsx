import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Mail, AlertCircle, PlusCircle, Link2, Clock, Hash } from "lucide-react";
import companyAdminService from "../../services/companyAdminService";
import { useToast } from "../../components/commons/ToastContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="h-3 flex-1 bg-brand/10 rounded" />
      <div className="h-3 w-40 bg-brand/5 rounded" />
      <div className="h-3 w-36 bg-brand/5 rounded" />
      <div className="h-3 w-16 bg-brand/5 rounded" />
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
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    </div>
  );
}

// ─── Invitation Row ───────────────────────────────────────────────────────────

function InvitationRow({ invitation }) {
  const expired = isExpired(invitation.expiresAt);
  const maxUses = invitation.maxUses ?? "∞";
  const usedCount = invitation.usedCount ?? 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <code className="text-xs font-mono bg-brand/5 text-brand px-2 py-1 rounded truncate max-w-[200px]">
          {invitation.code || "—"}
        </code>
      </div>
      <p className="text-sm text-brand/60 w-48 truncate shrink-0">
        {invitation.email || <span className="italic text-brand/30">Any</span>}
      </p>
      <div className="flex items-center gap-1.5 shrink-0 w-44">
        <Clock className="w-3.5 h-3.5 text-brand/30 shrink-0" />
        <span className={`text-xs font-medium ${expired ? "text-red-500" : "text-brand/60"}`}>
          {formatDate(invitation.expiresAt)}
          {expired && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
              Expired
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 w-20">
        <Hash className="w-3.5 h-3.5 text-brand/30 shrink-0" />
        <span className="text-xs font-medium text-brand/60">{usedCount} / {maxUses}</span>
      </div>
    </div>
  );
}

// ─── Create Invitation Form ───────────────────────────────────────────────────

function CreateInvitationForm({ companyId, onCreated }) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [email, setEmail] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxUses, setMaxUses] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const hours = Number(expiresInHours);
    if (!hours || hours < 1 || hours > 8760) {
      setFormError("Expiry duration must be between 1 and 8760 hours.");
      return;
    }
    const uses = Number(maxUses);
    if (!uses || uses < 1) {
      setFormError("Max uses must be at least 1.");
      return;
    }
    setSubmitting(true);
    try {
      await companyAdminService.createInvitation(companyId, {
        email: email.trim() || null,
        expiresInHours: hours,
        maxUses: uses,
      });
      addToast("success", "Invitation created successfully.");
      setEmail("");
      setExpiresInHours(24);
      setMaxUses(1);
      setOpen(false);
      onCreated();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create invitation. Please try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vw-card p-8 !rounded-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/40">Create Invitation</p>
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); setFormError(null); }}
          className="inline-flex items-center gap-2 vw-btn-primary px-4 py-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {open ? "Cancel" : "New Invitation"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-brand/60 mb-1.5">
              Target Email <span className="font-normal text-brand/30">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@example.com"
              className="w-full rounded-lg border border-brand/10 bg-white px-4 py-2.5 text-sm text-brand placeholder:text-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-brand/60 mb-1.5">
                Expiry Duration (hours) <span className="font-normal text-brand/30">1 – 8760</span>
              </label>
              <input
                type="number"
                min={1}
                max={8760}
                required
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full rounded-lg border border-brand/10 bg-white px-4 py-2.5 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand/60 mb-1.5">
                Max Uses <span className="font-normal text-brand/30">(default 1)</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full rounded-lg border border-brand/10 bg-white px-4 py-2.5 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 vw-btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              {submitting ? "Creating…" : "Create Invitation"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Active Invitations Count Card ───────────────────────────────────────────

function ActiveCountCard({ count }) {
  return (
    <div className="vw-card p-8 !rounded-2xl hover:shadow-card group cursor-default">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/40 mb-3">Active Invitations</p>
          <p className="text-4xl font-bold text-brand">{count}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
          <Mail className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Invitations() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const companyId = userInfo?.companyId;

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeCount = invitations.filter((inv) => !isExpired(inv.expiresAt)).length;

  const fetchInvitations = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await companyAdminService.getInvitations(companyId);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setInvitations(list);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      <section className="text-left pb-8 border-b border-ivory-deep">
        <p className="vw-section-label">Company Admin workspace</p>
        <h1 className="text-4xl font-bold tracking-tight text-brand">Invitations</h1>
        <p className="text-brand/60 mt-4 max-w-2xl font-medium">
          Create and manage invitation links to onboard new HR staff securely.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActiveCountCard count={activeCount} />
          </div>

          <CreateInvitationForm companyId={companyId} onCreated={fetchInvitations} />

          <div className="vw-card p-8 !rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-3 border-b border-brand/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 flex-1">Code</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-48">Target Email</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-44">Expires At</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 w-20">Uses</p>
            </div>

            {invitations.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-brand/40">
                <Mail className="w-10 h-10" />
                <p className="text-sm font-medium">No invitations found. Create one above.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand/5">
                {invitations.map((inv, idx) => (
                  <InvitationRow key={inv.id ?? inv.code ?? idx} invitation={inv} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
