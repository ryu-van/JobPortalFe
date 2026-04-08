import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, X, Edit2, Trash2, FolderTree, BriefcaseBusiness } from "lucide-react";
import categoryService from "../../../services/categoryService";
import companyService from "../../../services/companyService";
import InputField from "../../../components/form/InputField";
import BrandButton from "../../../components/form/BrandButton";
import Table from "../../../components/form/Table";
import SelectField from "../../../components/form/SelectField";
import TextArea from "../../../components/form/TextArea";

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", parentId: "" });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("categories");
  const [industries, setIndustries] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [industryEditingId, setIndustryEditingId] = useState(null);
  const [industrySaving, setIndustrySaving] = useState(false);
  const [industryForm, setIndustryForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });
  const [industryFormErrors, setIndustryFormErrors] = useState({});

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { keyword: keyword || undefined };
      const data = await categoryService.getCategories(params);
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.items || data?.content || data?.list || [];
      setItems(list);
    } catch (e) {
      setError(e.friendlyMessage || "Không thể tải danh sách danh mục");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchIndustries = async () => {
    setIndustryLoading(true);
    setError("");
    try {
      const res = await companyService.getAllIndustries(keyword || undefined);
      const list = Array.isArray(res) ? res : res?.data || [];
      setIndustries(list);
    } catch (e) {
      setError(e.friendlyMessage || "Không thể tải danh sách ngành nghề");
      setIndustries([]);
    } finally {
      setIndustryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "industries") {
      fetchIndustries();
    }
  }, [activeTab]);

  const structuredItems = useMemo(() => {
    if (!items.length) return [];
    
    // Map items by ID for easy access
    const map = {};
    const roots = [];
    const childrenMap = {};

    items.forEach(item => {
      map[item.id || item.categoryId] = item;
      const pId = item.parentId;
      if (!pId) {
        roots.push(item);
      } else {
        if (!childrenMap[pId]) childrenMap[pId] = [];
        childrenMap[pId].push(item);
      }
    });

    // Helper to flatten tree
    const flatten = (nodes, level = 0) => {
      let result = [];
      nodes.forEach(node => {
        result.push({ ...node, level });
        const children = childrenMap[node.id || node.categoryId] || [];
        if (children.length > 0) {
          result = result.concat(flatten(children, level + 1));
        }
      });
      return result;
    };

    return flatten(roots);
  }, [items]);

  const filtered = useMemo(() => {
    let data = structuredItems;
    if (keyword) {
      const k = keyword.toLowerCase();
      data = data.filter((c) => {
        const name = String(c.name || "").toLowerCase();
        return name.includes(k);
      });
    }
    return data;
  }, [structuredItems, keyword]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
    } catch (e) {
      setError(e.friendlyMessage || "Xóa danh mục thất bại");
    }
  };

  const filteredIndustries = useMemo(() => {
    if (!keyword) return industries;
    const k = keyword.toLowerCase();
    return industries.filter((i) => {
      const name = String(i.name || "").toLowerCase();
      const code = String(i.code || "").toLowerCase();
      return name.includes(k) || code.includes(k);
    });
  }, [industries, keyword]);

  const openIndustryModal = (row = null) => {
    if (row) {
      setIndustryEditingId(row.id);
      setIndustryForm({
        name: row.name || "",
        code: row.code || "",
        description: row.description || "",
        isActive: row.isActive !== false,
      });
    } else {
      setIndustryEditingId(null);
      setIndustryForm({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
    setIndustryFormErrors({});
    setIndustryModalOpen(true);
  };

  const handleDeleteIndustry = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ngành nghề này?")) return;
    try {
      await companyService.deleteIndustry(id);
      await fetchIndustries();
    } catch (e) {
      setError(e.friendlyMessage || "Xóa ngành nghề thất bại");
    }
  };

  const handleToggleIndustryStatus = async (row) => {
    try {
      await companyService.changeIndustryStatus(row.id, !row.isActive);
      await fetchIndustries();
    } catch (e) {
      setError(e.friendlyMessage || "Cập nhật trạng thái thất bại");
    }
  };

  const columns = [
    {
      header: "STT",
      render: (_, index) => <span className="text-gray-600 font-medium">{index + 1}</span>,
      className: "w-16 text-center"
    },
    {
      header: "Tên danh mục",
      render: (row) => (
        <div className="flex items-center gap-3" style={{ paddingLeft: `${(row.level || 0) * 32}px` }}>
          <div className="relative">
            {row.level > 0 && (
              <div className="absolute -left-6 top-1/2 w-4 h-px bg-gray-300" />
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              row.level === 0 
                ? "bg-gradient-to-br from-[#27592D] to-[#3a7a42]" 
                : "bg-gray-100"
            }`}>
              <FolderTree className={`w-5 h-5 ${row.level === 0 ? "text-white" : "text-gray-500"}`} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-gray-900 ${row.level === 0 ? "font-bold text-base" : "font-medium"}`}>
              {row.name || "-"}
            </span>
            {row.level === 0 && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md w-fit mt-0.5">
                Danh mục gốc
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Mô tả",
      render: (row) => (
        <span className="text-gray-600 text-sm line-clamp-2 max-w-md">
          {row.description || "-"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
           <button
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Chỉnh sửa"
            onClick={() => {
              setEditingId(row.id || row.categoryId || null);
              setForm({
                name: row.name || "",
                description: row.description || "",
                parentId: row.parentId || "",
              });
              setFormErrors({});
              setModalOpen(true);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            title="Thêm danh mục con"
            onClick={() => {
              setEditingId(null);
              setForm({
                name: "",
                description: "",
                parentId: row.id || row.categoryId || "",
              });
              setFormErrors({});
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            title="Xóa"
            onClick={() => handleDelete(row.id || row.categoryId)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const industryColumns = [
    {
      header: "STT",
      render: (_, index) => (
        <span className="text-gray-600 font-medium">{index + 1}</span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Mã ngành",
      render: (row) => (
        <span className="text-gray-900 font-semibold">{row.code || "-"}</span>
      ),
    },
    {
      header: "Tên ngành nghề",
      render: (row) => (
        <span className="text-gray-900 font-medium">{row.name || "-"}</span>
      ),
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Hoạt động" : "Tạm khóa"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Chỉnh sửa"
            onClick={() => openIndustryModal(row)}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${
              row.isActive
                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                : "text-green-600 bg-green-50 hover:bg-green-100"
            }`}
            title={row.isActive ? "Tạm khóa" : "Kích hoạt"}
            onClick={() => handleToggleIndustryStatus(row)}
          >
            <BriefcaseBusiness className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            title="Xóa"
            onClick={() => handleDeleteIndustry(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "categories"
                  ? "bg-white text-[#27592D] shadow-sm"
                  : "text-gray-600 hover:bg-white/70"
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === "categories"
                    ? "bg-[#27592D]/10 text-[#27592D]"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {items.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("industries")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "industries"
                  ? "bg-white text-[#27592D] shadow-sm"
                  : "text-gray-600 hover:bg-white/70"
              }`}
            >
              <BriefcaseBusiness className="w-4 h-4" />
              <span>Industries</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === "industries"
                    ? "bg-[#27592D]/10 text-[#27592D]"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {industries.length}
              </span>
            </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#27592D] to-[#3a7a42] flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activeTab === "categories"
                      ? "Quản lý danh mục"
                      : "Quản lý ngành nghề"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {activeTab === "categories"
                      ? "Quản lý danh mục việc làm. Tìm kiếm, tạo và chỉnh sửa nhanh chóng."
                      : "Quản lý ngành nghề của công ty. Tìm kiếm, tạo và chỉnh sửa nhanh chóng."}
                  </p>
                </div>
              </div>
            </div>
            
            <BrandButton
              fullWidth={false}
              className="px-5 py-2.5 shadow-md hover:shadow-xl transition-all self-start"
              onClick={() => {
                if (activeTab === "categories") {
                  setEditingId(null);
                  setForm({ name: "", description: "", parentId: "" });
                  setFormErrors({});
                  setModalOpen(true);
                } else {
                  openIndustryModal();
                }
              }}
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" />
                {activeTab === "categories"
                  ? "Tạo danh mục mới"
                  : "Tạo ngành nghề mới"}
              </span>
            </BrandButton>
          </div>

          <div className="mt-5">
            <div className="relative w-full max-w-lg md:max-w-xl">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={
                  activeTab === "categories"
                    ? "Tìm kiếm danh mục..."
                    : "Tìm kiếm ngành nghề..."
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#27592D] focus:border-transparent outline-none bg-gray-50 hover:bg-white transition-colors"
              />
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === "categories"
                    ? "Tổng số danh mục"
                    : "Tổng số ngành nghề"}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeTab === "categories" ? items.length : industries.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                {activeTab === "categories" ? (
                  <FolderTree className="w-6 h-6 text-blue-600" />
                ) : (
                  <BriefcaseBusiness className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === "categories" ? "Danh mục gốc" : "Đang hoạt động"}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeTab === "categories"
                    ? items.filter((c) => !c.parentId).length
                    : industries.filter((i) => i.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === "categories" ? "Danh mục con" : "Tạm khóa"}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeTab === "categories"
                    ? items.filter((c) => c.parentId).length
                    : industries.filter((i) => !i.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {error && (
            <div className="m-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <span className="font-medium">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {(activeTab === "categories" ? loading : industryLoading) ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#27592D] mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  {activeTab === "categories"
                    ? "Đang tải danh sách danh mục..."
                    : "Đang tải danh sách ngành nghề..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <Table
                columns={activeTab === "categories" ? columns : industryColumns}
                data={activeTab === "categories" ? filtered : filteredIndustries}
                emptyMessage={
                  activeTab === "categories"
                    ? "Không tìm thấy danh mục nào"
                    : "Không tìm thấy ngành nghề nào"
                }
              />
            </div>
          )}
        </div>

      {modalOpen && activeTab === "categories" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => !saving && setModalOpen(false)} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27592D] to-[#3a7a42] flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                  </h2>
                </div>
                <button
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => !saving && setModalOpen(false)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tên danh mục"
                  name="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  error={formErrors.name}
                  required
                />
                <SelectField
                  label="Danh mục cha"
                  name="parentId"
                  value={form.parentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
                  options={[
                    { value: "", label: "-- Không có --" },
                    ...items
                      .filter((c) => String(c.id || c.categoryId) !== String(editingId))
                      .map((c) => ({
                        value: c.id || c.categoryId,
                        label: c.name,
                      })),
                  ]}
                  size="sm"
                />
              </div>
              
              <TextArea
                label="Mô tả"
                name="description"
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, description: "" }));
                }}
                rows={5}
                maxLength={1000}
                showCount
                placeholder="Nhập mô tả chi tiết về danh mục này..."
                error={formErrors.description}
              />
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
                <BrandButton
                  className="w-auto px-6"
                  onClick={async () => {
                    const errs = {};
                    if (!form.name?.trim()) errs.name = "Vui lòng nhập tên danh mục";
                    if (Object.keys(errs).length) {
                      setFormErrors(errs);
                      return;
                    }
                    setSaving(true);
                    try {
                      const payload = {
                        name: form.name,
                        description: form.description,
                        parentId: form.parentId || null,
                      };
                      if (editingId) {
                        await categoryService.updateCategory(editingId, payload);
                      } else {
                        await categoryService.createCategory(payload);
                      }
                      await fetchCategories();
                      setModalOpen(false);
                    } catch (e) {
                      setError(e.friendlyMessage || "Lưu danh mục thất bại");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    editingId ? "Cập nhật" : "Tạo mới"
                  )}
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {industryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !industrySaving && setIndustryModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27592D] to-[#3a7a42] flex items-center justify-center">
                    <BriefcaseBusiness className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {industryEditingId
                      ? "Chỉnh sửa ngành nghề"
                      : "Tạo ngành nghề mới"}
                  </h2>
                </div>
                <button
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    !industrySaving && setIndustryModalOpen(false)
                  }
                  disabled={industrySaving}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tên ngành nghề"
                  name="name"
                  value={industryForm.name}
                  onChange={(e) => {
                    setIndustryForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                    setIndustryFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  error={industryFormErrors.name}
                />
                <InputField
                  label="Mã ngành"
                  name="code"
                  value={industryForm.code}
                  onChange={(e) => {
                    setIndustryForm((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }));
                    setIndustryFormErrors((prev) => ({ ...prev, code: "" }));
                  }}
                  placeholder="Ví dụ: software"
                  error={industryFormErrors.code}
                />
              </div>

              <TextArea
                label="Mô tả"
                name="description"
                value={industryForm.description}
                onChange={(e) =>
                  setIndustryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Nhập mô tả ngành nghề..."
              />

              <div className="flex items-center gap-3">
                <input
                  id="industry-active"
                  type="checkbox"
                  checked={industryForm.isActive}
                  onChange={(e) =>
                    setIndustryForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#27592D] focus:ring-[#27592D]"
                />
                <label
                  htmlFor="industry-active"
                  className="text-sm text-gray-700 font-medium"
                >
                  Đang hoạt động
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                  onClick={() => setIndustryModalOpen(false)}
                  disabled={industrySaving}
                >
                  Hủy bỏ
                </button>
                <BrandButton
                  className="w-auto px-6"
                  onClick={async () => {
                    const errs = {};
                    if (!industryForm.name?.trim()) {
                      errs.name = "Vui lòng nhập tên ngành nghề";
                    }
                    if (!industryForm.code?.trim()) {
                      errs.code = "Vui lòng nhập mã ngành";
                    }
                    if (Object.keys(errs).length) {
                      setIndustryFormErrors(errs);
                      return;
                    }

                    setIndustrySaving(true);
                    try {
                      const payload = {
                        name: industryForm.name.trim(),
                        code: industryForm.code.trim(),
                        description: industryForm.description?.trim() || null,
                        isActive: industryForm.isActive,
                      };
                      if (industryEditingId) {
                        await companyService.updateIndustry(
                          industryEditingId,
                          payload
                        );
                      } else {
                        await companyService.createIndustry(payload);
                      }
                      await fetchIndustries();
                      setIndustryModalOpen(false);
                    } catch (e) {
                      setError(e.friendlyMessage || "Lưu ngành nghề thất bại");
                    } finally {
                      setIndustrySaving(false);
                    }
                  }}
                  disabled={industrySaving}
                >
                  {industrySaving ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </span>
                  ) : industryEditingId ? (
                    "Cập nhật"
                  ) : (
                    "Tạo mới"
                  )}
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
