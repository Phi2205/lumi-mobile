# Quy trình Triển khai Tính năng mới (Feature Implementation Workflow)

Quy trình này hướng dẫn từng bước để phát triển một tính năng mới trong dự án `lumi-mobile`, đảm bảo mã nguồn gọn gàng, có tổ chức và tuân thủ kiến trúc.

---

## 🧭 Quy trình 5 bước phát triển tính năng

```
[BƯỚC 1: Khai báo Types] ➔ [BƯỚC 2: Viết Service] ➔ [BƯỚC 3: Tạo Hook] ➔ [BƯỚC 4: Tạo Component] ➔ [BƯỚC 5: Ghép Màn hình (App Router)]
```

### 📝 Bước 1: Khai báo Types & Interfaces
Định nghĩa cấu trúc dữ liệu trước khi viết logic để đảm bảo an toàn kiểu (type safety).
- **Vị trí**: Tạo tệp `src/types/<feature>.types.ts`.
- **Ví dụ**: Định nghĩa kiểu dữ liệu cho tính năng Bài viết (`posts`).

### 🔌 Bước 2: Tạo Service / API Repository
Viết hàm gọi API thực tế để giao tiếp với máy chủ.
- **Vị trí**: Tạo tệp `src/services/<feature>.service.ts`.
- Sử dụng `axiosInstance` để thực hiện request.

### 🪝 Bước 3: Tạo Custom Hooks
Bọc các dịch vụ API bằng custom React hook (ưu tiên kết hợp React Query / TanStack Query) để quản lý state và bộ nhớ đệm (caching).
- **Vị trí**: Tạo tệp `src/hooks/use<Feature>.ts`.
- Không nhét logic quản lý state hoặc fetch dữ liệu phức tạp trực tiếp bên trong View/Screen.

### 🧱 Bước 4: Xây dựng các Component giao diện nhỏ (Sub-components)
Chia nhỏ giao diện thành các component độc lập, tái sử dụng được.
- **Vị trí**: Tạo thư mục hoặc tệp trong `src/components/`.
- Sử dụng các token thiết kế (`Spacing`, `Colors`) từ `@/constants/theme.ts`.

### 🗺️ Bước 5: Tạo định tuyến màn hình (App Router Screens)
Tạo tệp định tuyến chính và ghép các component lại với nhau.
- **Vị trí**: Tạo hoặc cập nhật tệp trong `src/app/<route>.tsx`.
- Gọi custom hook từ Bước 3 để nhận dữ liệu.
- Truyền dữ liệu vào các component giao diện nhỏ từ Bước 4.
