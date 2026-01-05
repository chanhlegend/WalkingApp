# Docker hướng dẫn (Backend + Frontend + Mongo)

## Thứ tự đóng gói (khuyến nghị)

1) Xác định app chạy gồm những service nào:
   - Backend (Node/Express) cổng 3000
   - MongoDB (DB)
   - Frontend (Vite build → Nginx)

2) Viết `Dockerfile` cho từng service (+ `.dockerignore`)

3) Build image

4) Run container (nên dùng Docker Compose để chạy đồng bộ)

## Chạy bằng Docker Compose

Từ thư mục `WalkingApp/`:

- Build + chạy:
  - `docker compose up --build`

- Chạy nền:
  - `docker compose up -d --build`

- Xem log:
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`
  - `docker compose logs -f mongo`

- Dừng:
  - `docker compose down`

- Dừng và xoá dữ liệu Mongo (cẩn thận mất DB):
  - `docker compose down -v`

## Cổng mặc định

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MongoDB: mongodb://localhost:27017

## Biến môi trường

File `docker-compose.yml` đã set sẵn:

- `MONGO_URI=mongodb://mongo:27017/walkingapp`

Nếu bạn cần thêm biến trong `Backend/.env` (JWT, mailer, Google OAuth...), hãy thêm vào `backend.environment` trong `docker-compose.yml` hoặc dùng `env_file:`.
