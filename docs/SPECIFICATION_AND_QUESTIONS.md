# Đặc Tả Kỹ Thuật & Danh Sách Câu Hỏi Làm Rõ Dữ Liệu

Tài liệu này tổng hợp bảng đặc tả chức năng của hệ thống Website **IEEE SMC 2027** và danh sách câu hỏi cần chốt với Ban tổ chức để hoàn thiện chi tiết dữ liệu.

---

## 1. Bảng Đặc Tả Chức Năng Hệ Thống

### Phân hệ A: Giao diện Đại biểu & Cổng thông tin
1. **A1 - Giao diện Website & Quản trị Nội dung CMS:**
   - Bàn giao khung giao diện trước 04 - 05/10 để Ban tổ chức chủ động cập nhật chương trình, mốc thời gian, tin tức và diễn giả.
   - Thiết kế chuẩn nhận diện IEEE SMC 2027.
   - Tối ưu riêng cho đại biểu Trung Quốc: loại bỏ hoàn toàn các dịch vụ Google phía trình duyệt để không bị tường lửa chặn; loại bỏ đăng nhập WeChat, sử dụng xác thực qua Email OTP và Mật khẩu.
2. **A2 - Cổng Đăng ký & Tích hợp Thanh toán Ngân hàng:**
   - Biểu mẫu thu thập dữ liệu đại biểu: Họ tên, Đơn vị, Ảnh, Hộ chiếu, Visa, Ăn uống, Di chuyển.
   - Phân loại lệ phí: Tác giả, Sinh viên, Hội viên IEEE, Đại biểu tự do.
   - Tích hợp thanh toán ngân hàng: tạo mã QR chuyển khoản tự động VietQR và cổng thanh toán thẻ quốc tế.
   - Tự động gửi email xác nhận đăng ký kèm mã tham dự.
3. **A3 - Trang Hồ sơ Cá nhân Đại biểu:**
   - Đại biểu tra cứu và đăng nhập xem lịch sử đăng ký, mã số tham dự và trạng thái thanh toán cá nhân.
   - Tải trực tiếp Phiếu thu / Hóa đơn điện tử và Thư hỗ trợ Visa được lưu trữ trên MinIO.
4. **A4 - Liên kết Cổng nộp bài & Lịch trình Báo cáo:**
   - Tích hợp liên kết chuyển hướng hoặc nhúng cổng nộp bài PaperCept / EDAS / Byoung.
   - Hiển thị lịch trình các phiên báo cáo song song cho đại biểu dễ theo dõi.

### Phân hệ B: Quản trị, Đối soát, Điểm danh & Hạ tầng
1. **B1 - Trang Quản trị Admin & Đối soát Thanh toán:**
   - Quản lý danh sách đăng ký và theo dõi trạng thái thanh toán theo thời gian thực.
   - Tự động đối soát thu chi ngân hàng qua Webhook.
   - Tự động xuất báo cáo danh sách đại biểu và tài chính.
2. **B2 - Mã QR Điểm danh & Gửi Email Hàng loạt:**
   - Tự động sinh mã QR trên Thẻ đại biểu phục vụ quét điểm danh tại hội trường.
   - Hệ thống gửi email hàng loạt nhắc lịch nộp bài, thư mời và thông báo khẩn từ Ban tổ chức.
3. **B3 - Hạ tầng Máy chủ, Lưu trữ MinIO & Tên miền:**
   - Triển khai linh hoạt trên máy chủ nhà trường hoặc máy chủ đám mây thông qua Docker Compose.
   - Lưu trữ tệp tập trung trên MinIO S3.
   - Cấu hình bảo mật SSL, cài đặt và bảo hành hệ thống.

---

## 2. Danh Sách Câu Hỏi Làm Rõ Với Ban Tổ Chức

### A1. Giao diện, CMS & Tối ưu cho đại biểu Trung Quốc
1. **Phương thức đăng nhập đại biểu:** Đại biểu tra cứu hồ sơ và tải tài liệu bằng cách nhập Mã đăng ký kèm mã OTP gửi qua Email hay tạo tài khoản mật khẩu riêng?
2. **Dịch vụ bản đồ & video:** Sử dụng nền tảng nào thay thế Google Maps và YouTube để đại biểu tại Trung Quốc xem được bản đồ khách sạn và video giới thiệu?
3. **Ngôn ngữ hiển thị:** Website chỉ sử dụng tiếng Anh chuẩn quốc tế hay cần thêm tiếng Việt?

### A2. Cổng Đăng ký & Thanh toán Ngân hàng
4. **Dữ liệu Hộ chiếu & Visa:** Chỉ nhập thông tin chữ gồm Số hộ chiếu, Ngày cấp, Ngày hết hạn, Quốc tịch hay bắt buộc tải lên ảnh chụp mặt hộ chiếu vào MinIO? Giới hạn định dạng và dung lượng tệp là bao nhiêu?
5. **Dữ liệu Ăn uống & Di chuyển:**
   - **Ăn uống:** Chọn từ danh sách cố định gồm Bình thường, Chay, Halal, Dị ứng hay nhập văn bản tự do?
   - **Di chuyển:** Cần thu thập những trường nào: Số hiệu chuyến bay, Ngày giờ đến và đi, Khách sạn lưu trú, Nhu cầu đặt xe đưa đón?
6. **Ảnh đại biểu:** Tải lên để in thẻ đeo tại hội trường hay chỉ hiển thị hồ sơ trực tuyến? Yêu cầu kích thước tối thiểu bao nhiêu?
7. **Bảng giá & Tiền tệ:** Mức phí chi tiết cho từng nhóm đối tượng theo giai đoạn đăng ký sớm/muộn là bao nhiêu? Thu bằng VND, USD hay cả hai?
8. **Xác minh đối tượng & Phụ phí:**
   - Xác minh tư cách Hội viên IEEE, Sinh viên, Tác giả bằng cách tải tệp minh chứng lên MinIO để Admin duyệt hay kiểm tra tự động?
   - Công thức tính phụ phí khi một tác giả đăng ký nhiều bài báo, vượt số trang quy định hoặc mua thêm vé tiệc tối như thế nào?
9. **Đơn vị trung gian thanh toán:** Kết nối VietQR tự động và cổng thẻ quốc tế qua đối tác nào như PayOS, SePay, Casso, VNPay, OnePay hay Stripe?

### A3. Hồ sơ Cá nhân, Hóa đơn & Thư hỗ trợ Visa
10. **Phiếu thu & Hóa đơn:** Hệ thống xuất Phiếu xác nhận thanh toán PDF theo mẫu của hội nghị hay cần kết nối phần mềm Hóa đơn điện tử có mã của cơ quan thuế? Có cần thu thập thêm Mã số thuế, Tên đơn vị, Địa chỉ xuất hóa đơn không?
11. **Thư hỗ trợ Visa:** Điều kiện để hệ thống cho phép tải thư là gì: chỉ cần trạng thái Đã thanh toán hay phải có thêm bước duyệt của Admin? Ban tổ chức đã có mẫu thư chuẩn kèm chữ ký/con dấu và các trường cần điền tự động chưa?

### A4. Cổng nộp bài & Lịch trình Báo cáo
12. **Đồng bộ bài báo:** Chốt sử dụng cổng nộp bài nào? Chỉ gắn liên kết chuyển hướng hay cần nhập danh sách Mã bài báo được chấp nhận vào cơ sở dữ liệu để đối chiếu khi tác giả đóng phí?
13. **Dữ liệu Lịch trình báo cáo:** Cấu trúc dữ liệu lịch trình gồm Ngày, Giờ, Phòng, Tên phiên, Chủ tọa, Mã bài, Tên bài, Tác giả sẽ được nhập bằng tệp Excel/CSV hay nhập trực tiếp trên CMS?

### B1. Quản trị Admin & Đối soát Thanh toán
14. **Tài khoản ngân hàng nhận tiền:** Tài khoản thụ hưởng thuộc ngân hàng nào, đứng tên nhà trường hay tài khoản chuyên thu để thiết lập luồng nhận tín hiệu biến động số dư?
15. **Mẫu báo cáo xuất file:** Ban tổ chức có mẫu tệp Excel/PDF chuẩn với các cột dữ liệu bắt buộc để phục vụ quyết toán tài chính với nhà trường và IEEE không?

### B2. Mã QR Điểm danh & Gửi Email Hàng loạt
16. **Luồng quét QR Check-in:** Nhân sự tại bàn đón tiếp quét mã bằng điện thoại/máy tính bảng trên trình duyệt web hay dùng súng quét mã vạch chuyên dụng? Điểm danh 1 lần duy nhất hay điểm danh theo từng ngày, từng phiên họp và tiệc tối?
17. **Gửi Email hàng loạt:** Có chốt triển khai tính năng này không? Số lượng thư gửi mỗi đợt dự kiến bao nhiêu và nhà trường đã cấp tài khoản SMTP tên miền riêng chưa?

### B3. Hạ tầng Máy chủ & Tên miền
18. **Máy chủ & Lưu trữ MinIO:** Triển khai trên máy chủ vật lý của trường hay thuê đám mây ngoài? Dung lượng ổ cứng cấp cho MinIO để lưu trữ ảnh, hộ chiếu và chứng từ dự kiến bao nhiêu GB?
19. **Tên miền & Mạng:** Tên miền chính thức của hội nghị là gì, ai quản lý DNS và tường lửa của trường có mở cổng nhận Webhook từ ngân hàng/cổng thanh toán không?
