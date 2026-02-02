import React, { useEffect, useState, useCallback } from "react";
import { Search, CirclePlus } from "lucide-react";
import userService from "../../../services/userService";
import Table from "../../../components/form/Table";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import Pagination from "../../../components/form/Pagination";
import ConfirmModal from "../../../components/commons/ConfirmModal";
import BrandButton from "../../../components/form/BrandButton";
import { useNavigate } from "react-router-dom";
const Users = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  const roleOptions = [
    { value: "", label: "Tất cả vai trò" },
    { value: "CANDIDATE", label: "Ứng viên" },
    { value: "HR", label: "Nhà tuyển dụng" },
    { value: "ADMIN_COMPANY", label: "Admin công ty" },
    { value: "ADMIN", label: "Admin hệ thống" },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        keyword: keyword || undefined,
        role: role || undefined,
        isActive: status === "all" ? undefined : status === "active",
        pageNo: page - 1,
        size,
      };
      const data = await userService.getUsers(params);
      const list = Array.isArray(data)
        ? data
        : data?.items || data?.content || data?.list || [];
      const totalItems =
        data?.totalItems || data?.total || data?.count || list.length || 0;
      setItems(list);
      setTotal(totalItems);
    } catch (err) {
      setError(
        err.friendlyMessage || "An error occurred while fetching users."
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, role, status, page, size]);
  const handleToggleStatus = async (user) => {
    const currentStatus =
      user.isActive ?? user.is_active ?? user.active ?? false;
    const nextStatus = !currentStatus;
    try {
      await userService.toggleStatus(user.id, nextStatus);
      fetchUsers();
    } catch (err) {
      setError(
        err.friendlyMessage || "An error occurred while toggling user status."
      );
    }
  };

  const openToggleConfirm = (user) => {
    setError("");
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmUser) return;
    setConfirmLoading(true);
    try {
      await handleToggleStatus(confirmUser);
      setConfirmOpen(false);
      setConfirmUser(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelToggle = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmUser(null);
  };
  const handleViewDetail = (id) => {
    navigate(`/admin/users/${id}`);
  };
  const handleUpdate = (id) => {
    navigate(`/admin/users/${id}/edit`);
  };
  const handleAddUser = () => {
    navigate("/admin/users/new");
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const statusBadge = (raw) => {
    let normalized;
    if (typeof raw === "boolean") {
      normalized = raw ? "active" : "inactive";
    } else if (typeof raw === "string") {
      normalized = raw.toLowerCase();
    } else {
      normalized = "unknown";
    }
    const map = {
      active: "bg-green-50 text-green-700 border-green-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
      blocked: "bg-red-50 text-red-700 border-red-200",
    };
    const cls = map[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
    const label =
      normalized === "active"
        ? "Hoạt động"
        : normalized === "inactive"
        ? "Ngừng hoạt động"
        : normalized === "blocked"
        ? "Bị khóa"
        : "Không xác định";
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs border ${cls}`}>
        {label}
      </span>
    );
  };

  const columns = [
    {
      header: "Họ và tên",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {row.fullName || "-"}
          </span>
          <span className="text-xs text-gray-500">
            {row.email || ""}
          </span>
        </div>
      ),
    },
    {
      header: "Mã người dùng",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-700 text-sm">
            {row.code || "-"}
            </span>
        </div>
      )
    },
    {
      header: "Số điện thoại",
      render: (row) => (
        <div className="flex flex-col">
          <span className="flex-gray-700 text-sm">
            {row.phoneNumber || "-"}
          </span>
        </div>
      )
    },
    {
      header: "Giới tính",
      render: (row) => {
        return (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm">
              {row.gender === false ? "Nam" : row.gender === true ? "Nữ" : "-"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Vai trò",
      render: (row) => {
        const r =
          row.roleName ||
          "";
        return <span className="text-gray-700 text-sm">{String(r || "-")}</span>;
      },
    },
    {
      header: "Công ty",
      render: (row) => {
        const name =
          row.companyName ??
          row.company_name ??
          row.company?.name ??
          "";
        if (!name) {
          return <span className="text-gray-400 text-sm"></span>;
        }
        return (
          <span className="text-gray-700 text-sm">
            {name}
          </span>
        );
      },
    },
    {
      header: "Trạng thái",
      render: (row) =>
        statusBadge(
          row.isActive ??
            row.is_active ??
            row.active ??
            row.status ??
            row.state
        ),
    },
    {
      header: "Hành động",
      render: (row) => {
        const isActive =
          row.isActive ?? row.is_active ?? row.active ?? false;

        return (
          <div className="flex flex-wrap gap-2 justify-start">
            <button
              type="button"
              onClick={() => handleViewDetail(row.id)}
              className="inline-flex items-center justify-center px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Chi tiết
            </button>

            <button
              type="button"
              onClick={() => openToggleConfirm(row)}
              className={
                isActive
                  ? "inline-flex items-center justify-center px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  : "inline-flex items-center justify-center px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              }
            >
              {isActive ? "Ngưng hoạt động" : "Kích hoạt"}
            </button>

            <button
              type="button"
              onClick={() => handleUpdate(row.id)}
              className="inline-flex items-center justify-center px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg border border-[#1f4022] text-white bg-black hover:bg-[#1f4022] transition-colors"
            >
              Cập nhật
            </button>
          </div>
        );
      },
    },
  ];

  const confirmIsActive = confirmUser
    ? confirmUser.isActive ??
      confirmUser.is_active ??
      confirmUser.active ??
      false
    : false;

  const confirmTitle = confirmIsActive
    ? "Ngưng hoạt động tài khoản"
    : "Kích hoạt tài khoản";

  const confirmDescription = confirmUser
    ? `Bạn có chắc muốn ${
        confirmIsActive ? "ngưng hoạt động" : "kích hoạt"
      } tài khoản ${
        confirmUser.fullName || confirmUser.email || confirmUser.code || ""
      }?`
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2D1F]">
            User Management
          </h1>
          <p className="text-sm text-gray-600">
            Quản lý tài khoản người dùng trên hệ thống.
          </p>
        </div>
        <BrandButton
          type="button"
          onClick={() => handleAddUser()}
          fullWidth={false}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-[#27592D] hover:bg-[#1f4022] transition shadow"
        >
          <span><CirclePlus className="w-5 h-5" /></span>
          Thêm mới
        </BrandButton>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <InputField
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:border-transparent outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SelectField
            name="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            options={roleOptions}
            className="w-48"
            size="sm"
          />
          <SelectField
            name="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={statusOptions}
            className="w-40"
            size="sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-2">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#27592D] mx-auto"></div>
              <p className="mt-3 text-gray-600">
                Đang tải danh sách người dùng...
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={items}
              emptyMessage="Không có người dùng nào"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                {total === 0
                  ? 0
                  : (page - 1) * size + 1}
                -
                {Math.min(page * size, total)} trong {total}
              </div>
              <div className="flex items-center gap-3">
                <SelectField
                  name="pageSize"
                  value={size}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSize(next);
                    setPage(1);
                  }}
                  options={[5, 10, 20, 50].map((v) => ({
                    value: v,
                    label: String(v),
                  }))}
                  className="w-24"
                />
                <Pagination
                  currentPage={page}
                  totalPages={Math.max(
                    1,
                    Math.ceil((total || 0) / Math.max(1, size))
                  )}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        variant={confirmIsActive ? "danger" : "success"}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={
          confirmIsActive
            ? "Xác nhận ngưng hoạt động"
            : "Xác nhận kích hoạt"
        }
        cancelText="Hủy"
        loading={confirmLoading}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
      />
    </div>
  );
};

export default Users;
