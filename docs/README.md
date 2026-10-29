# Tài Liệu Kiến Trúc Hệ Thống IEEE SMC 2027

Hệ thống Website và Quản trị Hội nghị Quốc tế **IEEE SMC 2027** được xây dựng theo kiến trúc **Fullstack Next.js 16 + Prisma ORM + MinIO Object Storage**, tách biệt rõ ràng giữa môi trường **Development** và **Production**.

---

## 1. Cấu Trúc Thư Mục Dự Án

```text
ieee-smc-2027/
├── docs/                                 # Tài liệu kỹ thuật, môi trường, dịch vụ và đặc tả
│   ├── README.md                         # Tổng quan kiến trúc dự án
│   ├── DATABASE.md                       # Lược đồ cơ sở dữ liệu, ERD và phân quyền
│   ├── ENVIRONMENT.md                    # Cấu hình Development & Production (.env, Docker)
│   ├── SERVICES.md                       # Đặc tả các Service Templates
│   └── SPECIFICATION_AND_QUESTIONS.md    # Đặc tả nghiệp vụ & Câu hỏi làm rõ dữ liệu
├── prisma/
│   ├── schema.prisma                     # Lược đồ cơ sở dữ liệu PostgreSQL
│   └── seed.ts                           # Dữ liệu khởi tạo mặc định
├── public/                               # Tài nguyên tĩnh của giao diện
├── src/
│   ├── config/
│   │   └── env.ts                        # Quản lý cấu hình biến môi trường tập trung
│   ├── types/
│   │   └── index.ts                      # Kiểu dữ liệu dùng chung toàn hệ thống
│   ├── lib/
│   │   ├── index.ts                      # Điểm xuất tập trung toàn bộ tiện ích @/lib
│   │   ├── utils.ts                      # Tiện ích xử lý chuỗi, slug, tiền tệ, ngày giờ
│   │   ├── api-helper.ts                 # Tiện ích chuẩn hóa phản hồi API, Cookie và quyền Admin
│   │   ├── prisma.ts                     # Singleton kết nối Prisma ORM
│   │   ├── minio.ts                      # Client kết nối MinIO chuẩn AWS Signature V4
│   │   ├── auth.ts                       # Tiện ích mã hóa JWT, PBKDF2, OTP, Google OAuth
│   │   └── conference-registration.ts    # Cấu hình bảng phí và mã VietQR
│   ├── services/                         # Tầng nghiệp vụ tách biệt
│   │   ├── index.ts                      # Điểm xuất tập trung tất cả dịch vụ
│   │   ├── storage.service.ts            # Lưu trữ tệp tin MinIO và tối ưu ảnh Sharp
│   │   ├── auth.service.ts               # Xác thực Google OAuth, Email OTP, Mật khẩu
│   │   ├── registration.service.ts       # Quản lý đăng ký đại biểu và tính phí
│   │   ├── payment.service.ts            # VietQR, cổng thẻ quốc tế và đối soát tự động
│   │   ├── document.service.ts           # Xuất Phiếu thu, Hóa đơn và Thư hỗ trợ Visa
│   │   ├── email.service.ts              # Gửi thư xác nhận và chiến dịch hàng loạt
│   │   ├── checkin.service.ts            # Sinh mã QR thẻ đại biểu và quét điểm danh
│   │   └── cms.service.ts                # Quản trị nội dung trang, bài viết, menu
│   ├── app/                              # Next.js App Router
│   │   ├── api/                          # RESTful API Routes gọi vào tầng Services
│   │   ├── admin/                        # Phân hệ Quản trị CMS & Đối soát
│   │   ├── registration/                 # Cổng đăng ký đại biểu
│   │   ├── portal/                       # Trang hồ sơ cá nhân đại biểu
│   │   └── page.tsx                      # Trang chủ hội nghị
│   └── components/                       # Các thành phần giao diện tái sử dụng
├── .env.example                          # Mẫu cấu hình biến môi trường chuẩn
├── .env.development.example              # Mẫu cấu hình dành cho Development
├── .env.production.example               # Mẫu cấu hình dành cho Production
├── docker-compose.dev.yml                # Hạ tầng Docker локаl gồm PostgreSQL & MinIO
└── docker-compose.yml                    # Hạ tầng Docker Production gồm Web App & MinIO
```

---

## 2. Nguyên Tắc Thiết Kế Cốt Lõi

1. **Fullstack Prisma ORM:** Toàn bộ truy vấn dữ liệu người dùng, bài viết, cấu hình trang, đơn đăng ký và đối soát đều đi qua `src/lib/prisma.ts` và tầng `src/services/`.
2. **MinIO Object Storage:** Toàn bộ tệp tải lên như ảnh bài viết, ảnh thẻ đại biểu, bản chụp hộ chiếu, phiếu thu và thư mời Visa được lưu trữ trên MinIO theo phân vùng thư mục `public/*` và `private/*`.
3. **Xác Thực Không Phụ Thuộc WeChat:** Đã loại bỏ hoàn toàn tích hợp WeChat. Hệ thống sử dụng 3 phương thức xác thực: **Email OTP**, **Email & Mật khẩu**, và **Google OAuth**.
4. **Tối Ưu Tường Lửa Trung Quốc:** Đại biểu từ Trung Quốc có thể đăng ký, nhận mã OTP qua Email, xem mã QR thẻ đại biểu sinh trực tiếp trên máy chủ mà không phụ thuộc vào dịch vụ Google phía trình duyệt.
