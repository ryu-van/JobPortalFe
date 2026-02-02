import React, { useEffect, useMemo, useState } from "react";
import { Plus, Filter, Search, MoreHorizontal } from "lucide-react";
import SelectField from "../../../components/form/SelectField";
import jobService from "../../../services/jobService";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/form/Table";
import Pagination from "../../../components/form/Pagination";
import InputField from "../../../components/form/InputField";
import BrandButton from "../../../components/form/BrandButton";
export default function Job() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("all");

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "draft", label: "Drafts" },
    { key: "closed", label: "Closed" },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        keyword: keyword || undefined,
        department: department || undefined,
        location: location || undefined,
        status: status === "all" ? undefined : status,
        page,
        size,
      };
      const data = await jobService.getBaseJobs(params);
      const list = Array.isArray(data)
        ? data
        : data?.items || data?.content || data?.list || [];
      const totalItems =
        data?.totalItems || data?.total || data?.count || list.length || 0;
      setItems(list);
      setTotal(totalItems);
    } catch (e) {
      setError(e.friendlyMessage || "Không thể tải danh sách công việc");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, status, department, location]);

  const departments = useMemo(() => {
    const set = new Set(items.map((it) => it.department).filter(Boolean));
    return Array.from(set).map((d) => ({ value: d, label: d }));
  }, [items]);
  const locations = useMemo(() => {
    const set = new Set(items.map((it) => it.location).filter(Boolean));
    return Array.from(set).map((l) => ({ value: l, label: l }));
  }, [items]);

  const statusBadge = (s) => {
    const map = {
      active: "bg-green-50 text-green-700 border-green-200",
      inactive: "bg-gray-50 text-gray-700 border-gray-200",
      draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
      closed: "bg-red-50 text-red-700 border-red-200",
    };
    const cls = map[s?.toLowerCase?.()] || "bg-gray-50 text-gray-700 border-gray-200";
    const label =
      s?.charAt?.(0)?.toUpperCase?.() + s?.slice?.(1) || "Unknown";
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs border ${cls}`}>
        {label}
      </span>
    );
  };

  const columns = [
    {
      header: "Job Title",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.title || row.name}</span>
        </div>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Location", accessor: "location" },
    {
      header: "Posted Date",
      render: (row) => {
        const d = row.postedDate || row.createdAt || row.created_date;
        const dateObj = d ? new Date(d) : null;
        const display = dateObj ? dateObj.toLocaleDateString() : "-";
        return <span className="text-gray-700">{display}</span>;
      },
    },
    {
      header: "Status",
      render: (row) => statusBadge(row.status || row.state),
    },
    {
      header: "Applicants",
      render: (row) => <span className="font-semibold text-gray-900">{row.applicantsCount ?? row.applicants ?? 0}</span>,
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50"
          aria-label="Actions"
          onClick={() => navigate(`/jobs/${row.id || row.jobId || ""}`)}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2D1F]">Job Management</h1>
          <p className="text-sm text-gray-600">Quản lý tin tuyển dụng và xem ứng viên.</p>
        </div>
        <BrandButton
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-[#27592D] hover:bg-[#1f4022] transition shadow"
          onClick={() => navigate("/jobs/create")}
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </BrandButton>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <InputField
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by job title..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:border-transparent outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SelectField
            name="department"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "Tất cả" }, ...departments]}
            className="w-44"
            size="sm"
          />
          <SelectField
            name="location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "Tất cả" }, ...locations]}
            className="w-44"
            size="sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {statusTabs.map((t) => {
          const active = status === t.key;
          return (
            <button
              key={t.key}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                active
                  ? "bg-[#27592D]/10 text-[#27592D] font-semibold"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                setStatus(t.key);
                setPage(1);
              }}
            >
              {t.label}
            </button>
          );
        })}
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
              <p className="mt-3 text-gray-600">Đang tải danh sách công việc...</p>
            </div>
          </div>
        ) : (
          <>
            <Table columns={columns} data={items} emptyMessage="Không có công việc nào" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
              <div className="text-sm text-gray-600">
                Hiển thị {total === 0 ? 0 : (page - 1) * size + 1}-{Math.min(page * size, total)} trong {total}
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
                  options={[5, 10, 20, 50].map((v) => ({ value: v, label: String(v) }))}
                  className="w-24"
                />
                <Pagination
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil((total || 0) / Math.max(1, size)))}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
