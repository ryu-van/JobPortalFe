import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FileUser, Sparkles, Upload, Link2, Loader2, FileText, Trash2 } from "lucide-react";
import BrandButton from "../../components/form/BrandButton";
import ClientLayout from "../../components/candidate/ClientLayout";
import CandidateAccountSidebar from "../../components/candidate/CandidateAccountSidebar";
import AiResumeModal from "../../components/candidate/AiResumeModal";
import UploadResumeModal from "../../components/candidate/UploadResumeModal";
import resumeService from "../../services/resumeService";

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="vw-card overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-ivory-deep">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-brand" />}
        <h2 className="text-base font-bold text-heading">{title}</h2>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function MyResumes() {
  const userInfo = useSelector((s) => s.user.userInfo);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadResumes = useCallback(async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const response = await resumeService.getResumes(false);
      const data = response?.data?.data ?? response?.data;
      setResumes(Array.isArray(data) ? data : []);
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  if (!userInfo) {
    return (
      <ClientLayout>
        <div className="max-w-5xl mx-auto py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <CandidateAccountSidebar />

        <div className="space-y-6">
          <section className="text-left py-6 border-b border-ivory-deep">
            <p className="vw-section-label">Hồ sơ ứng viên</p>
            <h1 className="text-4xl font-bold tracking-tight text-brand">Quản lý CV.</h1>
            <p className="text-brand/60 mt-4 max-w-2xl font-medium">Tải lên hoặc tạo CV bằng AI để sẵn sàng ứng tuyển nhanh hơn.</p>
          </section>

          <div className="flex flex-col sm:flex-row gap-4">
             <BrandButton
               variant="ghost"
               onClick={() => setShowAiModal(true)}
               className="flex-1 !border-brand/20 hover:!border-brand !bg-white group"
             >
               <Sparkles className="w-5 h-5 text-brand group-hover:animate-pulse" />
               <span className="text-brand">AI Parse Resume</span>
             </BrandButton>
             <BrandButton
               onClick={() => setShowUploadModal(true)}
               className="flex-1"
             >
               <Upload className="w-5 h-5" />
               <span>Tải CV lên</span>
             </BrandButton>
           </div>

          {/* Upload Dropzone */}
          <div
            className="vw-card p-12 !rounded-sm border-dashed border-2 border-ivory-deep flex flex-col items-center text-center cursor-pointer hover:border-brand transition-all"
            onClick={() => setShowUploadModal(true)}
          >
            <div className="w-16 h-16 rounded-full bg-ivory-alt flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-brand/20" />
            </div>
            <h3 className="text-lg font-bold text-brand mb-2">Tải CV để tạo hồ sơ nhanh</h3>
            <p className="text-sm text-brand/40 font-medium">Hỗ trợ PDF, DOC, DOCX. Hệ thống sẽ lưu thành một mục CV mới.</p>
98|             <button className="mt-8 text-[10px] font-bold tracking-widest text-brand underline underline-offset-4">Chọn file</button>
          </div>

          {/* Resumes List */}
          <div className="vw-card !rounded-sm overflow-hidden">
            <div className="px-8 py-5 bg-ivory-alt border-b border-ivory-deep flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand">Danh sách CV</h2>
              </div>
              <span className="text-[10px] font-bold text-brand/40 uppercase tracking-widest">{resumes.length} bản ghi</span>
            </div>

            <div className="divide-y divide-ivory-deep">
              {resumes.length === 0 && !loading && (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-ivory-alt flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 opacity-10" />
                  </div>
                  <p className="text-brand/40 font-bold text-sm">Chưa có CV nào</p>
                  <p className="text-[10px] text-brand/20 font-bold uppercase tracking-widest mt-1">Nhấn "Tải CV lên" hoặc "AI Parse Resume" để bắt đầu.</p>
                </div>
              )}

              {loading && (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand/20 mx-auto" />
                </div>
              )}

              {resumes.map((resume) => (
                <div key={resume.id} className="p-8 flex items-center justify-between group hover:bg-ivory-alt transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-sm bg-brand/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-brand mb-1 truncate">{resume.title || "Untitled Resume"}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold text-brand/40 uppercase tracking-widest">
                          {new Date(resume.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                        {resume.isPrimary && (
                          <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded-full">CV chính</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {resume.fileUrl && (
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 text-brand/40 hover:text-brand transition-colors"
                      >
                        <Link2 className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AiResumeModal
        open={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSuccess={loadResumes}
        userId={userInfo?.id}
      />
      <UploadResumeModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={loadResumes}
      />
    </ClientLayout>
  );
}
