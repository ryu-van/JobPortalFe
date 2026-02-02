import React from "react";
import { CircleCheckBig, CircleX, CircleAlert } from "lucide-react";
const VARIANT_CONFIG = {
  success: {
    icon: CircleCheckBig,
    iconClass: "text-green-600",
    titleClass: "text-green-700",
    buttonClass: "bg-green-600 hover:bg-green-700",
  },
  danger: {
    icon: CircleX,
    iconClass: "text-red-600",
    titleClass: "text-red-700",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: CircleAlert,
    iconClass: "text-yellow-600",
    titleClass: "text-yellow-700",
    buttonClass: "bg-yellow-500 hover:bg-yellow-600",
  },
};
export default function ConfirmModal({
  open,
  variant = "warning",
  title = "Xác nhận",
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-center mb-4">
          <Icon className={`w-12 h-12 ${config.iconClass}`} />
        </div>
        <h3
          className={`text-lg font-semibold text-center mb-2 ${config.titleClass}`}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 text-center mb-6">
            {description}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${config.buttonClass}`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
