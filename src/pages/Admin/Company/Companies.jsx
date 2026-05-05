import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Search, Building2, Pencil, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import companyService from "../../../services/companyService";
import { useToast } from "../../../components/commons/ToastContext";
import Pagination from "../../../components/commons/Pagination";
import { format } from "date-fns";

const normalizeResult = (res) => {
  if (!res) return { items: [], pageInfo: null };
  if (Array.isArray(res)) {
    return { items: res, pageInfo: null };
  }
  if (res.data && Array.isArray(res.data)) {
    return {
      items: res.data,
      pageInfo: res.pagination || res.pageInfo || null,
    };
  }
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return {
      items: res.data.data,
      pageInfo: res.data.pagination || res.data.pageInfo || null,
    };
  }
  const rootItems = res.items || res.content || res.list || res.data;
  if (Array.isArray(rootItems)) {
    return { 
      items: rootItems, 
      pageInfo: res.pagination || res.pageInfo || null 
    };
  }
  return { items: [], pageInfo: null };
};

const resolveTotalPages = (pageInfo) => {
  if (!pageInfo) return 0;
  if (typeof pageInfo.totalPages === "number") return pageInfo.totalPages;
  if (typeof pageInfo.totalElements === "number") {
    const pageSize = pageInfo.size || pageInfo.pageSize || 10;
    return Math.ceil(pageInfo.totalElements / pageSize);
  }
  return 0;
};

const PendingRequests = ({ addToast }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [verifyStatus, setVerifyStatus] = useState("PENDING");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const user = useSelector((s) => s.user.userInfo);
  const reviewerId = user?.id ?? user?.userId ?? null;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        size, 
        verifyStatus: verifyStatus || undefined 
      };

      const res = await companyService.getVerificationRequests(params);

      const { items, pageInfo } = normalizeResult(res);
      setRequests(items);
      setTotalPages(resolveTotalPages(pageInfo));
    } catch {
      addToast("error", "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, [addToast, page, size, verifyStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (id, status, comment = "") => {
    try {
      const payload = {
        reviewedById: reviewerId,
        isApproved: status === "APPROVED",
        reason: comment || "",
      };
      await companyService.reviewCompanyVerificationRequest(id, payload);
      addToast(
        "success",
        status === "APPROVED"
          ? "Phê duyệt công ty thành công!"
          : "Từ chối yêu cầu thành công!"
      );
      fetchRequests();
    } catch (error) {
      addToast(
        "error",
        error?.friendlyMessage ||
          error?.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const openRejectModal = (id) => {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (loading) return;
    setRejectModalOpen(false);
    setRejectTargetId(null);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTargetId) return;
    await handleReview(rejectTargetId, "REJECTED", rejectReason.trim());
    setRejectModalOpen(false);
    setRejectTargetId(null);
    setRejectReason("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return "bg-amber-100 text-amber-700";
      case 'APPROVED': return "bg-green-100 text-green-700";
      case 'REJECTED': return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return "Chờ duyệt";
      case 'APPROVED': return "Đã duyệt";
      case 'REJECTED': return "Từ chối";
      default: return status;
    }
  };

  if (loading && requests.length === 0) return <div className="text-center py-10">Đang tải danh sách yêu cầu...</div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Yêu cầu xác thực công ty</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Trạng thái:</span>
          <select 
            value={verifyStatus}
            onChange={(e) => { setVerifyStatus(e.target.value); setPage(0); }}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#000000]/20 outline-none transition-all cursor-pointer font-medium"
          >
            <option value="PENDING">Đang chờ duyệt</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Công ty yêu cầu</th>
                  <th className="px-6 py-4">Người đại diện</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#000000]/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#000000]" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{req.companyName}</p>
                          <p className="text-xs text-gray-500">
                            {req.address || "Địa chỉ chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">
                        {req.senderName || "--"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {req.companyEmail || "--"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {req.createdAt ? format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm') : "---"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/companies/requests/${req.id}`}
                          className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {req.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleReview(req.id, 'APPROVED')} 
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openRejectModal(req.id)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Từ chối"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pt-6 border-t border-gray-100 mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-bold text-lg">Không có yêu cầu nào</h3>
          <p className="text-sm">Hiện tại không có yêu cầu nào phù hợp với bộ lọc.</p>
        </div>
      )}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-red-700 text-center mb-2">
              Từ chối yêu cầu xác thực công ty
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Vui lòng nhập lý do từ chối để lưu vào lịch sử xử lý.
            </p>
            <textarea
              className="w-full min-h-[100px] border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 mb-4"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Companies = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('list');
  const [isActiveFilter, setIsActiveFilter] = useState("all"); // "all", "true", "false"

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        size, 
        keyword: searchTerm || undefined,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "true"
      };
      
      const res = await companyService.getAllCompanies(params);
      const { items, pageInfo } = normalizeResult(res);
      setCompanies(items);
      setTotalPages(resolveTotalPages(pageInfo));
    } catch {
      addToast("error", "Không thể tải danh sách công ty.");
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, addToast, isActiveFilter]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCompanies();
    }
  }, [fetchCompanies, activeTab]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công ty này?")) {
      try {
        await companyService.deleteCompany(id);
        addToast("success", "Xóa công ty thành công!");
        fetchCompanies();
      } catch {
        addToast("error", "Xóa công ty thất bại.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2D1F]">Quản lý Công ty</h1>
          <p className="text-sm text-gray-500">Hiển thị, quản lý và phê duyệt các công ty trong hệ thống.</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => navigate("/admin/companies/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#000000] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#1e4623] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công ty mới</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button 
          onClick={() => { setActiveTab('list'); setPage(0); }} 
          className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${activeTab === 'list' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Danh sách công ty
          {activeTab === 'list' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-full" />}
        </button>
        <button 
          onClick={() => { setActiveTab('requests'); setPage(0); }} 
          className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${activeTab === 'requests' ? 'text-[#000000]' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Yêu cầu chờ duyệt
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#000000] rounded-full" />}
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, email, MST..." 
                value={searchTerm} 
                onChange={handleSearchChange} 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#000000]/20 focus:border-[#000000] outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Trạng thái:</span>
              <select 
                value={isActiveFilter}
                onChange={(e) => { setIsActiveFilter(e.target.value); setPage(0); }}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#000000]/20 outline-none transition-all cursor-pointer font-medium min-w-[140px]"
              >
                <option value="all">Tất cả</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Tạm khóa</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tên công ty</th>
                  <th className="px-6 py-4">Email liên hệ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading && companies.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10">Đang tải...</td></tr>
                ) : companies.length > 0 ? (
                  companies.map((company) => {
                    const name =
                      company.companyName ??
                      company.name ??
                      "Chưa đặt tên";
                    const email =
                      company.companyEmail ??
                      company.email ??
                      "";
                    const addressLine =
                      company.address?.detailAddress ||
                      company.address?.provinceName ||
                      company.address?.communeName ||
                      "";
                    const meta =
                      company.taxCode ||
                      addressLine ||
                      "Chưa có MST";
                    const isActive =
                      company.isActive ??
                      company.active ??
                      company.status === "ACTIVE";

                    return (
                      <tr
                        key={company.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">{meta}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {email || "---"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive ? "Hoạt động" : "Tạm khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {company.createdAt
                            ? format(new Date(company.createdAt), "dd/MM/yyyy")
                            : "---"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/companies/${company.id}/edit`);
                              }}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(company.id);
                              }}
                              className="p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Xóa công ty"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-500">Không tìm thấy công ty nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pt-6 border-t border-gray-100 mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      ) : (
        <PendingRequests addToast={addToast} />
      )}
    </div>
  );
};

export default Companies;
