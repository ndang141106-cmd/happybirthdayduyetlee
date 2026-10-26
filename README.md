# Hồ sơ mật Duyệt Lee

Website sinh nhật bằng HTML/CSS/JS thuần, không cần cài gì.

## Chạy trên máy
Mở file `index.html` bằng Chrome/Safari là xem được. (Nhạc và ảnh vẫn chạy khi mở trực tiếp.)

## Thêm / thay ảnh
1. Bỏ ảnh vào `assets/images/` (nên nén dưới ~500KB mỗi ảnh).
2. Mở `data.js`, tìm `gallery` và `portrait`, ghi đúng tên file.
   - Tên file phân biệt chữ hoa/thường: `Anh.JPG` khác `anh.jpg`.
3. Ảnh nào chưa có file sẽ hiện khung "ĐẶT ẢNH Ở…".
Ảnh cho timeline: điền `image: "assets/images/ten.jpg"` ở mốc tương ứng.

## Sửa nội dung
Mọi chữ (thư, timeline, lời tiên tri, chỉ số, thông tin hồ sơ) nằm trong `data.js`, có chú thích.
Đổi màu: sửa các biến ở đầu `style.css`.

## Thêm nhạc
Bỏ file `theme.mp3` vào `assets/music/`. Nút "Bật nhạc" tự hiện, nhạc không tự phát.

## Đưa lên mạng
Netlify Drop: vào app.netlify.com/drop, kéo cả thư mục `birthday-duyet-lee` vào, nhận link ngay.
Hoặc GitHub Pages / Cloudflare Pages / Vercel. Muốn tạo QR: dán link vào qrcode-monkey.com.
