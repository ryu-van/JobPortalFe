import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { 
  CircleChevronLeft, Pencil, Plus, Info, X, Search, 
  Building2, Upload, MapPin, FileText, File, Trash2, Eye, Calendar, Image as ImageIcon
} from "lucide-react";
import InputField from "../../../components/form/InputField";
import SelectField from "../../../components/form/SelectField";
import BrandButton from "../../../components/form/BrandButton";
import TextArea from "../../../components/form/TextArea";
import AddressSelect from "../../../components/commons/AddressSelect";
import companyService from "../../../services/companyService";
import { useToast } from "../../../components/commons/ToastContext";
import DocumentPreviewModal from "../../../components/commons/DocumentPreviewModal";

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "Dưới 10 người" },
  { value: "11-50", label: "11-50 người" },
  { value: "51-200", label: "51-200 người" },
  { value: "201-500", label: "201-500 người" },
  { value: "501-1000", label: "501-1000 người" },
  { value: "1000+", label: "Trên 1000 người" }
];

// --- Sub-components ---

const FormSectionHeader = ({ icon: Icon, title, note }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-[#27592D]">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-8 bg-[#27592D] rounded-full"></div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-6 h-6" />}
        <h3 className="text-xl font-bold uppercase tracking-wider">{title}</h3>
      </div>
    </div>
    {note && (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
        <Info className="w-4 h-4 shrink-0" />
        <p className="text-xs font-medium">{note}</p>
      </div>
    )}
  </div>
);

const LogoUpload = ({ preview, readOnly, onUploadClick, onFileChange, inputRef }) => (
  <div className="w-full lg:w-[320px] shrink-0 flex flex-col items-center gap-6">
    <div className="w-full space-y-2">
      <p className="font-bold text-[#1F2D1F] text-sm tracking-wider uppercase">LOGO CÔNG TY</p>
      <p className="text-xs text-gray-400 leading-relaxed italic">
        Định dạng: PNG, JPG (Tối đa 5MB). Kích thước khuyến nghị 400x400px.
      </p>
    </div>

    <div 
      onClick={() => !readOnly && onUploadClick()} 
      className={`w-full aspect-square bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-8 transition-all relative overflow-hidden group ${!readOnly ? "cursor-pointer hover:bg-gray-100 hover:border-[#27592D]/20" : ""}`}
    >
      {preview ? (
        <div className="w-full h-full relative group">
          <img src={preview} alt="Logo" className="w-full h-full object-contain" />
          {!readOnly && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-3 rounded-full text-[#27592D] shadow-lg">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 shadow-sm group-hover:text-[#27592D] transition-colors">
            <ImageIcon className="w-10 h-10" />
          </div>
          <div className="text-sm font-medium text-gray-400 leading-relaxed">
            Kéo thả hoặc nhấp để<br /> tải lên logo
          </div>
        </div>
      )}
    </div>
    
    {!readOnly && preview && (
      <button 
        type="button" 
        onClick={() => onUploadClick()}
        className="flex items-center gap-2 text-[#27592D] font-bold text-sm hover:underline"
      >
        <Pencil className="w-4 h-4" />
        Thay đổi logo
      </button>
    )}
    <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={onFileChange} />
  </div>
);

const CompanyForm = ({ isRequest: propIsRequest }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToast } = useToast();

  const isRequest = propIsRequest || location.pathname.includes("/requests/");
  const isEdit = location.pathname.includes("/edit");
  const mode = id ? (isEdit ? "edit" : "view") : "add";
  const readOnly = mode === "view";

  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [docFiles, setDocFiles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // States for multiple addresses
  const [companyAddresses, setCompanyAddresses] = useState([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [tempAddress, setTempAddress] = useState({ 
    addressType: "Trụ sở chính", 
    city: "", 
    provinceName: "", 
    ward: "", 
    communeName: "", 
    street: "" 
  });

  const logoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      companyName: "",
      companyEmail: "",
      taxCode: "",
      phoneNumber: "",
      website: "",
      industryId: "",
      companySize: "",
      establishmentDate: "",
      description: "",
      logoUrl: "",
      isActive: true,
      isVerified: false,
    },
  });

  const handleAddAddress = () => {
    if (!tempAddress.city || !tempAddress.street) {
      addToast("error", "Vui lòng điền Tỉnh/Thành phố và Địa chỉ chi tiết");
      return;
    }

    const newAddr = {
      addressType: tempAddress.addressType,
      provinceCode: tempAddress.city,
      provinceName: tempAddress.provinceName,
      communeCode: tempAddress.ward,
      communeName: tempAddress.communeName,
      detailAddress: tempAddress.street,
      isPrimary: companyAddresses.length === 0,
      id: Date.now()
    };
    setCompanyAddresses([...companyAddresses, newAddr]);
    setTempAddress({
      addressType: "Chi nhánh",
      city: "",
      provinceName: "",
      ward: "",
      communeName: "",
      street: ""
    });
    setShowAddAddressForm(false);
  };

  const removeAddress = (addrId) => {
    setCompanyAddresses(companyAddresses.filter(a => a.id !== addrId));
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await companyService.getAllIndustries();
        const items = Array.isArray(res) ? res : res?.data || [];
        const options = items.map((item) => ({
          value: String(item.id),
          label: item.name,
        }));
        setIndustries(options);
      } catch (err) {
        console.error("Error fetching industries:", err);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = isRequest 
          ? await companyService.getVerificationRequestDetail(id)
          : await companyService.getCompanyDetail(id);
          
        if (!res) return;
        
        const data = res.data || res;
        if (!data) return;

        // Populate multiple addresses
        let addrs = [];
        if (data.addresses && Array.isArray(data.addresses)) {
          addrs = data.addresses.map(a => ({
            id: a.id || Math.random(),
            addressType: a.addressType || "Trụ sở chính",
            provinceCode: a.provinceCode,
            provinceName: a.provinceName,
            communeCode: a.communeCode,
            communeName: a.communeName,
            detailAddress: a.detailAddress,
            isPrimary: a.isPrimary
          }));
        } else if (data.address || data.addressRequest) {
          const a = data.address || data.addressRequest;
          addrs = [{
            id: Math.random(),
            addressType: "Trụ sở chính",
            provinceCode: a.provinceCode,
            provinceName: a.provinceName,
            communeCode: a.communeCode,
            communeName: a.communeName,
            detailAddress: a.detailAddress,
            isPrimary: true
          }];
        }
        setCompanyAddresses(addrs);

        reset({ 
          ...data, 
          companyName: data.name || data.companyName || "",
          companyEmail: data.email || data.companyEmail || data.contactEmail || "",
          taxCode: data.taxCode || data.businessLicense || "",
          phoneNumber: data.phoneNumber || data.contactPhone || "",
          industryId: data.industryId ? String(data.industryId) : (data.industry?.id ? String(data.industry.id) : ""),
          establishmentDate: data.establishmentDate ? data.establishmentDate.split('T')[0] : "",
        });
        setLogoPreview(data.logoUrl || data.logo || "");
        
        // Nếu là request, bóc tách tài liệu (nếu có)
        if (isRequest && data.documents) {
          const docs = data.documents.map(d => ({
            id: d.id,
            name: d.fileName || d.name,
            url: d.fileUrl || d.url,
            size: d.fileSize ? (d.fileSize / (1024 * 1024)).toFixed(1) + " MB" : "---",
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : "---",
            isExisting: true
          }));
          setDocFiles(docs);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error("Error fetching data:", e);
        addToast("error", "Không thể tải thông tin.");
      } finally { setLoading(false); }
    })();
  }, [id, reset, addToast, isRequest]);

  const onSubmit = async (formData) => {
    if (companyAddresses.length === 0) {
      addToast("error", "Vui lòng thêm ít nhất một địa chỉ.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.companyName,
        email: formData.companyEmail,
        taxCode: formData.taxCode,
        businessLicense: formData.taxCode,
        phoneNumber: formData.phoneNumber,
        website: formData.website,
        industryId: formData.industryId === "OTHER" ? null : Number(formData.industryId),
        otherIndustry: formData.industryId === "OTHER" ? formData.otherIndustry : null,
        companySize: formData.companySize,
        establishmentDate: formData.establishmentDate,
        description: formData.description,
        addressRequest: companyAddresses.map(a => ({
          addressType: a.addressType,
          provinceName: a.provinceName,
          districtName: "", 
          communeName: a.communeName,
          detailAddress: a.detailAddress,
          provinceCode: a.provinceCode,
          communeCode: a.communeCode,
          isPrimary: a.isPrimary,
        }))
      };

      if (id) {
        if (isRequest) {
          await companyService.updateCompanyVerificationRequest(id, payload, logoFile, docFiles);
          addToast("success", "Cập nhật yêu cầu xác minh thành công!");
        } else {
          await companyService.updateCompany(id, payload, logoFile);
          addToast("success", "Cập nhật thông tin công ty thành công!");
        }
      } else {
        await companyService.createCompanyVerificationRequest(payload, logoFile, docFiles);
        addToast("success", "Gửi yêu cầu xác minh thành công!");
      }
      navigate("/admin/companies");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Thao tác thất bại.";
      addToast("error", errorMsg);
      console.error(error);
    } finally { setLoading(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("error", "Dung lượng ảnh không được quá 5MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      date: new Date().toLocaleDateString('en-GB'),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setDocFiles(prev => [...prev, ...validFiles]);
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="w-full space-y-8 pb-20 px-2">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1F2D1F]">
            {mode === "add" ? "Thêm mới công ty" : 
             mode === "edit" ? (isRequest ? "Chỉnh sửa yêu cầu xác minh" : "Chỉnh sửa công ty") : 
             (isRequest ? "Chi tiết yêu cầu xác minh" : "Chi tiết công ty")}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRequest ? "Xem xét thông tin và hồ sơ pháp lý của doanh nghiệp." : "Vui lòng hoàn thiện hồ sơ pháp lý của doanh nghiệp để bắt đầu vận hành hệ thống."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === "view" && (
            <button
              onClick={() => navigate(isRequest ? `/admin/companies/requests/${id}/edit` : `/admin/companies/edit/${id}`)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#27592D] text-white rounded-2xl font-bold hover:bg-[#1f4523] transition-all shadow-lg shadow-[#27592D]/20 text-sm"
            >
              <Pencil className="w-4 h-4" />
              Chỉnh sửa hồ sơ
            </button>
          )}
          <button 
            onClick={() => navigate("/admin/companies")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm group"
          >
            <CircleChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Quay lại
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 md:p-12 space-y-16">
        {/* Section 1: Basic Info & Logo */}
        <div className="space-y-10">
          <FormSectionHeader title="Thông tin cơ bản" />

          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <Controller 
                  name="companyName" 
                  control={control} 
                  rules={{ required: "Tên công ty là bắt buộc" }}
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="TÊN CÔNG TY *" 
                      placeholder="Công ty TNHH Giải pháp Công nghệ ABC" 
                      readOnly={readOnly} 
                      error={errors.companyName?.message}
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
                <Controller 
                  name="companyEmail" 
                  control={control} 
                  rules={{ required: "Email là bắt buộc" }}
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="EMAIL DOANH NGHIỆP *" 
                      placeholder="contact@abc-tech.com" 
                      type="email" 
                      readOnly={readOnly} 
                      error={errors.companyEmail?.message}
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
                
                <Controller 
                  name="taxCode" 
                  control={control} 
                  rules={{ 
                    required: "Mã số thuế là bắt buộc",
                    pattern: {
                      value: /^\d{6}-\d{4}$/,
                      message: "Mã số thuế phải đúng định dạng XXXXXX-XXXX (6 số đầu - 4 số cuối)"
                    }
                  }}
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="MÃ SỐ THUẾ *" 
                      placeholder="XXXXXX-XXXX" 
                      readOnly={readOnly} 
                      error={errors.taxCode?.message}
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
                <Controller 
                  name="phoneNumber" 
                  control={control} 
                  rules={{
                    required: "Số điện thoại là bắt buộc",
                    pattern: {
                      value: /^(0[3|5|7|8|9])[0-9]{8}$/,
                      message: "Số điện thoại không hợp lệ (phải có 10 chữ số)"
                    }
                  }}
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="SỐ ĐIỆN THOẠI *" 
                      placeholder="024 3999 8888" 
                      readOnly={readOnly} 
                      error={errors.phoneNumber?.message}
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />

                <Controller 
                  name="website" 
                  control={control} 
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="WEBSITE" 
                      placeholder="https://abc-tech.com" 
                      readOnly={readOnly} 
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
                <Controller 
                  name="industryId" 
                  control={control} 
                  render={({ field }) => (
                    <SelectField 
                      {...field} 
                      label="NGÀNH NGHỀ" 
                      placeholder="Chọn ngành nghề" 
                      options={industries}
                      readOnly={readOnly} 
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />

                {watch("industryId") === "OTHER" && (
                  <Controller
                    name="otherIndustry"
                    control={control}
                    rules={{ required: watch("industryId") === "OTHER" ? "Vui lòng nhập ngành nghề khác" : false }}
                    render={({ field }) => (
                      <InputField
                        {...field}
                        label="NGÀNH NGHỀ KHÁC *"
                        placeholder="Nhập ngành nghề của bạn"
                        readOnly={readOnly}
                        error={errors.otherIndustry?.message}
                        className="bg-white border-gray-200 shadow-sm"
                      />
                    )}
                  />
                )}

                <Controller 
                  name="companySize" 
                  control={control} 
                  render={({ field }) => (
                    <SelectField 
                      {...field} 
                      label="QUY MÔ NHÂN SỰ" 
                      placeholder="Chọn quy mô" 
                      options={COMPANY_SIZE_OPTIONS}
                      readOnly={readOnly} 
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
                <Controller 
                  name="establishmentDate" 
                  control={control} 
                  render={({ field }) => (
                    <InputField 
                      {...field} 
                      label="NGÀY THÀNH LẬP" 
                      type="date" 
                      readOnly={readOnly} 
                      className="bg-gray-50 border-gray-100"
                    />
                  )} 
                />
              </div>

              <Controller 
                name="description" 
                control={control} 
                render={({ field }) => (
                  <TextArea 
                    {...field} 
                    label="MÔ TẢ CÔNG TY" 
                    placeholder="Giới thiệu ngắn gọn về lịch sử và định hướng phát triển..." 
                    readOnly={readOnly} 
                    rows={5} 
                    className="bg-gray-50 border-gray-100"
                  />
                )} 
              />
            </div>

            <LogoUpload 
              preview={logoPreview}
              readOnly={readOnly}
              onUploadClick={() => logoInputRef.current.click()}
              onFileChange={handleLogoChange}
              inputRef={logoInputRef}
            />
          </div>
        </div>

        {/* Section 2: Address Section */}
        <div className="space-y-10">
          <FormSectionHeader title="Địa chỉ trụ sở & Chi nhánh" icon={MapPin} />

          <div className="space-y-8">
            {/* List of already added addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyAddresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-3xl relative group hover:border-[#27592D]/30 hover:bg-white transition-all shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${addr.isPrimary ? "bg-[#27592D] text-white" : "bg-white text-[#27592D] border border-gray-100"}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md">
                        {addr.addressType}
                      </span>
                      {addr.isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                          Chính
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{addr.provinceName}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {addr.communeName ? `${addr.communeName}, ` : ""}{addr.detailAddress}
                    </p>
                  </div>
                  
                  {!readOnly && (
                    <button 
                      type="button" 
                      onClick={() => removeAddress(addr.id)}
                      className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add New Address Button */}
              {!readOnly && !showAddAddressForm && (
                <button 
                  type="button"
                  onClick={() => setShowAddAddressForm(true)}
                  className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 hover:text-[#27592D] hover:border-[#27592D]/20 hover:bg-gray-50 transition-all group min-h-[140px]"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Thêm địa chỉ mới</span>
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddressForm && (
              <div className="bg-gray-50/50 border border-gray-100 rounded-[40px] p-8 md:p-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#27592D] rounded-full"></div>
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Cấu hình địa chỉ mới</h4>
                  </div>
                  <button type="button" onClick={() => setShowAddAddressForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Loại địa chỉ</label>
                    <div className="flex gap-3 max-w-2xl">
                      {["Trụ sở chính", "Chi nhánh", "Văn phòng đại diện"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTempAddress({ ...tempAddress, addressType: type })}
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${tempAddress.addressType === type ? "bg-[#27592D] text-white border-[#27592D] shadow-lg shadow-[#27592D]/20" : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AddressSelect 
                      value={{ provinceCode: tempAddress.city, communeCode: tempAddress.ward }}
                      onChange={(val) => setTempAddress({ 
                        ...tempAddress, 
                        city: val.provinceCode, 
                        provinceName: val.provinceName,
                        ward: val.communeCode,
                        communeName: val.communeName 
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <InputField
                    label="Địa chỉ chi tiết"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    value={tempAddress.street}
                    onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                    className="bg-white border-gray-200 shadow-sm"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddAddressForm(false)}
                    className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button"
                    onClick={handleAddAddress}
                    className="px-10 py-3 bg-[#27592D] text-white rounded-2xl font-bold shadow-lg shadow-[#27592D]/10 hover:bg-[#1f4523] transition-all text-sm"
                  >
                    Xác nhận thêm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Attachments Section - Chỉ hiện thị cho Verification Request */}
        {isRequest && (
          <div className="space-y-10">
            <FormSectionHeader 
              title="Tài liệu đính kèm" 
              icon={FileText} 
              note="Yêu cầu tối thiểu 2 tài liệu: Business license và Tax certificate"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Upload Area */}
              {!readOnly && (
                <div className="lg:col-span-3">
                  <div 
                    onClick={() => docInputRef.current.click()}
                    className="w-full aspect-square bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:bg-gray-100 hover:border-[#27592D]/20 transition-all group"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#27592D] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-[#1F2D1F] text-sm">Tải lên tài liệu</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Kéo thả file PDF, DOCX tại đây<br />
                      (Tối đa 10MB/file)
                    </p>
                    <input type="file" ref={docInputRef} className="hidden" multiple onChange={handleDocChange} accept=".pdf,.doc,.docx" />
                  </div>
                </div>
              )}

              {/* File List */}
              <div className={`${readOnly ? "lg:col-span-12" : "lg:col-span-9"} space-y-4`}>
                {docFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {docFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-[24px] group hover:border-[#27592D]/20 hover:shadow-md hover:shadow-gray-100 transition-all">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                          <File className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate group-hover:text-[#27592D] transition-colors">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium text-gray-400">{file.size}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="text-xs font-medium text-gray-400">{file.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handlePreview(file)}
                            title="Xem tài liệu"
                            className="p-2.5 text-gray-400 hover:text-[#27592D] hover:bg-gray-50 rounded-xl transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {!readOnly && (
                            <button 
                              type="button" 
                              onClick={() => setDocFiles(prev => prev.filter(f => f.id !== file.id))}
                              title="Xóa tài liệu"
                              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[40px] p-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-200 mb-4 shadow-sm">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium italic">Chưa có tài liệu nào được đính kèm</p>
                    <p className="text-xs text-gray-300 mt-1">Vui lòng tải lên giấy phép kinh doanh hoặc các hồ sơ pháp lý liên quan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 sm:gap-6 pt-10 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => navigate("/admin/companies")} 
            className="w-full sm:w-auto px-8 py-3.5 text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            Hủy bỏ
          </button>
          {!readOnly && (
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto px-12 py-3.5 bg-[#27592D] text-white rounded-[20px] font-bold shadow-xl shadow-[#27592D]/20 hover:bg-[#1f4523] hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                mode === "add" ? "Tạo công ty" : "Lưu thay đổi"
              )}
            </button>
          )}
        </div>
      </form>

      <DocumentPreviewModal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        file={previewFile} 
      />
    </div>
  );
};

export default CompanyForm;
