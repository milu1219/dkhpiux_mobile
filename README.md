# ⚡ IUH DKHP Pro — Tampermonkey Mobile & Desktop Userscript (v1.3)

Userscript tất-cả-trong-một (`.user.js`) hỗ trợ sinh viên **IUH** đăng ký học phần, săn slot lớp đầy, auto click 20ms, giữ phiên, **giữ màn hình luôn sáng (`navigator.wakeLock`)** và **nút nổi kéo thả cảm ứng (Floating Action Button)** trên **Firefox Mobile / Kiwi / Edge Mobile / Safari iOS** và Desktop.

---

## 🚀 Cài Đặt 1-Click Trên Điện Thoại (Firefox Mobile + Tampermonkey)

Sau khi đã cài đặt tiện ích **Tampermonkey** trên trình duyệt **Firefox Mobile**, bạn chỉ cần **bấm trực tiếp vào đường link dưới đây** để Tampermonkey tự động hiện bảng **Install (Cài đặt)**:

👉 **[BẤM VÀO ĐÂY ĐỂ CÀI ĐẶT TRỰC TIẾP (`iuh-dkhp-pro.user.js`)](https://raw.githubusercontent.com/milu1219/dkhpiux_mobile/main/iuh-dkhp-pro.user.js)**

*(Hoặc copy link: `https://raw.githubusercontent.com/milu1219/dkhpiux_mobile/main/iuh-dkhp-pro.user.js` dán vào thanh địa chỉ của Firefox Mobile)*

---

## ✨ Tính năng nổi bật

- **🎯 Giữ nguyên 100% logic Crawl / Request / Auto-Click Đăng ký:** Hỗ trợ săn theo **Mã học phần (10 số)** và **Mã lớp học phần (12 số)**, tự tích *"Hiển thị lớp học phần không trùng lịch"*, tự chọn nhóm thực hành và tự bấm xác nhận hộp thoại trong **20ms**.
- **📱 Nút nổi (Floating Action Button) hỗ trợ kéo thả cảm ứng:** Nằm gọn ở góc dưới màn hình (`⚡ DKHP PRO`), chạm nhẹ để bật/tắt bảng điều khiển, chạm giữ và kéo để di chuyển tới vị trí bất kỳ.
- **🔆 Tích hợp `navigator.wakeLock`:** Tự động giữ màn hình điện thoại luôn sáng trong suốt thời gian vòng lặp canh môn đang chạy, tự động cấp lại quyền khi chuyển tab quay lại.
- **🔍 Tương thích giao diện Mobile & Desktop:** Tối ưu bộ chọn (Query Selectors) cho cả bảng nhiều cột trên máy tính lẫn bảng rút gọn / thẻ Card trên điện thoại.
- **🛡️ Keep-Alive & Auto-Login:** Tự động giữ phiên và tự điền MSSV + Mật khẩu nếu bị văng phiên.
