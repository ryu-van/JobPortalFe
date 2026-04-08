import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/form/InputField";
import SelectField from "../../components/form/SelectField";
import BrandButton from "../../components/form/BrandButton";
import companyService from "../../services/companyService";
import { useToast } from "../../components/commons/ToastContext";
import Header from "../../components/commons/Header";
import AddressSelect from "../../components/commons/AddressSelect";
const RequestNewCompany = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState({
    person: "",
    email: "",
    phone: "",
  });

  const [company, setCompany] = useState({
    companyName: "",
    taxCode: "",
    street: "",
    city: "",
    provinceName: "",
    ward: "",
    communeName: "",
    industryId: "",
    requestedRole: "hr",
  });
  const [docFiles, setDocFiles] = useState([]);
  const [industries, setIndustries] = useState([]);

  const [errors, setErrors] = useState({});

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

  const updateCompany = (e) => {
    const { name, value } = e.target;
    setCompany((c) => ({ ...c, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const updateContact = (e) => {
    const { name, value } = e.target;
    setContact((c) => ({ ...c, [name]: value }));
    const map = {
      person: "contactPerson",
      email: "contactEmail",
      phone: "contactPhone",
    };
    setErrors((prev) => ({ ...prev, [map[name]]: "" }));
  };

  const handleAddressChange = (val) => {
    setCompany((prev) => ({
      ...prev,
      city: val.provinceCode,
      provinceName: val.provinceName,
      ward: val.communeCode,
      communeName: val.communeName,
    }));
    setErrors((prev) => ({ ...prev, city: "", ward: "" }));
  };

  const validate = () => {
    const next = {};

    if (!contact.person)
      next.contactPerson = "Vui lòng nhập tên người đại diện";
    if (!contact.email)
      next.contactEmail = "Vui lòng nhập email người đại diện";
    else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(contact.email))
        next.contactEmail = "Email không hợp lệ";
    }
    if (!contact.phone)
      next.contactPhone = "Vui lòng nhập số điện thoại người đại diện";
    else {
      const phoneRe = /^[0-9+\-\s()]{8,20}$/;
      if (!phoneRe.test(contact.phone))
        next.contactPhone = "Số điện thoại không hợp lệ";
    }

    if (!company.companyName)
      next.companyName = "Tên công ty không được để trống";
    if (!company.taxCode) next.taxCode = "Mã số thuế không được để trống";
    if (!company.city) next.city = "Vui lòng chọn tỉnh/thành phố";
    if (!company.ward) next.ward = "Vui lòng chọn phường/xã";
    if (!company.street) next.street = "Vui lòng nhập địa chỉ chi tiết";

    return next;
  };

  const onSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      const address = {
        addressType: "HEADQUARTERS",
        provinceCode: company.city || "",
        provinceName: company.provinceName || "",
        communeCode: company.ward || "",
        communeName: company.communeName || "",
        detailAddress: company.street || "",
        isPrimary: true,
      };

      const payload = {
        contactPerson: contact.person,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        companyName: company.companyName,
        taxCode: company.taxCode,
        requestedRole: company.requestedRole,
        addressRequest: address
      };

      await companyService.createCompanyVerificationRequest(payload, docFiles);
      addToast("success", "Gửi yêu cầu xác thực công ty thành công!");
      navigate("/login");
    } catch (err) {
      addToast("error", err?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // UI
  return (
    <div className="h-screen overflow-auto bg-[#F7F7F2]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border p-10 md:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1F2D1F] mb-6">
              Thông tin công ty
            </h2>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#1F2D1F]">
                Thông tin người đại diện
              </h3>
              <InputField
                label="Tên người đại diện"
                name="person"
                value={contact.person}
                onChange={updateContact}
                error={errors.contactPerson}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Email người đại diện"
                  name="email"
                  value={contact.email}
                  onChange={updateContact}
                  error={errors.contactEmail}
                />
                <InputField
                  label="Số điện thoại người đại diện"
                  name="phone"
                  value={contact.phone}
                  onChange={updateContact}
                  error={errors.contactPhone}
                />
              </div>

              <h3 className="text-xl font-semibold text-[#1F2D1F]">
                Thông tin công ty
              </h3>
              <InputField
                label="Tên công ty"
                name="companyName"
                value={company.companyName}
                onChange={updateCompany}
                error={errors.companyName}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Mã số thuế"
                  name="taxCode"
                  value={company.taxCode}
                  onChange={updateCompany}
                  error={errors.taxCode}
                />
                <SelectField
                  label="Ngành nghề"
                  name="industryId"
                  options={industries}
                  value={company.industryId}
                  onChange={updateCompany}
                  error={errors.industryId}
                />
              </div>

              <AddressSelect
                value={{ provinceCode: company.city, communeCode: company.ward }}
                onChange={handleAddressChange}
                errors={errors}
              />

              <InputField
                label="Địa chỉ"
                name="street"
                value={company.street}
                onChange={updateCompany}
                placeholder="Số nhà, đường"
                error={errors.street}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài liệu đính kèm (nhiều file)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setDocFiles(Array.from(e.target.files || []))
                  }
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#27592D]/10 file:text-[#27592D] hover:file:bg-[#27592D]/20"
                />
                {docFiles.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {docFiles.map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span>{f.name}</span>
                        <button
                          type="button"
                          className="text-[#AA423A] hover:opacity-80"
                          onClick={() =>
                            setDocFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-4 left-4 right-4 z-[100] flex justify-between gap-3 md:left-6 md:right-6 md:bottom-6 pointer-events-none">
          <BrandButton
            fullWidth={false}
            className="px-5 py-2 md:px-6 pointer-events-auto"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </BrandButton>
          <BrandButton
            fullWidth={false}
            className="px-5 py-2 md:px-6 pointer-events-auto"
            disabled={submitting}
            onClick={onSubmit}
          >
            {submitting ? "Đang gửi..." : "Tạo và tiếp tục"}
          </BrandButton>
        </div>
      </div>
    </div>
  );
};

export default RequestNewCompany;
