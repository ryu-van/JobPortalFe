import React, { useEffect, useState } from "react";
import { X, FileUser, Loader2, CheckCircle } from "lucide-react";
import resumeService from "@/services/resumeService";
import applicationService from "@/services/applicationService";

export default function ApplyModal({ open, onClose, onSuccess, jobId, userId }) {
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cvMode, setCvMode] = useState("existing");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoadingResumes(true);
    setError(null);
    setSelectedResumeId(null);
    setCoverLetter("");
    setCvMode("existing");
    setUploadedFile(null);

    resumeService
      .getAll({ userId })
      .then((res) => {
        const data = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        const primary = list.find((r) => r.isPrimary) ?? list[0] ?? null;
        if (primary) setSelectedResumeId(primary.id);
      })
      .catch(() => setError("Không thể tải danh sách CV."))
      .finally(() => setLoadingResumes(false));
  }, [open, userId]);

  if (!open) return null;

  async function handleSubmit() {
    let resumeIdToUse = selectedResumeId;

    if (cvMode === "upload") {
      if (!uploadedFile) {
        setError("Vui lòng chọn file CV để tải lên.");
        return;
      }
      try {
        const resumeResponse = await resumeService.uploadResume(uploadedFile);
        resumeIdToUse = resumeResponse.data?.id || resumeResponse.data?.data?.id;
      } catch {
        setError("Không thể tải lên CV. Vui lòng thử lại.");
        return;
      }
    } else if (!selectedResumeId) {
      setError("Vui lòng chọn một CV để ứng tuyển.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await applicationService.applyJob(jobId, {
        jobId,
        resumeId: resumeIdToUse,
        coverLetter: coverLetter.trim() || null,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.friendlyMessage ||
          err?.friendlyMessage ||
          err?.message ||
          "Ứng tuyển thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white border border-ivory-deep rounded-2xl shadow-soft flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-deep flex-shrink-0">
          <div>
            <p className="vw-section-label mb-1">Ứng tuyển</p>
            <h2 className="text-lg font-bold text-heading">Nộp đơn ứng tuyển</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ivory-warm transition-colors text-gray-500"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-white">
          {error && (
            <div className="vw-callout-error text-sm py-3 px-4">{error}</div>
          )}

          <div className="vw-tab-shell inline-flex self-start bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCvMode("existing")}
              className={`px-5 py-2.5 text-sm font-bold transition-all ${
                cvMode === "existing" 
                  ? "bg-white text-brand shadow-sm rounded-lg" 
                  : "text-gray-500 hover:text-brand"
              }`}
            >
              CV đã có
            </button>
            <button
              type="button"
              onClick={() => setCvMode("upload")}
              className={`px-5 py-2.5 text-sm font-bold transition-all ${
                cvMode === "upload" 
                  ? "bg-white text-brand shadow-sm rounded-lg" 
                  : "text-gray-500 hover:text-brand"
              }`}
            >
              Upload CV
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-brand/40">
              Chọn CV <span className="text-rust">*</span>
            </label>

            {cvMode === "upload" ? (
              <label className="block p-8 border-dashed border-2 border-ivory-deep hover:border-brand/40 bg-ivory-soft/20 rounded-2xl cursor-pointer transition-all text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    const allowedTypes = [
                      "application/pdf",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ];
                    const allowedExt = /\.(pdf|doc|docx)$/i;
                    if (!allowedTypes.includes(file.type) && !allowedExt.test(file.name)) {
                      setError("Chỉ hỗ trợ file PDF, DOC, DOCX.");
                      e.target.value = "";
                      return;
                    }
                    if (file.size > 30 * 1024 * 1024) {
                      setError("File không được vượt quá 30MB.");
                      e.target.value = "";
                      return;
                    }
                    setError(null);
                    setUploadedFile(file);
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/5 flex items-center justify-center mb-2">
                    <FileUser className="w-6 h-6 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-heading">
                      {uploadedFile ? uploadedFile.name : "Chọn file CV để tải lên"}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand/30 mt-2">Hỗ trợ PDF, DOC, DOCX</p>
                  </div>
                </div>
              </label>
            ) : loadingResumes ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-sm text-gray-400 bg-ivory-soft/10 rounded-2xl border border-ivory-deep">
                <Loader2 className="w-6 h-6 animate-spin text-brand/20" />
                <p className="font-medium">Đang tải danh sách CV...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-10 text-center border-dashed border-2 border-ivory-deep rounded-2xl bg-ivory-soft/10">
                <FileUser className="w-10 h-10 text-brand/10 mx-auto mb-4" />
                <p className="text-sm text-brand/60 font-medium">Bạn chưa có CV nào. Hãy tạo CV trước khi ứng tuyển.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => setSelectedResumeId(resume.id)}
                    className={`group p-4 text-left flex items-center gap-4 transition-all border-2 rounded-2xl ${
                      selectedResumeId === resume.id
                        ? "border-brand bg-brand/[0.02]"
                        : "border-ivory-deep hover:border-brand/20 bg-white"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selectedResumeId === resume.id
                          ? "border-brand bg-brand"
                          : "border-ivory-deep group-hover:border-brand/40"
                      }`}
                    >
                      {selectedResumeId === resume.id && (
                        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      )}
                    </div>
                    <FileUser className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      selectedResumeId === resume.id ? "text-brand" : "text-brand/20"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold transition-colors ${
                        selectedResumeId === resume.id ? "text-brand" : "text-heading"
                      }`}>
                        {resume.title}
                      </p>
                    </div>
                    {selectedResumeId === resume.id && (
                      <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 animate-in zoom-in duration-300" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-brand/40">
              Thư xin việc <span className="lowercase font-normal opacity-60">(không bắt buộc)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => {
                if (e.target.value.length <= 2000) setCoverLetter(e.target.value);
              }}
              rows={4}
              placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này..."
              className="w-full bg-ivory-soft/20 border border-ivory-deep focus:border-brand focus:ring-1 focus:ring-brand rounded-2xl p-4 text-sm outline-none transition-all resize-none placeholder:text-brand/20 font-medium"
            />
            <p className="text-[10px] text-brand/30 text-right">{coverLetter.length}/2000</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ivory-deep flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-bold text-brand hover:bg-ivory-warm rounded-full transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingResumes || (cvMode === "existing" && !selectedResumeId)}
            className="vw-btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand/10"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Nộp đơn ứng tuyển"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
