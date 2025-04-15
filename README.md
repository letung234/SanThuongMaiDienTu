# Dự án Sàn Thương Mại Điện Tử
 Dự án hướng đến mục tiêu xây dựng một hệ sinh thái thương mại điện tử hiện đại, linh hoạt, đáp ứng các nhu cầu mua – bán đa dạng của thị trường trong thời đại số.

## Cài đặt dự án
- Clone dự án: 
    git clone https://github.com/letung234/Shoppe_Clone.git

- Truy cập vào thư mục dự án: 
    cd SanThuongMaiDienTu

- Cài đặt các package: 
    npm install

- Chạy dự án: 
    npm run start
## Demo
- Link Admin: [Trang Quản Trị Sản Thương Mại Điện Tử](https://santhuongmaidientu-production.up.railway.app/admin/dashboard)
- Link: [Sàn Thương Mại Điện Tử](https://santhuongmaidientu-production.up.railway.app)
## Thông tin đăng nhập
### Trang Quản Trị
#### Admin
  - Tài khoản: tunglt072603@gmail.com
  - Mật khẩu: tung12345
  - Quyền: Có Full Quyền!!!
#### Quản trị nội dung 
  - Tài khoản: tung12345@gmail.com
  - Mật khẩu: tung12345
  - Quyền:  có quyền xuất bản , thu hồi bài viết!!!
#### Biên tập viên 
  - Tài khoản: tunghhh172@gmail.com
  - Mật khẩu: tung12345
  - Quyền: có quyền viết blog!!!
#### Nhà cung cấp
  - Tài khoản: tung123456@gmail.com
  - Mật khẩu: tung12345
  - Quyền: có quyền đăng bán các sản phẩm !!!
### Trang Chủ:
  - Tài khoản: le1288834@gmail.com
  - Mật khẩu: tung12345
  - Quyền: có quyền mua sắm thông thường
## ⚙️ Chức năng trong dự án

### 🛠️ Trang Quản Trị (Admin Panel)

1. **Danh mục sản phẩm**  
   - Quản lý danh sách danh mục sản phẩm: thêm mới, chỉnh sửa, xóa, tìm kiếm, và phân trang.

2. **Quản lý chuyên mục bài viết**  
   - Thêm, sửa, xóa, tìm kiếm, và phân trang chuyên mục phục vụ cho hệ thống bài viết/blog.

3. **Quản lý bài viết**  
   - Biên tập viên có thể soạn thảo bài viết theo quyền hạn được phân công.  
   - Bài viết được kiểm duyệt và xuất bản bởi quản trị nội dung.

4. **Mã giảm giá**  
   - Tạo các mã khuyến mãi theo: đơn hàng, sản phẩm cụ thể, hoặc toàn bộ danh mục sản phẩm.  
   - Hỗ trợ cả giá trị cố định và phần trăm chiết khấu.

5. **Đơn hàng**  
   - Theo dõi và cập nhật trạng thái đơn hàng.  
   - Hệ thống tự động tính toán phần trăm hoa hồng theo trạng thái và giá trị đơn hàng.

6. **Sản phẩm**  
   - Quản lý sản phẩm đơn và sản phẩm có biến thể.  
   - Thêm mới, sửa, xóa, tìm kiếm và phân trang theo danh mục.

7. **Phân quyền hệ thống**  
   - Tạo mới, chỉnh sửa, xóa các nhóm quyền.  
   - Cấu hình quyền hạn chi tiết cho từng tài khoản theo vai trò.

8. **Quản lý tài khoản**  
   - Thêm, chỉnh sửa, xóa, tìm kiếm và phân trang danh sách tài khoản người dùng.

9. **Tin nhắn hỗ trợ**  
   - Trả lời tin nhắn và trao đổi trực tiếp với khách hàng trong hệ thống.

10. **Nhóm chat nội bộ**  
    - Tạo và quản lý nhóm trò chuyện giữa các tài khoản quản trị viên.

11. **Cài đặt hệ thống**  
    - Tùy chỉnh các thiết lập cơ bản của website như tên, logo, email liên hệ, thông tin footer, v.v.

---

### 🛒 Trang Người Dùng (Giao diện chính)

- **Mua sắm sản phẩm**: Duyệt sản phẩm theo danh mục, tìm kiếm và đặt hàng trực tuyến.
- **Theo dõi đơn hàng**: Xem trạng thái và lịch sử đơn hàng đã mua.
- **Đọc bài viết/tin tức**: Cập nhật các thông tin, tin tức, khuyến mãi từ hệ thống.
- **Cập nhật thông tin cá nhân**: Thay đổi hồ sơ cá nhân, địa chỉ nhận hàng, mật khẩu,...


# 📦 Dự Án Web - Server Side Rendering

Dự án được xây dựng theo hướng **Server-Side Rendering (SSR)**, sử dụng **Node.js** với **Express.js** và kết hợp **Pug (Jade)** làm template engine để render giao diện trên server. Ngoài ra, dự án tích hợp nhiều công nghệ hiện đại nhằm phục vụ các tính năng realtime, upload file, và xử lý media.

---

## 🚀 Kiến Trúc Dự Án

- **Rendering**: Server-Side Rendering (SSR)
- **Template Engine**: Pug (trước đây là Jade)
- **Backend**: Node.js + Express.js
- **Frontend Styling**: Tailwind CSS
- **Realtime**: Socket.IO
- **Upload & Media**: Multer + Cloudinary
- **Database**: MongoDB (qua Mongoose ODM)

---

## 💻 Frontend

### 🔹 Pug (Template Engine)
- Sử dụng để render HTML phía server, giúp code gọn gàng hơn so với HTML thuần.
- **Ưu điểm**: cú pháp ngắn gọn, dễ tổ chức view, dễ tích hợp logic hiển thị.

### 🔹 Tailwind CSS
- Framework CSS dạng utility-first, cho phép xây dựng giao diện hiện đại và responsive một cách nhanh chóng.

### 🔹 Font Awesome
- Thư viện biểu tượng phổ biến, dễ tích hợp vào pug template bằng class CSS.

### 🔹 JavaScript (Vanilla JS)
- Xử lý các logic tương tác phía client, như gửi dữ liệu qua fetch/AJAX, xử lý sự kiện DOM...

---

## 🧠 Backend

### 🔹 Node.js + Express.js
- Node.js là nền tảng chạy JavaScript phía server.
- Express là framework tối ưu để xây dựng hệ thống routing, middleware và xử lý HTTP request.

### 🔹 Mongoose
- ODM cho MongoDB, giúp định nghĩa Schema và thao tác dữ liệu dạng object dễ dàng hơn.

---

## 🔁 Realtime

### 🔹 Socket.IO
- Giao tiếp thời gian thực giữa client và server thông qua WebSocket.
- **Ứng dụng**: hệ thống chat, thông báo đẩy (push notification), cập nhật dữ liệu tức thời.

---

## 📁 Upload & Media

### 🔹 Multer
- Middleware xử lý upload file multipart/form-data trong Express.
- **Ứng dụng**: upload avatar, hình ảnh sản phẩm, tài liệu...

### 🔹 Cloudinary
- Nền tảng lưu trữ và xử lý ảnh/video trên đám mây.
- **Ưu điểm**: resize, crop, tối ưu ảnh, hỗ trợ CDN tải nhanh toàn cầu.

---

## 🗂️ Tổng Quan Công Nghệ

| Công nghệ     | Mục đích sử dụng                        |
|---------------|------------------------------------------|
| Pug           | Template engine SSR                    |
| Tailwind CSS  | Thiết kế giao diện                     |
| Font Awesome  | Biểu tượng (icon)                      |
| JavaScript    | Logic phía client                      |
| Node.js       | Backend server                         |
| Express.js    | Routing và xử lý HTTP                  |
| Mongoose      | Tương tác MongoDB                      |
| Socket.IO     | Giao tiếp realtime                     |
| Multer        | Upload file                            |
| Cloudinary    | Lưu trữ và xử lý ảnh/video             |

---

🙏 Lời cảm ơn
Cảm ơn bạn đã ghé thăm và dành thời gian tham khảo dự án Shopee Clone của tôi.
Hy vọng dự án này sẽ mang lại giá trị cho bạn trong quá trình học tập và phát triển kỹ năng lập trình với React + TypeScript.
Rất mong nhận được góp ý hoặc đóng góp từ bạn để dự án ngày càng hoàn thiện hơn! 💙

📫 Liên hệ
Bạn có thể kết nối với tôi qua:
📧 Email: [tunglt072603@gmail.com]
