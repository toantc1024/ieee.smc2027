# Hướng Dẫn Docker & Tự Động Triển Khai (Auto-Deploy CI/CD)

Tài liệu hướng dẫn chạy dự án cục bộ với Docker, cơ chế lưu trữ & proxy ảnh nhanh không cần MinIO, và thiết lập tự động triển khai khi `git push`.

---

## 1. Chạy Dự Án Cục Bộ Với Docker

Dự án đã được cấu hình với **Multi-stage Dockerfile** tối ưu (`standalone` mode của Next.js + Alpine Linux + PNPM + Prisma + Sharp).

### Khởi chạy với Docker Compose:
```bash
# 1. Đảm bảo file .env có chứa DATABASE_URL và JWT_SECRET
cp .env.example .env # nếu chưa có

# 2. Build image và khởi động container ngầm
docker compose up -d --build

# 3. Xem nhật ký log đang chạy
docker compose logs -f

# 4. Dừng container khi không dùng
docker compose down
```
Ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 2. Lưu Trữ Ảnh Cục Bộ & Fast Image Proxy (Không Cần MinIO)

Để giữ hệ thống đơn giản, ổn định và tốc độ cao, hệ thống không dùng MinIO/S3 mà lưu trực tiếp trên ổ cứng với cơ chế mount volume và proxy thông minh:

### A. Volume Mount An Toàn
Trong `docker-compose.yml`, thư mục `./public/uploads` được mount vào container:
```yaml
volumes:
  - ./public/uploads:/app/public/uploads
```
👉 **Đặc điểm**: Mọi hình ảnh bạn tải lên qua Admin Dashboard hoặc Tiptap Editor sẽ nằm trực tiếp tại thư mục `./public/uploads` trên máy tính/VPS. Khi build lại container hoặc deploy phiên bản mới, **ảnh không bao giờ bị mất**.

### B. Fast Image Proxy (`/api/images/[...path]`)
Được tăng tốc bằng thư viện C++ **Sharp** và header HTTP Cache bất biến:
- Đường dẫn chuẩn: `/api/images/uploads/ten-anh.png`
- **Resize theo chiều rộng**: `/api/images/uploads/ten-anh.png?w=600`
- **Nén chất lượng**: `/api/images/uploads/ten-anh.png?w=800&q=75`
- **Chuyển đổi định dạng siêu nhẹ (WebP / AVIF)**: `?format=webp`
- **Tạo ảnh mờ placeholder (Blur Low Size)**: `?blur=10` hoặc `?blur=true`
- **Caching**: Phản hồi HTTP Header `Cache-Control: public, max-age=31536000, immutable` và `ETag` (trả về `304 Not Modified` ngay lập tức nếu trình duyệt đã có cache).

---

## 3. Thiết Lập Tự Động Triển Khai Khi Push Code (Push Auto-Deploy)

File GitHub Actions đã được tạo sẵn tại `.github/workflows/deploy.yml`. Mỗi khi bạn chạy:
```bash
git push origin main
```
GitHub Actions sẽ tự động:
1. Chạy kiểm tra TypeScript và build thử nghiệm để đảm bảo không có lỗi cú pháp.
2. Kết nối SSH vào VPS/Server của bạn.
3. Chạy `git pull origin main`.
4. Build lại Docker container với cache tối ưu và khởi động lại (`docker compose up -d`).
5. Chạy Prisma Migration (`npx prisma migrate deploy`) để cập nhật database Neon mà không làm mất dữ liệu.

---

### Các bước cài đặt một lần duy nhất trên GitHub:

#### Bước 1: Chuẩn bị VPS / Máy chủ (Ubuntu/Debian)
Trên máy chủ VPS của bạn:
```bash
# 1. Cài đặt Docker & Git nếu chưa có
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git

# 2. Tạo thư mục chứa dự án
sudo mkdir -p /var/www/ieee-smc-2027
sudo chown -R $USER:$USER /var/www/ieee-smc-2027

# 3. Clone source code lần đầu
git clone https://github.com/toantc1024/ieee.smc2027.git /var/www/ieee-smc-2027
cd /var/www/ieee-smc-2027
```

#### Bước 2: Tạo SSH Key cho GitHub Actions
Trên VPS:
```bash
# Tạo SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# Thêm public key vào authorized_keys của server
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# In private key để copy vào GitHub Secrets
cat ~/.ssh/github_deploy
```

#### Bước 3: Thêm GitHub Secrets vào Repo
Truy cập vào kho mã nguồn GitHub của bạn:
**Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

| Tên Secret | Giá Trị Ví Dụ | Ghi Chú |
|------------|--------------|---------|
| `SERVER_HOST` | `123.45.67.89` | Địa chỉ IP của máy chủ VPS |
| `SERVER_USER` | `root` hoặc `ubuntu` | Tên người dùng SSH |
| `SSH_PRIVATE_KEY` | *(Nội dung file `~/.ssh/github_deploy`)* | Khóa bí mật SSH |
| `SERVER_PORT` | `22` | Cổng SSH |
| `DEPLOY_PATH` | `/var/www/ieee-smc-2027` | Đường dẫn thư mục dự án trên VPS |
| `DATABASE_URL` | `postgresql://...` | Connection string Neon Postgres |
| `JWT_SECRET` | `chuoi-bi-mat-jwt-tren-32-ky-tu` | Chuỗi mã hóa JWT |

---

## 4. Hệ Thống Dynamic OpenGraph (OG) Style HCMUTE

Dự án tích hợp endpoint tạo ảnh mạng xã hội tự động tại:
`/api/og`

### Định dạng & Giao diện:
- Kích thước chuẩn Facebook, Zalo, LinkedIn, Twitter: **1200 × 630 px**.
- Cấu trúc 2 cột chuẩn thương hiệu HCMUTE:
  - **Cột trái**: Logo UTE + IEEE SMC 2027, Badge chuyên mục (Call for Papers, Keynotes...), Tiêu đề lớn in đậm nổi bật, Mô tả ngắn và thời gian địa điểm.
  - **Cột phải**: Card thẻ nổi 3D bo góc tròn màu xanh hoàng gia (`#115eff`), hiệu ứng ánh sáng gradient và ảnh đại diện bài viết.
- **Tùy biến linh hoạt qua tham số URL**:
  - `https://your-domain.com/api/og?title=Call+for+Papers&badge=AUTHOR+GUIDELINES`
  - Tự động gắn vào thẻ `<meta property="og:image">` trong `layout.tsx` và trang chi tiết bài viết.
