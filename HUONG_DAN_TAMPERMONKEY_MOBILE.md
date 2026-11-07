# 📱 Hướng Dẫn Cài Đặt & Sử Dụng IUH DKHP Pro (`iuh-dkhp-pro.user.js`) Trên Tampermonkey Mobile

File Userscript duy nhất: **[`iuh-dkhp-pro.user.js`](./iuh-dkhp-pro.user.js)**

---

## 🛠️ 1. Cách cài đặt trên điện thoại (Android & iOS)

### Trên Android (Firefox Mobile, Microsoft Edge Mobile, Kiwi Browser, Lemur Browser, Mise Browser)
1. Cài đặt tiện ích mở rộng **Tampermonkey** (hoặc **Violentmonkey**) từ kho tiện ích của trình duyệt.
2. Mở trình quản lý **Tampermonkey Dashboard** $\rightarrow$ Chọn dấu **`+`** (*Tạo script mới* / *Create a new script*) hoặc tab **Utilities** (*Tiện ích*) $\rightarrow$ **Import from file**.
3. Dán toàn bộ nội dung file [`iuh-dkhp-pro.user.js`](./iuh-dkhp-pro.user.js) vào trình sửa (hoặc chọn file `iuh-dkhp-pro.user.js` từ bộ nhớ máy) $\rightarrow$ Bấm **File $\rightarrow$ Save** (`Ctrl + S`).

### Trên iOS / iPadOS (Safari)
1. Cài ứng dụng **Stay** hoặc **Userscripts** (miễn phí trên App Store) hoặc **Tampermonkey** cho Safari.
2. Bật quyền cho tiện ích trong **Cài đặt (Settings) $\rightarrow$ Safari $\rightarrow$ Phần mở rộng (Extensions)**.
3. Thêm file [`iuh-dkhp-pro.user.js`](./iuh-dkhp-pro.user.js) vào ứng dụng quản lý Userscript.

---

## ⚡ 2. Các tính năng tối ưu riêng cho Mobile trong bản `.user.js`

1. **Nút nổi Floating Action Button (`#iuh-dkhp-fab`) kéo thả bằng cảm ứng:**
   - Nằm gọn ở góc dưới màn hình (`⚡ DKHP PRO`), hiển thị số lượng mã đang theo dõi và đèn trạng thái đang săn.
   - **Chạm nhẹ (Tap):** Bật/tắt nhanh bảng điều khiển cấu hình.
   - **Chạm giữ & Kéo (Touch Drag):** Di chuyển nút nổi tới bất kỳ vị trí nào trên màn hình điện thoại để không che nút bấm của trang web (tự động lưu vị trí và tự động căn lề khi xoay ngang/dọc màn hình).
2. **Giữ màn hình luôn sáng (`navigator.wakeLock`):**
   - Ngay khi bấm **`🚀 BẮT ĐẦU SĂN`**, script tự động gọi `navigator.wakeLock.request('screen')` để giữ màn hình điện thoại không bị tắt/ngủ trong suốt quá trình canh slot.
   - Hiển thị trạng thái **`🔆 Màn hình: Luôn sáng`** trực tiếp trên thanh trạng thái của bảng điều khiển.
   - Nếu bạn chuyển ứng dụng hoặc khóa/mở lại màn hình trong lúc đang săn, script tự động cấp lại quyền `WakeLock` ngay khi quay lại tab trình duyệt.
   - Tự động giải phóng `WakeLock` khi bấm **`🛑 DỪNG LẠI`** để tiết kiệm pin.
3. **Tương thích cả giao diện Mobile lẫn Desktop:**
   - Nhận diện chính xác mã học phần (10 số) & mã lớp học phần (12 số), sĩ số (`59/60`, cột rời hoặc nhãn gộp trên mobile), trạng thái lớp (`Chờ sinh viên đăng ký`), nhóm thực hành (dropdown `<select>`, radio button và dòng/thẻ) trên cả chế độ Mobile và chế độ Trang web cho máy tính.
4. **Thử nghiệm ngay lập tức:**
   - Bạn có thể mở file [`test_dkhp_mobile_simulator.html`](./test_dkhp_mobile_simulator.html) trên trình duyệt để test kéo thả cảm ứng, chuyển đổi giao diện Bảng Desktop / Thẻ Mobile, kiểm tra `WakeLock` và test săn slot tự động.
