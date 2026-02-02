import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import jobService from "../../../services/jobService";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import TextArea from "../../../components/form/TextArea";
import BrandButton from "../../../components/form/BrandButton";

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      department: "",
      location: "",
      status: "draft",
      description: "",
    }
  });

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = await jobService.getJobDetail(id);
        if (!mounted || !data) return;
        reset({
          title: data.title || data.name || "",
          department: data.department || "",
          location: data.location || "",
          status: (data.status || "draft").toLowerCase(),
          description: data.description || "",
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
  }, [isEdit, id, reset]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
    { value: "closed", label: "Closed" },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        title: data.title,
        department: data.department,
        location: data.location,
        status: data.status,
        description: data.description,
      };
      if (isEdit) {
        await jobService.updateJob(id, payload);
      } else {
        await jobService.createJob(payload);
      }
      navigate("/jobs");
    } catch (err) {
      setApiError(err.friendlyMessage || "Lưu công việc thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2D1F]">
            {isEdit ? "Cập nhật công việc" : "Tạo công việc mới"}
          </h1>
          <p className="text-sm text-gray-600">
            {isEdit
              ? "Chỉnh sửa thông tin công việc."
              : "Điền đầy đủ thông tin để tạo job."}
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          onClick={() => navigate("/jobs")}
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
          rules={{ required: "Vui lòng nhập tiêu đề" }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Tiêu đề"
              placeholder="Ví dụ: Frontend Engineer"
              error={errors.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="department"
            control={control}
            rules={{ required: "Vui lòng nhập phòng ban" }}
            render={({ field }) => (
              <InputField
                {...field}
                label="Phòng ban"
                error={errors.department?.message}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            rules={{ required: "Vui lòng nhập địa điểm" }}
            render={({ field }) => (
              <InputField
                {...field}
                label="Địa điểm"
                error={errors.location?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="status"
            control={control}
            rules={{ required: "Vui lòng chọn trạng thái" }}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Trạng thái"
                options={statusOptions}
                error={errors.status?.message}
                size="sm"
              />
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          rules={{ required: "Vui lòng nhập mô tả" }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Mô tả công việc"
              rows={8}
              maxLength={2000}
              showCount
              placeholder="Mô tả chi tiết trách nhiệm, yêu cầu..."
              error={errors.description?.message}
            />
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            onClick={() => navigate("/jobs")}
            disabled={loading}
          >
            Hủy
          </button>
          <BrandButton type="submit" disabled={loading} className="w-auto px-6">
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </BrandButton>
        </div>
      </form>
    </div>
  );
}
