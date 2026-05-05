import React, { useState, useRef } from "react";
import { X, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { extractTextFromPdf } from "../../utils/pdfExtractor";
import resumeService from "@/services/resumeService";
const INITIAL_FORM_DATA = {
  title: "",
  summary: "",
  educations: [],
  experiences: [],
  skills: [],
  isPrimary: false,
  isPublic: true,
};

export default function AiResumeModal({ open, onClose, onSuccess, userId }) {
  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const fileInputRef = useRef(null);

  if (!open) return null;

  function handleClose() {
    setStep("upload");
    setLoading(false);
    setError(null);
    setFormData(INITIAL_FORM_DATA);
    onClose();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Chỉ hỗ trợ định dạng PDF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (max 30MB)
    if (file.size > 30 * 1024 * 1024) {
      setError("File không được vượt quá 30MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setLoading(true);

    let extractedText;
    try {
      extractedText = await extractTextFromPdf(file);
    } catch (err) {
      setError(err.message || "Không thể trích xuất văn bản từ PDF.");
      setLoading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Advance to parsing step
    setStep("parsing");
    setLoading(false);

    try {
      const response = await resumeService.parseAiResume(extractedText);
      const rawData = response?.data?.data ?? response?.data;
      let parsed;
      try {
        parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      } catch {
        setError("Không thể đọc dữ liệu từ AI. Vui lòng thử lại.");
        setStep("upload");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFormData({
        title: parsed.title ?? "",
        summary: parsed.summary ?? "",
        educations: parsed.educations ?? [],
        experiences: parsed.experiences ?? [],
        skills: parsed.skills ?? [],
        isPrimary: false,
        isPublic: true,
      });
      setStep("form");
    } catch (err) {
      const msg =
        err?.response?.data?.friendlyMessage ||
        err?.message ||
        "Phân tích AI thất bại. Vui lòng thử lại.";
      setError(msg);
      setStep("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!formData.title.trim()) return;

    // Validate educations
    for (let i = 0; i < formData.educations.length; i++) {
      const edu = formData.educations[i];
      if (edu.gpa !== "" && edu.gpa != null) {
        const gpa = Number(edu.gpa);
        if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
          setError(`Học vấn #${i + 1}: GPA phải từ 0 đến 4.0.`);
          return;
        }
      }
      if (edu.startDate && edu.endDate && edu.endDate < edu.startDate) {
        setError(`Học vấn #${i + 1}: Ngày kết thúc phải sau ngày bắt đầu.`);
        return;
      }
    }

    // Validate experiences
    for (let i = 0; i < formData.experiences.length; i++) {
      const exp = formData.experiences[i];
      if (!exp.isCurrent && exp.startDate && exp.endDate && exp.endDate < exp.startDate) {
        setError(`Kinh nghiệm #${i + 1}: Ngày kết thúc phải sau ngày bắt đầu.`);
        return;
      }
    }

    // Validate skills
    for (let i = 0; i < formData.skills.length; i++) {
      const skill = formData.skills[i];
      if (skill.yearsOfExperience !== "" && skill.yearsOfExperience != null) {
        const years = Number(skill.yearsOfExperience);
        if (isNaN(years) || years < 0 || years > 70) {
          setError(`Kỹ năng #${i + 1}: Số năm kinh nghiệm phải từ 0 đến 70.`);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    const payload = {
      userId,
      title: formData.title,
      fileUrl: null,
      fileName: null,
      fileType: null,
      summary: formData.summary,
      isPrimary: formData.isPrimary,
      isPublic: formData.isPublic,
      educations: formData.educations,
      experiences: formData.experiences,
      skills: formData.skills.map(({ skillName, proficiencyLevel, yearsOfExperience }) => ({
        name: skillName,
        proficiencyLevel: proficiencyLevel || null,
        yearsOfExperience: yearsOfExperience !== "" && yearsOfExperience != null
          ? Number(yearsOfExperience)
          : null,
      })),
    };

    try {
      await resumeService.createResume(payload);
      onSuccess();
      handleClose();
    } catch (err) {
      const msg =
        err?.response?.data?.friendlyMessage ||
        err?.message ||
        "Lưu CV thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            Phân tích CV bằng AI
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {step === "upload" && (
            <UploadStep
              loading={loading}
              error={error}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              onClose={handleClose}
            />
          )}
          {step === "parsing" && <ParsingStep />}
          {step === "form" && (
            <FormStep
              formData={formData}
              setFormData={setFormData}
              error={error}
              loading={loading}
              onSave={handleSave}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UploadStep({ loading, error, fileInputRef, onFileChange, onClose }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[#000000]/10 flex items-center justify-center">
        <Upload className="w-6 h-6 text-[#000000]" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Tải lên file PDF</p>
        <p className="text-xs text-gray-500 mt-1">
          Chỉ hỗ trợ định dạng PDF
        </p>
      </div>

      {error && (
        <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang trích xuất văn bản...</span>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onFileChange}
          />
          <span className="inline-block px-5 py-2.5 rounded-xl bg-[#000000] text-white text-sm font-medium hover:bg-[#1f4022] transition-colors shadow-sm">
            Chọn file PDF
          </span>
        </label>
      )}

      <button
        onClick={onClose}
        disabled={loading}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
      >
        Hủy
      </button>
    </div>
  );
}

function ParsingStep() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
      <p className="text-sm text-gray-600">AI đang phân tích CV của bạn...</p>
    </div>
  );
}

// ─── FormStep ────────────────────────────────────────────────────────────────

function FormStep({ formData, setFormData, error, loading, onSave, onClose }) {
  const titleEmpty = !formData.title.trim();

  function setField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // ── Education helpers ──
  function addEducation() {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          gpa: "",
          description: "",
          displayOrder: prev.educations.length,
        },
      ],
    }));
  }

  function updateEducation(index, field, value) {
    setFormData((prev) => {
      const updated = [...prev.educations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educations: updated };
    });
  }

  function removeEducation(index) {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  }

  // ── Experience helpers ──
  function addExperience() {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          companyName: "",
          position: "",
          description: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          displayOrder: prev.experiences.length,
        },
      ],
    }));
  }

  function updateExperience(index, field, value) {
    setFormData((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  }

  function removeExperience(index) {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  }

  // ── Skill helpers ──
  function addSkill() {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { skillName: "", proficiencyLevel: "", yearsOfExperience: "" },
      ],
    }));
  }

  function updateSkill(index, field, value) {
    setFormData((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  }

  function removeSkill(index) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Ví dụ: Kỹ sư phần mềm"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/30 focus:border-[#000000]"
        />
        {titleEmpty && (
          <p className="text-xs text-red-500">Tiêu đề không được để trống.</p>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Tóm tắt
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => setField("summary", e.target.value)}
          rows={3}
          placeholder="Mô tả ngắn về bản thân..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#000000]/30 focus:border-[#000000]"
        />
      </div>

      {/* Educations */}
      <Section
        title="Học vấn"
        onAdd={addEducation}
        addLabel="Thêm học vấn"
      >
        {formData.educations.map((edu, i) => (
          <EntryCard key={i} onRemove={() => removeEducation(i)}>
            <FieldRow>
              <Field
                label="Trường"
                value={edu.institution}
                onChange={(v) => updateEducation(i, "institution", v)}
                placeholder="Tên trường"
              />
              <Field
                label="Bằng cấp"
                value={edu.degree}
                onChange={(v) => updateEducation(i, "degree", v)}
                placeholder="Cử nhân, Thạc sĩ..."
              />
            </FieldRow>
            <FieldRow>
              <Field
                label="Chuyên ngành"
                value={edu.fieldOfStudy}
                onChange={(v) => updateEducation(i, "fieldOfStudy", v)}
                placeholder="Công nghệ thông tin..."
              />
              <Field
                label="GPA"
                value={edu.gpa ?? ""}
                onChange={(v) => updateEducation(i, "gpa", v)}
                placeholder="3.5"
                type="number"
              />
            </FieldRow>
            <FieldRow>
              <Field
                label="Ngày bắt đầu"
                value={edu.startDate ?? ""}
                onChange={(v) => updateEducation(i, "startDate", v)}
                type="date"
              />
              <Field
                label="Ngày kết thúc"
                value={edu.endDate ?? ""}
                onChange={(v) => updateEducation(i, "endDate", v)}
                type="date"
              />
            </FieldRow>
            <Field
              label="Mô tả"
              value={edu.description ?? ""}
              onChange={(v) => updateEducation(i, "description", v)}
              placeholder="Mô tả thêm..."
              multiline
            />
          </EntryCard>
        ))}
      </Section>

      {/* Experiences */}
      <Section
        title="Kinh nghiệm làm việc"
        onAdd={addExperience}
        addLabel="Thêm kinh nghiệm"
      >
        {formData.experiences.map((exp, i) => (
          <EntryCard key={i} onRemove={() => removeExperience(i)}>
            <FieldRow>
              <Field
                label="Công ty"
                value={exp.companyName}
                onChange={(v) => updateExperience(i, "companyName", v)}
                placeholder="Tên công ty"
              />
              <Field
                label="Vị trí"
                value={exp.position}
                onChange={(v) => updateExperience(i, "position", v)}
                placeholder="Lập trình viên..."
              />
            </FieldRow>
            <FieldRow>
              <Field
                label="Ngày bắt đầu"
                value={exp.startDate ?? ""}
                onChange={(v) => updateExperience(i, "startDate", v)}
                type="date"
              />
              <Field
                label="Ngày kết thúc"
                value={exp.endDate ?? ""}
                onChange={(v) => updateExperience(i, "endDate", v)}
                type="date"
                disabled={exp.isCurrent}
              />
            </FieldRow>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exp.isCurrent ?? false}
                onChange={(e) => updateExperience(i, "isCurrent", e.target.checked)}
                className="accent-[#000000]"
              />
              Đang làm việc tại đây
            </label>
            <Field
              label="Mô tả"
              value={exp.description ?? ""}
              onChange={(v) => updateExperience(i, "description", v)}
              placeholder="Mô tả công việc..."
              multiline
            />
          </EntryCard>
        ))}
      </Section>

      {/* Skills */}
      <Section
        title="Kỹ năng"
        onAdd={addSkill}
        addLabel="Thêm kỹ năng"
      >
        {formData.skills.map((skill, i) => (
          <EntryCard key={i} onRemove={() => removeSkill(i)}>
            <FieldRow>
              <Field
                label="Tên kỹ năng"
                value={skill.skillName}
                onChange={(v) => updateSkill(i, "skillName", v)}
                placeholder="React, Java..."
              />
              <Field
                label="Trình độ"
                value={skill.proficiencyLevel ?? ""}
                onChange={(v) => updateSkill(i, "proficiencyLevel", v)}
                placeholder="Beginner / Intermediate / Advanced"
              />
            </FieldRow>
            <Field
              label="Số năm kinh nghiệm"
              value={skill.yearsOfExperience ?? ""}
              onChange={(v) => updateSkill(i, "yearsOfExperience", v)}
              placeholder="2"
              type="number"
            />
          </EntryCard>
        ))}
      </Section>

      {/* isPrimary toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setField("isPrimary", !formData.isPrimary)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            formData.isPrimary ? "bg-[#000000]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              formData.isPrimary ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-sm text-gray-700">Đặt làm CV chính</span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          onClick={onSave}
          disabled={titleEmpty || loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#000000] text-white text-sm font-medium hover:bg-[#1f4022] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Lưu CV
        </button>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ title, onAdd, addLabel, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-[#000000] hover:text-[#1f4022] font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function EntryCard({ children, onRemove }) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Xóa"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
}

function FieldRow({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value, onChange, placeholder, type = "text", multiline = false, disabled = false }) {
  const base =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/30 focus:border-[#000000] disabled:bg-gray-100 disabled:text-gray-400";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${base} resize-none`}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
          disabled={disabled}
        />
      )}
    </div>
  );
}
