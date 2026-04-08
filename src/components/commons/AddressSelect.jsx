import React, { useEffect, useState } from "react";
import SelectField from "../form/SelectField";
import addressService from "../../services/addressService";

const AddressSelect = ({ 
  value, 
  onChange, 
  disabled = false, 
  errors = {}, 
  className = "",
  labels = { province: "Tỉnh/Thành phố", ward: "Phường/Xã" }
}) => {
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);

  const provinceCode = value?.provinceCode || "";
  const communeCode = value?.communeCode || "";

  useEffect(() => {
    let mounted = true;
    const fetchProvinces = async () => {
      try {
        const res = await addressService.getProvinces();
        if (res.success && mounted) {
          const mapped = res.data.map((x) => ({
            value: String(x.code || x.province_code),
            label: x.name || x.province_name,
          }));
          setProvinces(mapped);
        }
      } catch (err) {
        console.error("Fetch provinces error:", err);
      }
    };
    fetchProvinces();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setCommunes([]);
      return;
    }

    let mounted = true;
    const fetchCommunes = async () => {
      try {
        const res = await addressService.getCommunesByProvince(provinceCode);
        if (res.success && mounted) {
          const mapped = res.data.map((x) => ({
            value: String(x.code || x.ward_code),
            label: x.name || x.ward_name,
          }));
          setCommunes(mapped);
        }
      } catch (err) {
        console.error("Fetch communes error:", err);
      }
    };
    fetchCommunes();
    return () => { mounted = false; };
  }, [provinceCode]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 ${className}`}>
      <SelectField
        name="provinceCode"
        label={labels.province}
        value={provinceCode}
        onChange={(e) => {
          const selected = provinces.find(p => String(p.value) === String(e.target.value));
          onChange({
            ...value,
            provinceCode: e.target.value,
            provinceName: selected?.label || "",
            communeCode: "",
            communeName: "",
          });
        }}
        options={provinces}
        placeholder="Chọn tỉnh/thành phố"
        disabled={disabled}
        error={errors.city || errors.provinceCode}
        className="bg-gray-50 border-gray-100"
      />

      <SelectField
        name="communeCode"
        label={labels.ward}
        value={communeCode}
        onChange={(e) => {
          const selected = communes.find(c => String(c.value) === String(e.target.value));
          const selectedProvince = provinces.find(p => String(p.value) === String(provinceCode));
          onChange({
            provinceCode,
            provinceName: selectedProvince?.label || "",
            communeCode: e.target.value,
            communeName: selected?.label || "",
          });
        }}
        options={communes}
        placeholder="Chọn phường/xã"
        disabled={disabled || !provinceCode}
        error={errors.ward || errors.communeCode}
        className="bg-gray-50 border-gray-100"
      />
    </div>
  );
};

export default AddressSelect;
