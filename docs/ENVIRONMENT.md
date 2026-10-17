# Quản Lý Môi Trường Development & Production

Tài liệu này quy định cấu trúc biến môi trường `.env` và cách vận hành hạ tầng giữa môi trường phát triển và môi trường triển khai thực tế.

---

## 1. Phân Tách Tệp Cấu Hình

| Tệp cấu hình | Mục đích sử dụng | Lưu Git |
| :--- | :--- | :--- |
| `.env` | Cấu hình đang chạy tại máy cục bộ | Không |
| `.env.example` | Mẫu chuẩn tổng quát cho toàn bộ biến môi trường | Có |
| `.env.development.example` | Mẫu chuẩn cho môi trường Development | Có |
| `.env.production.example` | Mẫu chuẩn cho môi trường Production | Có |

Tất cả các biến môi trường được đọc và kiểm tra kiểu dữ liệu tập trung tại [src/config/env.ts](file:///Users/macos/ieee-smc-2027/src/config/env.ts). Không đọc rải rác `process.env` trực tiếp trong các tầng nghiệp vụ.

---

## 2. Cấu Trúc 6 Nhóm Biến Môi Trường

### Nhóm 1: Runtime & Ứng dụng
- `NODE_ENV`: `development` hoặc `production`
- `APP_ENV`: `development` hoặc `production`
- `NEXT_PUBLIC_APP_URL`: Địa chỉ gốc của hệ thống

### Nhóm 2: Cơ sở dữ liệu Prisma
- `DATABASE_URL`: Chuỗi kết nối PostgreSQL dùng cho Prisma Client

### Nhóm 3: Bảo mật & Xác thực
- `JWT_SECRET`: Khóa bí mật ký phiên đăng nhập HS256
- `SESSION_COOKIE_NAME`: Tên cookie lưu phiên đăng nhập
- `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD`: Tài khoản quản trị viên gốc
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Thông tin xác thực Google OAuth

### Nhóm 4: Lưu trữ tệp tin MinIO
- `MINIO_ENDPOINT`: Địa chỉ máy chủ MinIO
- `MINIO_PORT`: Cổng kết nối S3 API, mặc định `9000`
- `MINIO_USE_SSL`: `true` trên Production, `false` dưới Local
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`: Tài khoản truy cập MinIO
- `MINIO_BUCKET`: Tên bucket lưu trữ, mặc định `ieee-smc-2027`
- `MINIO_REGION`: Phân vùng S3, mặc định `ap-southeast-1`
- `MINIO_PUBLIC_URL`: Đường dẫn công khai tới bucket

### Nhóm 5: Dịch vụ Email SMTP
- `EMAIL_DEV_MODE`: Khi đặt `true`, mã OTP và nội dung thư được in ra terminal để kiểm thử nhanh
- `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`

### Nhóm 6: Thanh toán & Đối soát Ngân hàng
- `VIETQR_BANK_ID`, `VIETQR_BANK_NAME`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`, `VIETQR_SWIFT_BIC`
- `PAYMENT_WEBHOOK_SECRET`: Khóa xác thực webhook gạch nợ tự động từ ngân hàng
- `CARD_GATEWAY_PROVIDER`, `CARD_GATEWAY_PUBLIC_KEY`, `CARD_GATEWAY_SECRET_KEY`, `CARD_GATEWAY_WEBHOOK_SECRET`

---

## 3. Khởi Chạy Theo Môi Trường

### Môi trường Development
1. Khởi chạy PostgreSQL và MinIO cục bộ:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
   - MinIO S3 API: `http://localhost:9000`
   - MinIO Web Console: `http://localhost:9001`
2. Đồng bộ lược đồ Prisma và chạy ứng dụng:
   ```bash
   pnpm exec prisma db push
   pnpm dev
   ```

### Môi trường Production
1. Sao chép `.env.production.example` thành `.env` trên máy chủ và điền đầy đủ khóa bảo mật thực tế.
2. Khởi chạy toàn bộ cụm ứng dụng và MinIO:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```
3. Chạy迁移 cơ sở dữ liệu chính thức:
   ```bash
   pnpm exec prisma migrate deploy
   ```
