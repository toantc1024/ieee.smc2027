# Tài Liệu Tầng Dịch Vụ & Lưu Trữ MinIO

Toàn bộ logic nghiệp vụ của hệ thống được đóng gói thành các Service Templates đặt tại `src/services/` và xuất tập trung qua [src/services/index.ts](file:///Users/macos/ieee-smc-2027/src/services/index.ts).

---

## 1. Danh Mục Service Templates

### 1.1. `storageService` — Lưu trữ đối tượng MinIO
- **Tệp nguồn:** [src/services/storage.service.ts](file:///Users/macos/ieee-smc-2027/src/services/storage.service.ts)
- **Client nền tảng:** [src/lib/minio.ts](file:///Users/macos/ieee-smc-2027/src/lib/minio.ts) ký xác thực chuẩn AWS Signature V4.
- **Chức năng chính:**
  - `uploadFile`: Tải tệp lên bucket `ieee-smc-2027`, tự động sinh ảnh thu nhỏ làm mờ bằng Sharp cho tệp hình ảnh. Ở chế độ Development, nếu container MinIO chưa bật, dịch vụ tự động lưu dự phòng vào `public/uploads`. Ở chế độ Production, bắt buộc ghi vào MinIO.
  - `getFileBuffer`: Đọc luồng dữ liệu tệp từ MinIO để phục vụ qua API Proxy `/api/images/[...path]`.
  - `deleteFile`: Xóa tệp trên MinIO.
  - `getPresignedDownloadUrl`: Tạo đường dẫn tải tệp có thời hạn cho các tài liệu bảo mật như ảnh hộ chiếu, phiếu thu, thư hỗ trợ Visa.
- **Phân vùng thư mục trên Bucket:**
  - `public/uploads`: Ảnh bài viết, banner CMS
  - `public/avatars`: Ảnh thẻ đại biểu
  - `private/passports`: Ảnh chụp hộ chiếu đại biểu
  - `private/invoices`: Phiếu thu và hóa đơn điện tử
  - `private/visa-letters`: Thư hỗ trợ xin Visa

### 1.2. `authService` — Xác thực người dùng & Quản trị
- **Tệp nguồn:** [src/services/auth.service.ts](file:///Users/macos/ieee-smc-2027/src/services/auth.service.ts)
- **Chức năng chính:**
  - Hỗ trợ 3 phương thức: **Email OTP**, **Email & Mật khẩu**, **Google OAuth**.
  - Quản lý phiên JWT qua `httpOnly` cookie, kiểm tra quyền `ADMIN` và đồng bộ tài khoản vào bảng `users` qua Prisma.

### 1.3. `registrationService` — Đăng ký đại biểu
- **Tệp nguồn:** [src/services/registration.service.ts](file:///Users/macos/ieee-smc-2027/src/services/registration.service.ts)
- **Chức năng chính:**
  - Sinh mã tham dự duy nhất định dạng `SMC27-XXXXXX`.
  - Tính lệ phí tự động theo 4 nhóm: `AUTHOR`, `IEEE_MEMBER`, `STUDENT`, `REGULAR` bằng `VND` hoặc `USD`.
  - Bắt buộc kiểm tra mã bài báo đối với nhóm `AUTHOR`.
  - Tra cứu hồ sơ theo mã đăng ký hoặc email, lọc danh sách cho Admin.

### 1.4. `paymentService` — Thanh toán & Đối soát tự động
- **Tệp nguồn:** [src/services/payment.service.ts](file:///Users/macos/ieee-smc-2027/src/services/payment.service.ts)
- **API Webhook:** [src/app/api/payment/webhook/route.ts](file:///Users/macos/ieee-smc-2027/src/app/api/payment/webhook/route.ts)
- **Chức năng chính:**
  - Tạo mã QR chuyển khoản tự động VietQR kèm cú pháp `SMC2027 SMC27XXXXXX`.
  - `reconcileBankTransaction`: Tự động bóc tách mã đăng ký từ nội dung biến động số dư ngân hàng, kiểm tra số tiền và chuyển trạng thái sang `PAID` theo thời gian thực.
  - Khung tích hợp sẵn cho cổng thanh toán thẻ quốc tế.

### 1.5. `documentService` — Phiếu thu & Thư hỗ trợ Visa
- **Tệp nguồn:** [src/services/document.service.ts](file:///Users/macos/ieee-smc-2027/src/services/document.service.ts)
- **API Route:** [src/app/api/registration/documents/route.ts](file:///Users/macos/ieee-smc-2027/src/app/api/registration/documents/route.ts)
- **Chức năng chính:**
  - `generatePaymentReceipt`: Xuất phiếu xác nhận nộp tiền cho đại biểu đã thanh toán và lưu trữ vào MinIO `private/invoices`.
  - `generateVisaSupportLetter`: Xuất thư mời hỗ trợ làm thủ tục Visa cho đại biểu quốc tế đã hoàn tất nghĩa vụ tài chính và lưu vào MinIO `private/visa-letters`.

### 1.6. `emailService` — Gửi thư tự động & Chiến dịch hàng loạt
- **Tệp nguồn:** [src/services/email.service.ts](file:///Users/macos/ieee-smc-2027/src/services/email.service.ts)
- **Chức năng chính:**
  - Gửi email xác nhận ngay khi đại biểu đăng ký hoặc hoàn tất thanh toán.
  - `sendBroadcastCampaign`: Gửi thông báo hàng loạt theo từng tệp đối tượng đại biểu.

### 1.7. `checkInService` — Mã QR Thẻ đại biểu & Điểm danh
- **Tệp nguồn:** [src/services/checkin.service.ts](file:///Users/macos/ieee-smc-2027/src/services/checkin.service.ts)
- **Chức năng chính:**
  - Sinh mã QR trực tiếp từ máy chủ dưới dạng Base64, hiển thị tức thì tại Trung Quốc mà không cần CDN bên ngoài.
  - Quét và xác nhận điểm danh tại hội trường, ghi nhận thời điểm `checkedInAt`.

### 1.8. `cmsService` — Quản trị Nội dung Fullstack Prisma
- **Tệp nguồn:** [src/services/cms.service.ts](file:///Users/macos/ieee-smc-2027/src/services/cms.service.ts)
- **Chức năng chính:**
  - Quản lý cấu trúc cây trang `Page`, bài viết tin tức `Post`, và cấu hình thanh điều hướng `Setting` hoàn toàn bằng Prisma ORM.
