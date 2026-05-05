import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import hrService from "../../services/hrService";

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
  { value: "withdrawn", label: "Withdrawn" },
];

const STATUS_STYLES = {
  pending: "vw-badge vw-badge-warning",
  reviewed: "vw-badge vw-badge-active",
  accepted: "vw-badge vw-badge-success",
  rejected: "vw-badge vw-badge-danger",
  hired: "vw-badge vw-badge-success",
  withdrawn: "vw-badge vw-badge-tag",
};

const STATUS_ICONS = {
  pending: Clock3,
  reviewed: Eye,
  accepted: CheckCircle2,
  rejected: XCircle,
  hired: CheckCircle2,
  withdrawn: XCircle,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-lg bg-brand/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-brand/10 rounded" />
        <div className="h-2.5 w-28 bg-brand/5 rounded" />
      </div>
      <div className="h-5 w-20 bg-brand/10 rounded-full" />
      <div className="h-3 w-24 bg-brand/5 rounded" />
      <div className="w-5 h-5 bg-brand/5 rounded" />
    </div>
  );
}

// ─── Application List Item ────────────────────────────────────────────────────

function ApplicationRow({ application, isSelected, onClick }) {
  const StatusIcon = STATUS_ICONS[application.status] ?? Clock3;
  const displayName = application.candidateName || application.resumeTitle || "Applicant";

  return (
    <button
      type="button"
      onClick={() => onClick(application)}
      className={`w-full px-5 py-4 flex items-center gap-4 text-left transition-colors hover:bg-ivory-soft ${
        isSelected ? "bg-ivory-soft border-l-2 border-brand" : ""
      }`}
    >
      <div className="w-11 h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-brand">{getInitials(displayName)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[color:var(--text)] truncate">{displayName}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="vw-badge vw-badge-tag text-[11px]">
            <Briefcase className="w-3 h-3" />
            {application.jobTitle || "—"}
          </span>
        </div>
      </div>
      <span className={`${STATUS_STYLES[application.status] ?? "vw-badge vw-badge-tag"} flex-shrink-0`}>
        <StatusIcon className="w-3 h-3" />
        {application.status ?? "—"}
      </span>
      <span className="text-[11px] text-olive flex-shrink-0 hidden sm:block">
        {formatDate(application.appliedAt)}
      </span>
      <ChevronRight className="w-4 h-4 text-brand/30 flex-shrink-0" />
    </button>
  );
}

// ─── Candidate Profile Panel ──────────────────────────────────────────────────

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand/40 mb-1">{label}</p>
      <p className="text-sm font-medium text-brand">{value || "—"}</p>
    </div>
  );
}

function CandidateProfile({ application, onBack, onStatusUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(application.status ?? "pending");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setSelectedStatus(application.status ?? "pending");
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [application.id, application.status]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (selectedStatus === application.status) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await hrService.updateApplicationStatus(application.id, selectedStatus);
      setSubmitSuccess(true);
      onStatusUpdated(application.id, selectedStatus);
    } catch (err) {
      setSubmitError(err?.message || "Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = application.candidateName || application.resumeTitle || "Applicant";
  const StatusIcon = STATUS_ICONS[application.status] ?? Clock3;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-brand/60 hover:text-brand transition-colors lg:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      <div className="vw-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-brand">{getInitials(displayName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-brand truncate">{displayName}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="vw-badge vw-badge-tag">
                <Briefcase className="w-3 h-3" />
                {application.jobTitle || "—"}
              </span>
              <span className={STATUS_STYLES[application.status] ?? "vw-badge vw-badge-tag"}>
                <StatusIcon className="w-3 h-3" />
                {application.status ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="vw-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-brand/40">Candidate Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {application.candidateName && <InfoField label="Full Name" value={application.candidateName} />}
          {application.candidateEmail && <InfoField label="Email" value={application.candidateEmail} />}
          {application.candidatePhone && <InfoField label="Phone" value={application.candidatePhone} />}
          <InfoField label="Applied On" value={formatDate(application.appliedAt)} />
          <InfoField label="Company" value={application.companyName || "—"} />
        </div>
      </div>

      <div className="vw-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-brand/40">Submitted Resume</h3>
        {application.resumeTitle ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-ivory-soft border border-ivory-deep">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand truncate">{application.resumeTitle}</p>
              <p className="text-[11px] text-olive mt-0.5">Resume document</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-brand/40 italic">No resume attached.</p>
        )}
        {application.coverLetter && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand/40">Cover Letter</p>
            <p className="text-sm text-brand/70 leading-relaxed whitespace-pre-wrap rounded-xl bg-ivory-soft border border-ivory-deep p-4">
              {application.coverLetter}
            </p>
          </div>
        )}
      </div>

      <div className="vw-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-brand/40">Update Status</h3>
        {submitSuccess && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Status updated successfully.</span>
          </div>
        )}
        {submitError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        <form onSubmit={handleStatusUpdate} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="status-select" className="block text-xs font-semibold text-brand/60 mb-1.5">
              New Status
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setSubmitSuccess(false); }}
              className="w-full rounded-xl border border-ivory-deep bg-white px-3 py-2.5 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              disabled={submitting}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || selectedStatus === application.status}
            className="vw-btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Saving…</>
            ) : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HRCandidates() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const companyId = userInfo?.companyId;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hrService.getApplications(companyId);
      const list = Array.isArray(data) ? data : [];
      setApplications(list);
      if (selected) {
        const updated = list.find((a) => a.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch (err) {
      setError(err?.message || "Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusUpdated = useCallback((applicationId, newStatus) => {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)));
    setSelected((prev) => prev?.id === applicationId ? { ...prev, status: newStatus } : prev);
  }, []);

  return (
    <div className="space-y-8">
      <section className="text-left pb-8 border-b border-ivory-deep">
        <p className="vw-section-label">HR workspace</p>
        <h1 className="text-4xl font-bold tracking-tight text-brand">Candidates</h1>
        <p className="text-brand/60 mt-4 max-w-2xl font-medium">
          Review applications submitted to your company's job postings and manage candidate statuses.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={fetchApplications} className="text-red-700 underline text-xs hover:no-underline">Retry</button>
        </div>
      )}

      <div className="flex gap-6 items-start">
        <div className={`vw-card overflow-hidden flex-shrink-0 ${selected ? "hidden lg:block lg:w-[420px]" : "w-full"}`}>
          <div className="px-5 py-4 border-b border-ivory-deep flex items-center justify-between">
            <div>
              <p className="vw-section-label mb-1">Pipeline</p>
              <h2 className="text-base font-bold text-brand">
                Applications
                {!loading && <span className="ml-2 text-sm font-normal text-brand/40">({applications.length})</span>}
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand/40 hover:text-brand hover:bg-ivory-soft transition-colors disabled:opacity-40"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="divide-y divide-ivory-deep">
            {loading ? (
              <><RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton /></>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-brand/30" />
                </div>
                <p className="text-sm font-semibold text-brand/60">No applications yet</p>
                <p className="text-xs text-brand/40 mt-1">Applications submitted to your company's jobs will appear here.</p>
              </div>
            ) : (
              applications.map((app) => (
                <ApplicationRow key={app.id} application={app} isSelected={selected?.id === app.id} onClick={setSelected} />
              ))
            )}
          </div>
        </div>

        {selected && (
          <div className="flex-1 min-w-0">
            <CandidateProfile application={selected} onBack={() => setSelected(null)} onStatusUpdated={handleStatusUpdated} />
          </div>
        )}

        {!selected && !loading && applications.length > 0 && (
          <div className="hidden lg:flex flex-1 items-center justify-center py-24">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-brand/30" />
              </div>
              <p className="text-sm font-semibold text-brand/60">Select an application</p>
              <p className="text-xs text-brand/40 mt-1">Click a row on the left to view the candidate profile.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
