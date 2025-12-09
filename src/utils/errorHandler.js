const ERROR_MAP = {
  "bad credentials": "Email hoặc mật khẩu không đúng.",
  "invalid password": "Mật khẩu không hợp lệ.",
  "user not found": "Tài khoản không tồn tại.",
  "locked": "Tài khoản đã bị khóa.",
  "disabled": "Tài khoản bị vô hiệu hóa.",
  "email exists": "Email đã được sử dụng.",
  "duplicate email": "Email đã tồn tại.",
  "phone exists": "Số điện thoại đã được sử dụng.",
  "forbidden": "Bạn không có quyền thực hiện thao tác này.",
  "not allowed": "Bạn không được phép truy cập.",
  "internal server": "Hệ thống gặp sự cố. Vui lòng thử lại sau.",
  "server error": "Hệ thống gặp sự cố. Vui lòng thử lại sau.",
};

export const getUserFriendlyError = (apiMessage = "") => {
  const msg = apiMessage.toLowerCase();
  for (const key in ERROR_MAP) {
    if (msg.includes(key)) return ERROR_MAP[key];
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại!";
};