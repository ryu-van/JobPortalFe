import React, { useState, useRef } from "react";
import { X, Upload, Loader2, CheckCircle } from "lucide-react";
import resumeApi from "../../api/resumeApi";

export default function UploadResumeModal({ open, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  function handleClose() {
    setUploading(false);
    setError(null);
    setDone(false);
    onClose();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = /\.(pdf|doc|docx)$/i;
    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      setError("Chỉ hỗ trợ file PDF, DOC, DOCX.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File không được vượt quá 30MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await resumeApi.uploadCv(file);
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err?.response?.data?.friendlyMessage ||
          err?.message ||
          "Tải file thất bại. Vui lòng thử lại."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Tải lên CV</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500" aria-label="Đóng">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-8 flex flex-col items-center gap-4">
          {done ? (
            <>
              <CheckCircle className="w-12 h-12 text-[#000000]" />
              <p className="text-sm font-medium text-gray-700">CV đã được tải lên thành công!</p>
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-[#000000] text-white text-sm font-medium hover:bg-[#1f4022] transition-colors"
              >
                Đóng
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-[#000000]/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#000000]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Chọn file CV để tải lên</p>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOC, DOCX (tối đa 30MB)</p>
              </div>

              {error && (
                <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              {uploading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải lên...</span>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="inline-block px-5 py-2.5 rounded-xl bg-[#000000] text-white text-sm font-medium hover:bg-[#1f4022] transition-colors shadow-sm">
                    Chọn file
                  </span>
                </label>
              )}

              <button onClick={handleClose} disabled={uploading} className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50">
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
