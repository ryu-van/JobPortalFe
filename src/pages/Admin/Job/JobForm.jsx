import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import jobService from "../../../services/jobService";
import companyService from "../../../services/companyService";
import categoryService from "../../../services/categoryService";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import TextArea from "../../../components/form/TextArea";
import BrandButton from "../../../components/form/BrandButton";
import AddressSelect from "../../../components/commons/AddressSelect";

export default function JobForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditPath = location.pathname.includes("/edit");
  const isEdit = !!id && isEditPath;
  const isView = !!id && !isEditPath;
  const basePath = location.pathname.startsWith("/admin") ? "/admin/jobs" : "/hr/jobs";

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [detailCompanyName, setDetailCompanyName] = useState("");
  const [detailCategoryNames, setDetailCategoryNames] = useState([]);
  const [detailSkillNames, setDetailSkillNames] = useState([]);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillSaving, setSkillSaving] = useState(false);
  const [skillModalError, setSkillModalError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      workType: "ONSITE",
      employmentType: "FULL_TIME",
      experienceLevel: "JUNIOR",
      isSalaryNegotiable: false,
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "VND",
      skillIds: [],
      numberOfPositions: 1,
      applicationDeadline: "",
      status: "DRAFT",
      companyId: "",
      categoryIds: [],
      city: "",
      provinceName: "",
      ward: "",
      communeName: "",
      street: "",
    }
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const response = await jobService.getJobDetail(id);
        const data = response?.data || response;
        if (!mounted || !data) return;
        const addr = data.addressRequest || data.address || {};
        const categoryIds = Array.isArray(data.categoryIds)
          ? data.categoryIds
          : Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
                .map((c) => {
                  if (typeof c === "number") return c;
                  if (typeof c === "string" && /^\d+$/.test(c.trim())) {
                    return Number(c.trim());
                  }
                  if (typeof c === "object") return c.id || c.categoryId;
                  return null;
                })
                .filter(Boolean)
            : [];
        const skillIds = Array.isArray(data.skillIds)
          ? data.skillIds
          : Array.isArray(data.skills) && data.skills.length > 0
            ? data.skills
                .map((s) =>
                  typeof s === "object" ? s.id || s.skillId : null
                )
                .filter(Boolean)
            : [];
        const categoryNames = Array.isArray(data.categories)
          ? data.categories
              .map((c) => (typeof c === "string" ? c : c?.name))
              .filter(Boolean)
          : [];
        const skillNames = Array.isArray(data.skills)
          ? data.skills
              .map((s) => (typeof s === "string" ? s : s?.name))
              .filter(Boolean)
          : [];
        const deadlineRaw = data.applicationDeadline || "";
        const deadlineValue = deadlineRaw
          ? String(deadlineRaw).slice(0, 16)
          : "";
        const normalizeEnum = (value = "") =>
          String(value).trim().replace(/-/g, "_").toUpperCase();

        setDetailCompanyName(data.companyName || "");
        setDetailCategoryNames(categoryNames);
        setDetailSkillNames(skillNames);
        reset({
          title: data.title || data.name || "",
          description: data.description || "",
          requirements: data.requirements || "",
          responsibilities: data.responsibilities || "",
          benefits: data.benefits || "",
          workType: normalizeEnum(data.workType || "ONSITE"),
          employmentType: normalizeEnum(data.employmentType || "FULL_TIME"),
          experienceLevel: normalizeEnum(data.experienceLevel || "JUNIOR"),
          isSalaryNegotiable: !!data.isSalaryNegotiable,
          salaryMin: data.salaryMin ?? "",
          salaryMax: data.salaryMax ?? "",
          salaryCurrency: normalizeEnum(data.salaryCurrency || "VND"),
          skillIds: skillIds.map((x) => String(x)),
          numberOfPositions: data.numberOfPositions ?? 1,
          applicationDeadline: deadlineValue,
          status: normalizeEnum(data.status || "DRAFT"),
          companyId: data.companyId ? String(data.companyId) : "",
          categoryIds: categoryIds.map((x) => String(x)),
          city: addr.provinceCode ? String(addr.provinceCode) : "",
          provinceName: addr.provinceName || "",
          ward: addr.communeCode ? String(addr.communeCode) : "",
          communeName: addr.communeName || "",
          street: addr.detailAddress || "",
        });
      } catch (e) {
        setApiError(e.friendlyMessage || "Không thể tải thông tin công việc");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, reset]);

  useEffect(() => {
    if (!companies.length && !categories.length && !skills.length) return;

    const currentCompanyId = getValues("companyId");
    if (!currentCompanyId && detailCompanyName && companies.length > 0) {
      const matchedCompany = companies.find(
        (c) => String(c.label).toLowerCase() === detailCompanyName.toLowerCase()
      );
      if (matchedCompany) {
        setValue("companyId", matchedCompany.value);
      }
    }

    const currentCategoryIds = getValues("categoryIds") || [];
    if (
      currentCategoryIds.length === 0 &&
      detailCategoryNames.length > 0 &&
      categories.length > 0
    ) {
      const matchedCategoryIds = categories
        .filter((c) =>
          detailCategoryNames.some(
            (name) => String(name).toLowerCase() === String(c.label).toLowerCase()
          )
        )
        .map((c) => c.value);
      if (matchedCategoryIds.length > 0) {
        setValue("categoryIds", matchedCategoryIds);
      }
    }

    const currentSkillIds = getValues("skillIds") || [];
    if (currentSkillIds.length === 0 && detailSkillNames.length > 0 && skills.length > 0) {
      const matchedSkillIds = skills
        .filter((s) =>
          detailSkillNames.some(
            (name) => String(name).toLowerCase() === String(s.label).toLowerCase()
          )
        )
        .map((s) => s.value);
      if (matchedSkillIds.length > 0) {
        setValue("skillIds", matchedSkillIds);
      }
    }
  }, [
    categories,
    companies,
    detailCategoryNames,
    detailCompanyName,
    detailSkillNames,
    getValues,
    setValue,
    skills,
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [companyRes, categoryRes, skillRes] = await Promise.all([
          companyService.getAllCompanies({ page: 0, size: 200 }),
          categoryService.getCategories({ keyword: undefined }),
          jobService.getSkills(),
        ]);
        if (!mounted) return;

        const companyList = Array.isArray(companyRes)
          ? companyRes
          : companyRes?.data || companyRes?.items || [];
        setCompanies(
          companyList.map((c) => ({
            value: String(c.id),
            label: c.companyName || c.name || `Company #${c.id}`,
          }))
        );

        const categoryList = Array.isArray(categoryRes)
          ? categoryRes
          : categoryRes?.data || categoryRes?.items || [];
        setCategories(
          categoryList.map((c) => ({
            value: String(c.id || c.categoryId),
            label: c.name || `Category #${c.id || c.categoryId}`,
          }))
        );

        const skillList = Array.isArray(skillRes)
          ? skillRes
          : skillRes?.data || skillRes?.items || [];
        setSkills(
          skillList.map((s) => ({
            value: String(s.id || s.skillId),
            label: s.name || `Skill #${s.id || s.skillId}`,
          }))
        );
      } catch {
        // no-op
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "CLOSED", label: "Closed" },
    { value: "ARCHIVED", label: "Archived" },
  ];
  const workTypeOptions = [
    { value: "ONSITE", label: "Onsite" },
    { value: "REMOTE", label: "Remote" },
    { value: "HYBRID", label: "Hybrid" },
  ];
  const employmentTypeOptions = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FREELANCE", label: "Freelance" },
  ];
  const experienceLevelOptions = [
    { value: "ENTRY", label: "Entry" },
    { value: "JUNIOR", label: "Junior" },
    { value: "MIDDLE", label: "Middle" },
    { value: "SENIOR", label: "Senior" },
    { value: "LEAD", label: "Lead" },
    { value: "MANAGER", label: "Manager" },
  ];
  const currencyOptions = [
    { value: "VND", label: "VND" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  const handleAddressChange = (val) => {
    setValue("city", val.provinceCode);
    setValue("provinceName", val.provinceName);
    setValue("ward", val.communeCode);
    setValue("communeName", val.communeName);
    clearErrors(["city", "ward"]);
  };

  const onSubmit = async (data) => {
    if (isView) return;
    if (!data.city) {
      setError("city", { type: "manual", message: "Vui lòng chọn tỉnh/thành phố" });
      return;
    }
    if (!data.ward) {
      setError("ward", { type: "manual", message: "Vui lòng chọn phường/xã" });
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const categoryIds = (data.categoryIds || [])
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x) && x > 0);

      const skillIds = (data.skillIds || [])
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x) && x > 0);

      const payload = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        benefits: data.benefits,
        addressRequest: {
          provinceCode: data.city || "",
          provinceName: data.provinceName || "",
          communeCode: data.ward || "",
          communeName: data.communeName || "",
          detailAddress: data.street || "",
        },
        workType: data.workType,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        isSalaryNegotiable: !!data.isSalaryNegotiable,
        salaryMin: data.salaryMin === "" ? null : Number(data.salaryMin),
        salaryMax: data.salaryMax === "" ? null : Number(data.salaryMax),
        salaryCurrency: data.salaryCurrency,
        skillIds,
        numberOfPositions: Number(data.numberOfPositions || 1),
        applicationDeadline: data.applicationDeadline
          ? `${data.applicationDeadline}:00`
          : null,
        status: data.status,
        companyId: Number(data.companyId),
        categoryIds,
      };
      if (isEdit) {
        await jobService.updateJob(id, payload);
      } else {
        await jobService.createJob(payload);
      }
      navigate(basePath);
    } catch (err) {
      setApiError(err.friendlyMessage || err?.response?.data?.message || "Lưu công việc thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async () => {
    const name = newSkillName.trim();
    if (!name) {
      setSkillModalError("Vui lòng nhập tên skill");
      return;
    }
    setSkillSaving(true);
    setSkillModalError("");
    try {
      await jobService.createSkill({ name });
      const skillRes = await jobService.getSkills();
      const skillList = Array.isArray(skillRes)
        ? skillRes
        : skillRes?.data || skillRes?.items || [];
      setSkills(
        skillList.map((s) => ({
          value: String(s.id || s.skillId),
          label: s.name || `Skill #${s.id || s.skillId}`,
        }))
      );
      setSkillModalOpen(false);
      setNewSkillName("");
    } catch (err) {
      setSkillModalError(err?.friendlyMessage || "Không thể tạo skill mới");
    } finally {
      setSkillSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2D1F]">
            {isView ? "Chi tiết công việc" : isEdit ? "Cập nhật công việc" : "Tạo công việc mới"}
          </h1>
          <p className="text-sm text-gray-600">
            {isView
              ? "Xem thông tin chi tiết công việc."
              : isEdit
              ? "Chỉnh sửa thông tin công việc."
              : "Điền đầy đủ thông tin để tạo job."}
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          onClick={() => navigate(basePath)}
        >
          Hủy
        </button>
      </div>

      {apiError && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
        <Controller
          name="title"
          control={control}
          rules={{
            required: "Vui lòng nhập tiêu đề",
            minLength: { value: 5, message: "Tiêu đề tối thiểu 5 ký tự" },
            maxLength: { value: 200, message: "Tiêu đề tối đa 200 ký tự" },
          }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Tiêu đề"
              placeholder="Ví dụ: Frontend Engineer"
              disabled={isView}
              error={errors.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="companyId"
            control={control}
            rules={{ required: "Vui lòng chọn công ty" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Công ty"
                options={companies}
                placeholder="Chọn công ty"
                disabled={isView}
                error={errors.companyId?.message}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            rules={{ required: "Vui lòng chọn trạng thái" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Trạng thái"
                options={statusOptions}
                disabled={isView}
                error={errors.status?.message}
                size="sm"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="workType"
            control={control}
            rules={{ required: "Vui lòng chọn hình thức làm việc" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Hình thức làm việc"
                options={workTypeOptions}
                disabled={isView}
                error={errors.workType?.message}
                size="sm"
              />
            )}
          />
          <Controller
            name="employmentType"
            control={control}
            rules={{ required: "Vui lòng chọn loại hợp đồng" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Loại hợp đồng"
                options={employmentTypeOptions}
                disabled={isView}
                error={errors.employmentType?.message}
                size="sm"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="experienceLevel"
            control={control}
            rules={{ required: "Vui lòng chọn cấp độ kinh nghiệm" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Cấp độ kinh nghiệm"
                options={experienceLevelOptions}
                disabled={isView}
                error={errors.experienceLevel?.message}
                size="sm"
              />
            )}
          />
          <Controller
            name="salaryCurrency"
            control={control}
            rules={{ required: "Vui lòng chọn loại tiền tệ" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Tiền tệ"
                options={currencyOptions}
                disabled={isView}
                error={errors.salaryCurrency?.message}
                size="sm"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="salaryMin"
            control={control}
            rules={{
              validate: (value) =>
                value === "" || Number(value) > 0 || "Lương tối thiểu phải > 0",
            }}
            render={({ field }) => (
              <InputField
                {...field}
                type="number"
                label="Lương tối thiểu"
                disabled={isView}
                error={errors.salaryMin?.message}
              />
            )}
          />
          <Controller
            name="salaryMax"
            control={control}
            rules={{
              validate: (value) => {
                const min = Number(watch("salaryMin"));
                if (value === "") return true;
                if (Number(value) <= 0) return "Lương tối đa phải > 0";
                if (!Number.isNaN(min) && min > 0 && Number(value) < min) {
                  return "Lương tối đa phải >= lương tối thiểu";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <InputField
                {...field}
                type="number"
                label="Lương tối đa"
                disabled={isView}
                error={errors.salaryMax?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="numberOfPositions"
            control={control}
            rules={{
              required: "Vui lòng nhập số lượng tuyển",
              min: { value: 1, message: "Tối thiểu 1 vị trí" },
              max: { value: 100, message: "Tối đa 100 vị trí" },
            }}
            render={({ field }) => (
              <InputField
                {...field}
                type="number"
                label="Số lượng tuyển"
                disabled={isView}
                error={errors.numberOfPositions?.message}
              />
            )}
          />
          <Controller
            name="applicationDeadline"
            control={control}
            rules={{
              required: "Vui lòng chọn hạn nộp",
              validate: (value) =>
                new Date(value).getTime() > Date.now() ||
                "Hạn nộp phải lớn hơn thời điểm hiện tại",
            }}
            render={({ field }) => (
              <InputField
                {...field}
                type="datetime-local"
                label="Hạn nộp hồ sơ"
                disabled={isView}
                error={errors.applicationDeadline?.message}
              />
            )}
          />
        </div>

        <Controller
          name="isSalaryNegotiable"
          control={control}
          render={({ field }) => (
            <label className="inline-flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={isView}
              />
              Lương thỏa thuận
            </label>
          )}
        />

        <Controller
          name="categoryIds"
          control={control}
          rules={{
            validate: (value) =>
              (Array.isArray(value) && value.length > 0) ||
              "Vui lòng chọn ít nhất 1 danh mục",
          }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-[#C7A59D]/40 rounded-xl p-3 bg-white">
                {categories.map((c) => {
                  const selected = (field.value || []).includes(c.value);
                  return (
                    <label
                      key={c.value}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-sm ${
                        selected ? "bg-[#27592D]/10 text-[#27592D]" : "text-gray-700"
                      } ${isView ? "opacity-70" : "cursor-pointer hover:bg-gray-50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={isView}
                        onChange={(e) => {
                          const current = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...current, c.value]);
                          } else {
                            field.onChange(current.filter((v) => v !== c.value));
                          }
                        }}
                      />
                      <span>{c.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.categoryIds?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryIds.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="skillIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Skills (tuỳ chọn)
                </label>
                {!isView && (
                  <button
                    type="button"
                    onClick={() => {
                      setSkillModalError("");
                      setSkillModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27592D]/10 text-[#27592D] hover:bg-[#27592D]/20"
                  >
                    + Tạo skill mới
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-[#C7A59D]/40 rounded-xl p-3 bg-white">
                {skills.map((s) => {
                  const selected = (field.value || []).includes(s.value);
                  return (
                    <label
                      key={s.value}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-sm ${
                        selected ? "bg-[#27592D]/10 text-[#27592D]" : "text-gray-700"
                      } ${isView ? "opacity-70" : "cursor-pointer hover:bg-gray-50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={isView}
                        onChange={(e) => {
                          const current = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...current, s.value]);
                          } else {
                            field.onChange(current.filter((v) => v !== s.value));
                          }
                        }}
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
                {skills.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    Chưa có skill nào. Hãy tạo mới.
                  </p>
                )}
              </div>
            </div>
          )}
        />

        <div className="pt-4 border-t border-gray-100">
          <AddressSelect
            value={{ provinceCode: watch("city"), communeCode: watch("ward") }}
            onChange={handleAddressChange}
            disabled={isView}
            errors={errors}
          />
        </div>

        <Controller
          name="street"
          control={control}
          rules={{ required: "Vui lòng nhập địa chỉ chi tiết" }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Địa chỉ chi tiết"
              disabled={isView}
              error={errors.street?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          rules={{
            required: "Vui lòng nhập mô tả",
            minLength: { value: 50, message: "Mô tả tối thiểu 50 ký tự" },
          }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Mô tả công việc"
              rows={8}
              maxLength={2000}
              showCount
              disabled={isView}
              placeholder="Mô tả chi tiết trách nhiệm, yêu cầu..."
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          name="requirements"
          control={control}
          rules={{ required: "Vui lòng nhập yêu cầu" }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Yêu cầu"
              rows={5}
              disabled={isView}
              error={errors.requirements?.message}
            />
          )}
        />
        <Controller
          name="responsibilities"
          control={control}
          rules={{ required: "Vui lòng nhập trách nhiệm" }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Trách nhiệm"
              rows={5}
              disabled={isView}
              error={errors.responsibilities?.message}
            />
          )}
        />
        <Controller
          name="benefits"
          control={control}
          rules={{ required: "Vui lòng nhập quyền lợi" }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Quyền lợi"
              rows={5}
              disabled={isView}
              error={errors.benefits?.message}
            />
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            onClick={() => navigate(basePath)}
            disabled={loading}
          >
            Hủy
          </button>
          {!isView && (
            <BrandButton type="submit" disabled={loading} className="w-auto px-6">
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </BrandButton>
          )}
        </div>
      </form>

      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !skillSaving && setSkillModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#1F2D1F]">
              Tạo skill mới
            </h3>
            <InputField
              label="Tên skill *"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              disabled={skillSaving}
              error={skillModalError}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                onClick={() => setSkillModalOpen(false)}
                disabled={skillSaving}
              >
                Hủy
              </button>
              <BrandButton
                type="button"
                fullWidth={false}
                className="w-auto px-5"
                onClick={handleCreateSkill}
                disabled={skillSaving}
              >
                {skillSaving ? "Đang tạo..." : "Tạo skill"}
              </BrandButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
