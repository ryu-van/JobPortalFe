import { Briefcase, Building2, HeartHandshake } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-[#27592D] text-white">
      <div className="flex items-center justify-between px-4 sm:px-10 py-3">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6" />
          <h2 className="text-white text-lg font-bold">Ryu Career</h2>
        </div>

        <div className="flex items-center gap-6">
          <a className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
            <Briefcase className="w-4 h-4" /> Tìm việc
          </a>

          <a className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
            <Building2 className="w-4 h-4" /> Nhà tuyển dụng
          </a>
        </div>
      </div>
    </header>
  );
}
