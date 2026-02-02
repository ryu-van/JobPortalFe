import React, { useEffect, useState } from "react";
import SelectField from "../form/SelectField";
import addressService from "../../services/addressService";

const AddressSelect = ({ value, onChange, disabled = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);

  const provinceCode = value?.provinceCode || "";
  const communeCode = value?.communeCode || "";

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await addressService.getProvinces();
      if (res.success) {
        const mapped = res.data.map((x) => ({
          value: String(x.code || x.province_code),
          label: x.name || x.province_name,
        }));
        setProvinces(mapped);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setCommunes([]);
      return;
    }

    const fetchCommunes = async () => {
      const res = await addressService.getCommunesByProvince(provinceCode);
      if (res.success) {
        const mapped = res.data.map((x) => ({
          value: String(x.code || x.ward_code),
          label: x.name || x.ward_name,
        }));
        setCommunes(mapped);
      }
    };
    fetchCommunes();
  }, [provinceCode]);

  return (
    <>
      <SelectField
        name="provinceCode"
        label="Tỉnh/Thành phố"
        value={provinceCode}
        onChange={(e) =>
          onChange({
            provinceCode: e.target.value,
            communeCode: "",
          })
        }
        options={provinces}
        placeholder="Chọn tỉnh/thành phố"
        disabled={disabled}
      />

      <SelectField
        name="communeCode"
        label="Phường/Xã"
        value={communeCode}
        onChange={(e) =>
          onChange({
            provinceCode,
            communeCode: e.target.value,
          })
        }
        options={communes}
        placeholder="Chọn phường/xã"
        disabled={disabled || !provinceCode}
      />
    </>
  );
};

export default AddressSelect;
