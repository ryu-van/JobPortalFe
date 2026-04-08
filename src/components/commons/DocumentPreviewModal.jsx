import React from "react";
import { X, File, FileText, Plus } from "lucide-react";

const DocumentPreviewModal = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const isPDF = file.name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <File className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 truncate max-w-md">{file.name}</h4>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {isPDF ? "Định dạng PDF" : "Tài liệu văn bản"} • {file.size}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col items-center justify-center relative">
          {isPDF ? (
            <iframe
              src={file.url}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center p-12 max-w-md">
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center text-blue-500 mx-auto mb-8">
                <FileText className="w-12 h-12" />
              </div>
              <h5 className="text-xl font-bold text-gray-900 mb-3 italic">
                Xem trước không khả dụng
              </h5>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Trình duyệt không hỗ trợ xem trực tiếp các định dạng văn bản (DOC/DOCX). 
                Vui lòng tải xuống để xem nội dung đầy đủ.
              </p>
              <a 
                href={file.url} 
                download={file.name}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#27592D] text-white rounded-2xl font-bold shadow-lg shadow-[#27592D]/20 hover:bg-[#1f4523] transition-all hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 rotate-45" />
                Tải xuống tài liệu
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
