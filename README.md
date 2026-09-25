# Contra 2D: Chiến Binh Tri Thức (Retro Arcade 16:9)

Trò chơi bắn súng Contra 2D phong cách pixel retro cổ điển kết hợp cơ chế bắn 8 hướng, hệ thống nâng cấp vũ khí đa dạng và vượt chướng ngại vật bằng câu hỏi trắc nghiệm kiến thức đa môn học, tích hợp bảng xếp hạng điểm cao dựa trên số câu trả lời đúng.

---

## 🚀 Hướng Dẫn Deploy Lên GitHub Pages (1-Click)

Dự án đã được tổ chức dưới dạng **Pure HTML5 / CSS3 / JavaScript (ES Module)** chuẩn tĩnh, không phụ thuộc server, sẵn sàng chạy ngay:

### Cách 1: Deploy trực tiếp từ GitHub Repository (Không cần cài đặt gì)
1. Tạo một repository mới trên GitHub và push mã nguồn này lên nhánh `main`.
2. Vào tab **Settings** của repository trên GitHub.
3. Ở menu bên trái, chọn mục **Pages**.
4. Tại mục **Build and deployment** -> **Branch**:
   - Chọn nhánh `main`
   - Chọn thư mục `/ (root)`
   - Nhấn **Save**.
5. Đợi khoảng 1-2 phút, GitHub sẽ cung cấp đường link website trực tiếp (ví dụ: `https://<ten-user>.github.io/<ten-repo>/`).

---

### Cách 2: Chạy hoặc Build trên máy cá nhân (Local Dev)
```bash
# Cài đặt công cụ (tuỳ chọn)
npm install

# Khởi chạy server kiểm thử
npm run dev

# Đóng gói ra thư mục dist
npm run build
```

---

## 🎮 Phím Điều Khiển

- **A / D hoặc Mũi tên Trái / Phải**: Di chuyển trái / phải
- **W hoặc Mũi tên Lên**: Ngắm bắn thẳng lên trời
- **S hoặc Mũi tên Xuống**: Nằm rạp né đạn (Crouch / Prone)
- **W + A / W + D**: Bắn chéo góc 45 độ
- **SPACE (Phím cách)**: Nhảy nhào lộn (Somersault Jump)
- **J / Z / Chuột Trái**: Bắn súng liên thanh
- **Hỗ trợ Bàn Điều Khiển Ảo**: Nút điều khiển ảo D-Pad 8 hướng và nút nhảy/bắn trên màn hình cảm ứng hoặc chuột.

---

## 🌟 Tính Năng Nổi Bật

- **Tỉ lệ chuẩn 16:9 Arcade HD**: Tự động co giãn theo tỉ lệ 16:9 ở mọi kích thước màn hình.
- **6 mạng khởi đầu**: Giúp người chơi thoải mái trải nghiệm chiến dịch.
- **Kho vũ khí Contra phong phú**: [M] Machine Gun, [S] Spread Gun 5-7 tia toả, [L] Laser xuyên thấu, [F] Cầu lửa nổ, [H] Tên lửa tự tìm mục tiêu, [B] Khiên bất tử.
- **Chướng ngại vật tri thức**: Gồm 6 môn học (Toán học, Khoa học, Lịch sử, Địa lý, Tiếng Anh, Tin học) và Tổng hợp đa môn. Vượt qua cổng bằng cách trả lời đúng, trả lời sai sẽ nhận gợi ý để làm lại đến khi đúng.
- **Bảng xếp hạng**: Ưu tiên xếp hạng số 1 theo **Số câu trả lời đúng (🎯 CÂU ĐÚNG)** lưu trữ trực tiếp trên trình duyệt.
