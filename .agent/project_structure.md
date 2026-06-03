# Tiêu chuẩn Cấu trúc Thư mục Dự án (Project Structure Standard)

Tài liệu này quy định chi tiết cách tổ chức và phân chia thư mục/tệp tin trong dự án `lumi-mobile` để đảm bảo tính nhất quán, dễ bảo trì và dễ mở rộng.

---

## 🌳 Sơ đồ cấu trúc cây thư mục gốc

```text
lumi-mobile/
├── .agent/                  # Lưu trữ tiêu chuẩn và quy trình của AI Agent
├── .expo/                   # Thư mục cache và cấu hình tự động của Expo
├── assets/                  # Các tài nguyên tĩnh (fonts, images, icons)
├── src/                     # Toàn bộ mã nguồn chính của ứng dụng
│   ├── app/                 # Định tuyến Expo Router (File-based Routing)
│   ├── components/          # Các component giao diện dùng chung
│   ├── constants/           # Các hằng số, cấu hình Theme (Colors, Spacing)
│   ├── hooks/               # Custom React hooks (quản lý state & logic)
│   ├── services/            # Tầng gọi API và dịch vụ bên thứ ba (Axios)
│   ├── types/               # Các khai báo kiểu dữ liệu TypeScript (Interfaces/Types)
│   ├── utils/               # Các hàm tiện ích dùng chung (formatters, helpers)
│   └── global.css           # Cấu hình CSS toàn cục
├── scripts/                 # Các script bổ trợ cho phát triển (reset dự án,...)
├── app.json                 # Tệp tin cấu hình chính của Expo App
├── package.json             # Danh sách thư viện phụ thuộc và scripts chạy dự án
└── tsconfig.json            # Cấu hình trình biên dịch TypeScript
```

---

## 📂 Quy tắc chi tiết của từng thư mục

### 1. `src/app/` (Định tuyến màn hình)
Sử dụng mô hình File-based Routing của Expo Router:
- **Tệp `_layout.tsx`**: Khai báo cấu hình giao diện chung cho một nhóm màn hình (ví dụ: Stack, Tabs, Drawer).
- **Tệp `index.tsx`**: Trang mặc định khi mở thư mục/màn hình đó.
- **Thư mục dạng nhóm `(auth)/`**: Dùng dấu ngoặc đơn để nhóm các màn hình có cùng mục đích (ví dụ: đăng nhập, đăng ký) mà không làm ảnh hưởng đến đường dẫn URL/Route.

### 2. `src/components/` (Components dùng chung)
- Các component nền tảng nên đặt trực tiếp tại `src/components/` (ví dụ: `themed-text.tsx`, `themed-view.tsx`).
- Nếu component phức tạp hoặc chỉ phục vụ một tính năng nhất định, hãy tạo thư mục con đại diện cho tính năng đó.
  - Ví dụ: `src/components/auth/login-form.tsx`.

### 3. `src/constants/` (Hằng số & Cấu hình)
- Tất cả cấu hình liên quan đến hệ thống thiết kế (Design System) như mã màu, khoảng cách (margin, padding), font chữ mặc định phải được đặt tại `src/constants/theme.ts`.

### 4. `src/services/` (Tầng gọi API)
- Mỗi tính năng lớn nên có một tệp dịch vụ riêng (ví dụ: `src/services/user.service.ts`, `src/services/auth.service.ts`).
- Tệp `axiosInstance.ts` để cấu hình Base URL, timeout, đính kèm token và xử lý lỗi hệ thống/phản hồi chung.

### 5. `src/types/` (TypeScript Types)
- Các kiểu dữ liệu phản hồi từ API hoặc kiểu dùng chung trong ứng dụng nên đặt tại đây (ví dụ: `src/types/user.types.ts`).
- Tên tệp tin luôn có dạng `*.types.ts`.
