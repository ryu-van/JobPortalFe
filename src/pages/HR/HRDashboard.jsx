import React, { useState, useEffect } from "react";
import { BriefcaseBusiness, Clock3, FileText, AlertCircle } from "lucide-react";
import dashboardService from "../../services/dashboardService";

function StatCardSkeleton() {
  return (
    <div className="vw-card p-8 !rounded-2xl animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-2.5 w-24 bg-brand/10 rounded mb-4" />
          <div className="h-9 w-16 bg-brand/10 rounded" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand/5" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="vw-card p-8 !rounded-2xl hover:shadow-card group cursor-default">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/40 mb-3">
            {label}
          </p>
          <p className="text-4xl font-bold text-brand">{value ?? 0}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load dashboard statistics. Please try again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-left pb-8 border-b border-ivory-deep">
        <p className="vw-section-label">HR workspace</p>
        <h1 className="text-4xl font-bold tracking-tight text-brand">Dashboard</h1>
        <p className="text-brand/60 mt-4 max-w-2xl font-medium">
          Overview of your company's recruitment activity.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          !error && (
            <>
              <StatCard
                label="Active Job Postings"
                value={stats?.activeJobPostings}
                icon={BriefcaseBusiness}
              />
              <StatCard
                label="Pending Applications"
                value={stats?.pendingApplications}
                icon={Clock3}
              />
              <StatCard
                label="Total Resumes Received"
                value={stats?.totalResumesReceived}
                icon={FileText}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
