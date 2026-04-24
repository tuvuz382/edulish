-- ============================================================
--  EDULISH — Script khởi tạo cơ sở dữ liệu
--  Chạy file này trong phpMyAdmin hoặc MySQL Workbench
-- ============================================================

-- Tạo database (nếu chưa có) và chọn nó
CREATE DATABASE IF NOT EXISTS edulish
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edulish;

-- ─────────────────────────────────────────
-- Xóa bảng cũ (nếu có) theo thứ tự FK
-- ─────────────────────────────────────────
DROP TABLE IF EXISTS class_members;
DROP TABLE IF EXISTS class_teachers;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS users;

-- ─────────────────────────────────────────
-- Bảng USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  -- password được hash bằng bcrypt (cost=10)
  -- Giá trị seed dưới đây đều tương ứng với plaintext: "Password@123"
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- Bảng CLASSES
-- ─────────────────────────────────────────
CREATE TABLE classes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  level      ENUM('Beginner','Elementary','Intermediate','Upper-Intermediate','Advanced') NOT NULL,
  room       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- Bảng CLASS_TEACHERS (giáo viên ↔ lớp)
-- ─────────────────────────────────────────
CREATE TABLE class_teachers (
  class_id   INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (class_id, user_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- Bảng CLASS_MEMBERS (học sinh ↔ lớp)
-- ─────────────────────────────────────────
CREATE TABLE class_members (
  class_id   INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  joined_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, user_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- Bảng MATERIALS (Tài liệu học tập)
-- ─────────────────────────────────────────
CREATE TABLE materials (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  url         VARCHAR(500) NOT NULL,
  type        ENUM('pdf','audio','video','exercise') NOT NULL,
  level       ENUM('Beginner','Elementary','Intermediate','Upper-Intermediate','Advanced') NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  SEED DATA — Dữ liệu mẫu
--  Mật khẩu chung: Password@123
--  Hash bcrypt (cost 10) của "Password@123":
--  $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  ← ví dụ
--  Dùng hash thực dưới đây (generate bằng bcrypt online)
-- ============================================================

-- ── 1 Admin ──────────────────────────────
INSERT INTO users (name, email, password, role) VALUES
(
  'Admin Hệ Thống',
  'admin@edulish.com',
  '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W',
  'admin'
);

-- ── 3 Giáo viên ──────────────────────────
INSERT INTO users (name, email, password, role) VALUES
(
  'Trần Thị Lan',
  'lan.tran@edulish.com',
  '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W',
  'teacher'
),
(
  'Nguyễn Văn Bình',
  'binh.nguyen@edulish.com',
  '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W',
  'teacher'
),
(
  'Phạm Thị Hoa',
  'hoa.pham@edulish.com',
  '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W',
  'teacher'
);

-- ── 15 Học sinh ───────────────────────────
INSERT INTO users (name, email, password, role) VALUES
('Nguyễn Văn An',       'an.nguyen@student.edulish.com',       '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Trần Thị Bảo',        'bao.tran@student.edulish.com',        '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Lê Minh Châu',        'chau.le@student.edulish.com',         '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Phạm Thị Diệu',       'dieu.pham@student.edulish.com',       '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Hoàng Văn Em',        'em.hoang@student.edulish.com',        '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Võ Thị Phương',       'phuong.vo@student.edulish.com',       '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Đặng Minh Giang',     'giang.dang@student.edulish.com',      '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Bùi Thị Hạnh',        'hanh.bui@student.edulish.com',        '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Ngô Văn Ích',         'ich.ngo@student.edulish.com',         '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Dương Thị Kim',       'kim.duong@student.edulish.com',       '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Lý Văn Long',         'long.ly@student.edulish.com',         '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Mai Thị Hương',       'huong.mai@student.edulish.com',       '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Đinh Văn Nam',        'nam.dinh@student.edulish.com',        '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Trịnh Thị Oanh',      'oanh.trinh@student.edulish.com',      '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student'),
('Hồ Văn Phúc',         'phuc.ho@student.edulish.com',         '$2b$10$SN73aDw7isXr1wQDexlMCeTkSzN0m6mRsL7NL12dum8fQNf5XjR2W', 'student');

-- ── 3 Lớp học ────────────────────────────
INSERT INTO classes (name, level, room) VALUES
('Lớp A1 — Beginner',      'Beginner',     'Phòng 101'),
('Lớp B2 — Intermediate',  'Intermediate', 'Phòng 202'),
('Lớp C3 — Advanced',      'Advanced',     'Phòng 303');

-- ── Phân công giáo viên ──────────────────
-- Lớp A1 (id=1) → Cô Lan (id=2)
-- Lớp B2 (id=2) → Thầy Bình (id=3)
-- Lớp C3 (id=3) → Cô Hoa (id=4)
INSERT INTO class_teachers (class_id, user_id) VALUES
(1, 2),
(2, 3),
(3, 4);

-- ── Xếp học sinh vào lớp ─────────────────
-- Lớp A1 (5 học sinh đầu: id 5–9)
INSERT INTO class_members (class_id, user_id) VALUES
(1, 5), (1, 6), (1, 7), (1, 8), (1, 9);

-- Lớp B2 (5 học sinh tiếp: id 10–14)
INSERT INTO class_members (class_id, user_id) VALUES
(2, 10), (2, 11), (2, 12), (2, 13), (2, 14);

-- Lớp C3 (5 học sinh cuối: id 15–19)
INSERT INTO class_members (class_id, user_id) VALUES
(3, 15), (3, 16), (3, 17), (3, 18), (3, 19);

-- ── Tài liệu học tập ─────────────────────
INSERT INTO materials (name, description, url, type, level) VALUES
('Grammar Book Level 1', 'Sách ngữ pháp cơ bản cho người mới bắt đầu', 'https://example.com/grammar-1.pdf', 'pdf', 'Beginner'),
('Basic Listening Practice', 'Luyện nghe các hội thoại đơn giản', 'https://example.com/listen-1.mp3', 'audio', 'Beginner'),
('English Conversation 101', 'Video tình huống giao tiếp thông dụng', 'https://example.com/video-1.mp4', 'video', 'Elementary'),
('Vocabulary Quiz 1', 'Bài tập trắc nghiệm từ vựng theo chủ đề', 'https://example.com/quiz-1', 'exercise', 'Intermediate');
