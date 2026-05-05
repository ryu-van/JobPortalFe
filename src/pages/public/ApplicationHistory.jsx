import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Calendar,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import ClientLayout from "../../components/candidate/ClientLayout";
import CandidateAccountSidebar from "../../components/candidate/CandidateAccountSidebar";
import applicationService from "../../services/applicationService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xét duyệt",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
    icon: Clock,
  },
  reviewing: {
    label: "Đang xem xét",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
    icon: Eye,
  },
  accepted: {
    label: "Đã chấp nhận",
    color: "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Không phù hợp",
    color: "text-red-700 bg-red-50 border-red-200",
    dot: "bg-red-400",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status ?? "Không rõ",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] ?? 0, value[4] ?? 0, value[5] ?? 0)
    : new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] ?? 0, value[4] ?? 0, value[5] ?? 0)
    : new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Status History Timeline ──────────────────────────────────────────────────

function StatusTimeline({ applicationId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await applicationService.getApplicationDetail(applicationId);
        const data = res?.data?.data ?? res?.data ?? res;
        if (mounted) setHistory(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setError("Không thể tải lịch sử trạng thái.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-brand/40">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang tải lịch sử...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rust flex items-center gap-1.5 py-2">
        <AlertCircle className="w-4 h-4" /> {error}
      </p>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-brand/40 italic py-2">Chưa có lịch sử thay đổi trạng thái.</p>
    );
  }

  return (
    <ol className="relative border-l border-ivory-deep ml-3 space-y-0">
      {history.map((entry, idx) => {
        const cfg = STATUS_CONFIG[entry.newStatus?.toLowerCase()];
        return (
          <li key={idx} className="mb-6 ml-5">
            <span
              className={`absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white ${cfg?.dot ?? "bg-gray-300"}`}
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={entry.newStatus} />
                {entry.oldStatus && (
                  <span className="text-[10px] text-brand/30 font-medium">
                    từ <span className="font-bold">{STATUS_CONFIG[entry.oldStatus?.toLowerCase()]?.label ?? entry.oldStatus}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand/40 mt-1">
                {formatDateTime(entry.changedAt)}
                {entry.changedBy && (
                  <span className="ml-2 font-medium text-brand/50">bởi {entry.changedBy}</span>
                )}
              </p>
              {entry.notes && (
                <p className="mt-1 text-xs text-brand/70 bg-ivory-soft/40 border border-ivory-deep rounded-lg px-3 py-2 italic">
                  "{entry.notes}"
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ application }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="vw-card overflow-hidden transition-all">
      {/* Main row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-heading truncate">{application.jobTitle ?? "—"}</h3>
            {application.jobId && (
              <a
                href={`/jobs/${application.jobId}`}
                className="text-[10px] font-bold uppercase tracking-widest text-brand/40 hover:text-brand underline underline-offset-2 transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                Xem tin
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {application.companyName && (
              <span className="text-[11px] text-brand/60 font-semibold">
                {application.companyName}
              </span>
            )}
            {application.resumeTitle && (
              <span className="flex items-center gap-1 text-[11px] text-brand/50 font-medium">
                <FileText className="w-3 h-3" />
                {application.resumeTitle}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-brand/40">
              <Calendar className="w-3 h-3" />
              Nộp ngày {formatDate(application.appliedAt)}
            </span>
          </div>
        </div>

        {/* Status + expand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={application.status} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-brand/40 hover:text-brand transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="hidden sm:inline">Thu gọn</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="hidden sm:inline">Chi tiết</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-ivory-deep px-5 py-5 bg-ivory-soft/20 space-y-5">
          {/* Cover letter */}
          {application.coverLetter && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand/30 mb-2">
                Thư xin việc
              </p>
              <p className="text-sm text-brand/70 leading-relaxed whitespace-pre-wrap bg-white border border-ivory-deep rounded-xl px-4 py-3">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Status history */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand/30 mb-4">
              Lịch sử trạng thái
            </p>
            <StatusTimeline applicationId={application.id} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="vw-card px-5 py-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-ivory-deep rounded w-2/3" />
          <div className="h-3 bg-ivory-deep rounded w-1/3" />
        </div>
        <div className="h-6 w-24 bg-ivory-deep rounded-full" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xét duyệt" },
  { value: "reviewing", label: "Đang xem xét" },
  { value: "accepted", label: "Đã chấp nhận" },
  { value: "rejected", label: "Không phù hợp" },
];

export default function ApplicationHistory() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadApplications = useCallback(async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await applicationService.getApplications();
      const data = res?.data?.data ?? res?.data ?? res;
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.friendlyMessage || "Không thể tải danh sách ứng tuyển.");
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Filter
  const filtered = applications.filter((app) => {
    const matchKeyword =
      !keyword ||
      (app.jobTitle ?? "").toLowerCase().includes(keyword.toLowerCase());
    const matchStatus =
      !statusFilter ||
      (app.status ?? "").toLowerCase() === statusFilter;
    return matchKeyword && matchStatus;
  });

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status?.toLowerCase() === "pending").length,
    reviewing: applications.filter((a) => a.status?.toLowerCase() === "reviewing").length,
    accepted: applications.filter((a) => a.status?.toLowerCase() === "accepted").length,
    rejected: applications.filter((a) => a.status?.toLowerCase() === "rejected").length,
  };

  if (!userInfo) {
    return (
      <ClientLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <CandidateAccountSidebar />

        <div className="space-y-6">
          {/* Header */}
          <div className="vw-card p-8 !rounded-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="vw-section-label">Tài khoản</p>
                <h1 className="text-2xl font-bold tracking-tight text-brand">
                  Lịch sử ứng tuyển
                </h1>
              </div>
            </div>
            <p className="text-sm text-brand/50 mt-1 ml-[52px]">
              Theo dõi tình trạng tất cả đơn ứng tuyển của bạn.
            </p>
          </div>

          {/* Stats */}
          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Tổng đơn", value: stats.total, color: "text-brand", bg: "bg-brand/5" },
                { label: "Chờ duyệt", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Đang xem", value: stats.reviewing, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Chấp nhận", value: stats.accepted, color: "text-green-600", bg: "bg-green-50" },
              ].map((s) => (
                <div key={s.label} className={`vw-card p-4 !rounded-sm ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand/40 mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="vw-card p-4 !rounded-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand/30" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên công việc..."
                  className="vw-input !pl-9 text-sm"
                />
              </div>
              {/* Status filter */}
              <div className="relative sm:w-52">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand/30 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="vw-input !pl-9 text-sm appearance-none"
                >
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {error && (
            <div className="vw-card p-6 !rounded-sm flex items-center gap-3 text-rust">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="vw-card p-16 !rounded-sm flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-brand/20" />
              </div>
              <div>
                <p className="font-bold text-heading">
                  {applications.length === 0
                    ? "Bạn chưa ứng tuyển vị trí nào"
                    : "Không tìm thấy kết quả phù hợp"}
                </p>
                <p className="text-sm text-brand/40 mt-1">
                  {applications.length === 0
                    ? "Hãy khám phá các cơ hội việc làm và bắt đầu ứng tuyển ngay."
                    : "Thử thay đổi từ khóa hoặc bộ lọc trạng thái."}
                </p>
              </div>
              {applications.length === 0 && (
                <a
                  href="/jobs"
                  className="vw-btn-primary mt-2 inline-flex items-center gap-2 text-sm"
                >
                  Tìm việc làm ngay
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
              <p className="text-[11px] text-brand/30 text-center font-medium pt-2">
                Hiển thị {filtered.length} / {applications.length} đơn ứng tuyển
              </p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
