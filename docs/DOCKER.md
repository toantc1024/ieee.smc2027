# Hướng Dẫn Vận Hành Docker & MinIO

Hệ thống hỗ trợ đóng gói đầy đủ bằng Docker cho cả môi trường **Development** và **Production**.

---

## 1. Các Tệp Cấu Hình Docker

| Tệp | Vai trò |
| :--- | :--- |
| [Dockerfile](file:///Users/macos/ieee-smc-2027/Dockerfile) | Multi-stage Dockerfile gồm 5 tầng: `base`, `deps`, `development`, `builder`, `runner` |
| [docker/entrypoint.sh](file:///Users/macos/ieee-smc-2027/docker/entrypoint.sh) | Script khởi động container Production, hỗ trợ tự động chạy Prisma migration khi `AUTO_MIGRATE=true` |
| [.dockerignore](file:///Users/macos/ieee-smc-2027/.dockerignore) | Loại trừ `.env`, `node_modules`, `.next` để bảo mật khóa bí mật và giảm kích thước image |
| [docker-compose.dev.yml](file:///Users/macos/ieee-smc-2027/docker-compose.dev.yml) | Hạ tầng Development: PostgreSQL 16 + MinIO + tự động tạo bucket `ieee-smc-2027` |
| [docker-compose.yml](file:///Users/macos/ieee-smc-2027/docker-compose.yml) | Hạ tầng Production: Next.js Standalone + PostgreSQL 16 + MinIO |

---

## 2. Chế Độ Development

### Cách 1: Chạy Hạ tầng Database & MinIO bằng Docker, chạy Next.js trên máy thật
```bash
pnpm docker:dev:up
pnpm db:push
pnpm dev
```
- **Ứng dụng Web:** `http://localhost:3000`
- **MinIO S3 API:** `http://localhost:9000`
- **MinIO Console:** `http://localhost:9001` — Tài khoản: `minioadmin` / `minioadmin123`
- **PostgreSQL:** `localhost:5432` — Tài khoản: `postgres` / `postgres`

### Cách 2: Chạy toàn bộ trong Docker kèm Hot-Reload
```bash
pnpm docker:dev:full
```

### Dừng cụm Development
```bash
pnpm docker:dev:down
```

---

## 3. Chế Độ Production

1. Chuẩn bị tệp `.env` từ mẫu [.env.production.example](file:///Users/macos/ieee-smc-2027/.env.production.example).
2. Khởi chạy toàn bộ cụm Production:
   ```bash
   pnpm docker:prod:up
   ```
3. Nếu muốn container tự động cập nhật bảng Prisma khi khởi động, bật biến `AUTO_MIGRATE=true`:
   ```bash
   AUTO_MIGRATE=true docker compose -f docker-compose.yml up -d --build
   ```
4. Kiểm tra trạng thái các container:
   ```bash
   docker compose -f docker-compose.yml ps
   ```
