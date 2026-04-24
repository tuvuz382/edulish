# Hướng dẫn chạy Database Edulish

## Bước 1 — Chạy file SQL

1. Mở **phpMyAdmin** (thường là http://localhost/phpmyadmin)
2. Click tab **"SQL"** ở thanh trên
3. Mở file `database/schema.sql` bằng Notepad, **copy toàn bộ nội dung**
4. Paste vào ô SQL trong phpMyAdmin
5. Nhấn **"Go"** (hoặc Ctrl+Enter)

✅ Script sẽ tự động:
- Tạo database `edulish`
- Tạo 4 bảng: `users`, `classes`, `class_teachers`, `class_members`
- Chèn **19 người dùng** + **3 lớp học** với dữ liệu mẫu

---

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| ⚙️ Admin | `admin@edulish.com` | `Password@123` |
| 👩‍🏫 Giáo viên 1 | `lan.tran@edulish.com` | `Password@123` |
| 👩‍🏫 Giáo viên 2 | `binh.nguyen@edulish.com` | `Password@123` |
| 👩‍🏫 Giáo viên 3 | `hoa.pham@edulish.com` | `Password@123` |
| 🎓 Học sinh 1 | `an.nguyen@student.edulish.com` | `Password@123` |
| 🎓 Học sinh 2 | `bao.tran@student.edulish.com` | `Password@123` |
| *(+13 học sinh khác...)* | | |

---

## Bước 2 — Chạy ứng dụng

```bash
npm run dev
```

Truy cập: http://localhost:3000 → tự động redirect sang `/login`

---

## Cấu trúc API Auth

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/auth/login` | POST | Đăng nhập, trả JWT cookie |
| `/api/auth/logout` | POST | Đăng xuất, xóa cookie |
| `/api/auth/me` | GET | Lấy thông tin user hiện tại |
