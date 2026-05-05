import { UserRoundSearch, Briefcase, Clock3, CheckCircle2 } from "lucide-react";

const statusMap = {
  pending: "vw-badge-warning",
  reviewing: "vw-badge-active",
  accepted: "vw-badge-success",
  rejected: "vw-badge-danger",
};

const candidates = [
  { id: 1, name: "Nguyen Minh Anh", role: "Frontend Engineer", status: "reviewing", updated: "2 gio truoc", score: "89%" },
  { id: 2, name: "Tran Quoc Bao", role: "Product Designer", status: "pending", updated: "4 gio truoc", score: "76%" },
  { id: 3, name: "Le Hoang Nam", role: "Backend Developer", status: "accepted", updated: "Hom qua", score: "93%" },
  { id: 4, name: "Pham Thu Trang", role: "QA Engineer", status: "rejected", updated: "2 ngay truoc", score: "61%" },
];

export default function CandidatePage() {
  return (
    <div className="space-y-6">
      <section className="vw-card p-5 bg-ivory">
        <p className="vw-section-label mb-2">Recruiter workspace</p>
        <h1 className="vw-heading text-2xl">Danh sach ung vien</h1>
        <p className="text-sm text-gray-500 mt-1">Bo tri theo huong thong tin day, de quet nhanh va phu hop voi he thong badge/trang thai.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="vw-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Dang xem xet</p>
              <p className="text-2xl font-bold text-heading mt-2">42</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <UserRoundSearch className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>
        <div className="vw-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Phong van hom nay</p>
              <p className="text-2xl font-bold text-heading mt-2">8</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>
        <div className="vw-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Da duyet</p>
              <p className="text-2xl font-bold text-heading mt-2">15</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>
      </div>

      <section className="vw-card overflow-hidden">
        <div className="px-5 py-4 border-b border-ivory-deep flex items-center justify-between">
          <div>
            <p className="vw-section-label mb-1">Pipeline</p>
            <h2 className="text-base font-bold text-heading">Ung vien gan day</h2>
          </div>
          <div className="vw-tab-shell flex items-center gap-1">
            <button className="vw-tab-active px-3 py-1.5 text-xs">Tat ca</button>
            <button className="vw-tab-inactive px-3 py-1.5 text-xs">Noi bat</button>
          </div>
        </div>

        <div className="divide-y divide-ivory-deep">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-ivory-soft transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand">{candidate.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--text)] truncate">{candidate.name}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="vw-badge vw-badge-tag">
                      <Briefcase className="w-3 h-3" />
                      {candidate.role}
                    </span>
                    <span className={`vw-badge ${statusMap[candidate.status]}`}>{candidate.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-sec">{candidate.score}</p>
                <p className="text-[11px] text-olive mt-1">{candidate.updated}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
