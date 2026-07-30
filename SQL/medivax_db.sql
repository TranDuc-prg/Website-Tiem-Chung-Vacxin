-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 30, 2026 lúc 05:08 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `medivax_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `fullname` varchar(100) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `dia_chi` text DEFAULT NULL,
  `booking_date` date NOT NULL,
  `booking_time` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `trang_thai` varchar(50) DEFAULT 'Chờ xác nhận',
  `loai_giao_dich` varchar(50) DEFAULT 'Lịch tiêm',
  `chi_tiet_don_hang` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `appointments`
--

INSERT INTO `appointments` (`id`, `customer_id`, `fullname`, `doctor_id`, `email`, `service_id`, `phone`, `dia_chi`, `booking_date`, `booking_time`, `created_at`, `trang_thai`, `loai_giao_dich`, `chi_tiet_don_hang`) VALUES
(1, 1, 'Ngyễn Minh Đúc', 1, 'duc@gmail.com', 1, '0366388104', 'hanoi', '2026-07-26', '14:30', '2026-07-25 12:29:11', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai (SL: 1)'),
(2, 2, 'Trần Việt Đức', 2, 'duc@gmail.com', 1, '0222033777', 'hanoi', '2026-07-26', '15:30', '2026-07-25 12:30:53', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai (SL: 1)'),
(4, 4, 'Trần Văn A', 2, '20220111@eaut.edu.vn', 2, '0366388106', 'hanoi', '2026-07-29', '14:00 - 15:00', '2026-07-26 14:41:07', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai (SL: 1)'),
(5, 5, 'sv', 0, '', 0, '043636363', 'hanoi', '2026-07-26', '23:17:21', '2026-07-26 16:17:21', 'Chờ xác nhận', 'Giữ thuốc', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai (SL: 1), Gói vắc xin cho trẻ trước khi đi học (SL: 1)'),
(6, 6, 'duc', 0, '20220111@eaut.edu.vn', 0, '0373773733', 'hanoi', '2026-07-26', '23:20:10', '2026-07-26 16:20:10', 'Chờ xác nhận', 'Giữ thuốc', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai (SL: 1)'),
(17, 3, 'ew', 2, 'baoson2405@gmail.com', 9, '0366388104', 'haniu', '2026-07-28', '10:00 - 11:00', '2026-07-27 06:37:54', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho người trưởng thành (từ 18 tuổi)'),
(19, 3, 'ew', 1, 'tduc45310@gmail.com', 9, '0366388104', 'haniu', '2026-07-28', '09:00 - 10:00', '2026-07-27 06:40:12', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho người trưởng thành (từ 18 tuổi)'),
(20, 3, 'ew', 1, 'tduc45310@gmail.com', 9, '0366388104', 'haniu', '2026-07-28', '15:00 - 16:00', '2026-07-27 06:42:09', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho người trưởng thành (từ 18 tuổi)'),
(21, 3, 'ew', 2, 'tduc45310@gmail.com', 2, '0366388104', 'haniu', '2026-07-28', '08:00 - 09:00', '2026-07-27 06:45:36', 'Đã hủy', 'Lịch tiêm', 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)'),
(22, 3, 'ew', 2, 'baoson2405@gmail.com', 4, '0366388104', 'haniu', '2026-07-28', '10:00 - 11:00', '2026-07-27 06:49:20', 'Đã đến', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai'),
(23, 3, 'Trần Viết A', 1, 'baoson2405@gmail.com', 4, '0366388104', 'ha noi', '2026-07-28', '09:00 - 10:00', '2026-07-28 14:17:05', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai'),
(24, 14, 'Trần Viết A', 3, 'baoson2405@gmail.com', 2, '0322828283', 'ha noi', '2026-07-28', '10:00 - 11:00', '2026-07-28 14:18:46', 'Đã đến', 'Lịch tiêm', 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)'),
(25, 14, 'Phan văn a', 2, 'baoson2405@gmail.com', 2, '036638282', 'Đăng ký từ trang giới thiệu', '2026-07-30', '09:00 - 10:00', '2026-07-29 14:38:27', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)'),
(30, 5, 'ew', 3, 'tduc45310@gmail.com', 2, '0332022011', 's', '2026-08-01', '09:00 - 10:00', '2026-07-29 16:42:42', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)'),
(31, 15, 'đức tv', 2, '2022011@gmail.com', 4, '0303300333', 'ha noi', '2026-08-06', '09:00 - 10:00', '2026-07-29 16:45:10', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai'),
(32, 14, 'Phan văn a', 3, 'baoson2405@gmail.com', 4, '033366810', 'hà nội 2', '2026-07-30', '14:00 - 15:00', '2026-07-29 16:47:46', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai'),
(33, 3, 'Trần Viết A', 2, 'baoson2405@gmail.com', 9, '0366388104', 'haniu', '2026-07-31', '14:00 - 15:00', '2026-07-29 16:49:39', 'Chờ xác nhận', 'Lịch tiêm', 'Gói vắc xin cho người trưởng thành (từ 18 tuổi)');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cham_cong`
--

CREATE TABLE `cham_cong` (
  `id` int(11) NOT NULL,
  `nhan_vien_id` int(11) NOT NULL,
  `ten_nhan_vien` varchar(100) NOT NULL,
  `ngay_cham_cong` date NOT NULL,
  `gio_vao` time DEFAULT NULL,
  `gio_ra` time DEFAULT NULL,
  `trang_thai` varchar(50) DEFAULT 'Đang làm việc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cham_cong`
--

INSERT INTO `cham_cong` (`id`, `nhan_vien_id`, `ten_nhan_vien`, `ngay_cham_cong`, `gio_vao`, `gio_ra`, `trang_thai`) VALUES
(1, 5, '', '2026-07-28', '17:08:31', '17:19:08', 'Hoàn thành ca'),
(2, 12, '', '2026-07-28', '08:00:00', '17:00:00', 'Đúng giờ'),
(3, 5, '', '2026-07-29', '19:21:27', '19:21:29', 'Hoàn thành ca');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chuyen_khoa`
--

CREATE TABLE `chuyen_khoa` (
  `id` int(11) NOT NULL,
  `ten_khoa` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chuyen_khoa`
--

INSERT INTO `chuyen_khoa` (`id`, `ten_khoa`) VALUES
(1, 'Sản phụ khoa'),
(2, 'Huyết học');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_gia`
--

CREATE TABLE `danh_gia` (
  `id` int(11) NOT NULL,
  `loai` varchar(50) NOT NULL DEFAULT 'dich_vu',
  `target_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `lien_he` varchar(50) DEFAULT NULL,
  `so_sao` int(11) NOT NULL,
  `noi_dung` text NOT NULL,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danh_gia`
--

INSERT INTO `danh_gia` (`id`, `loai`, `target_id`, `ho_ten`, `email`, `lien_he`, `so_sao`, `noi_dung`, `ngay_tao`) VALUES
(2, 'tin_tuc', 5, 'Trần Đức', '3@gmail.com', '0366388104', 5, 'ok', '2026-07-25 15:46:51'),
(3, 'tin_tuc', 5, 'duc', 'duc@gmail.com', '0366388108', 4, 'hơi tốt', '2026-07-25 15:49:32'),
(4, 'tin_tuc', 5, 'Trần Đức', 'duc@gmail.com', '0366388109', 5, 'egsdokok', '2026-07-25 15:51:12'),
(5, 'tin_tuc', 5, 'Trần Đức', 'duc@gmail.com', '0366388219', 5, 'bc', '2026-07-25 15:54:31'),
(6, 'dich_vu', 6, 'duc', '3@gmail.com', '0366388219', 4, 'khá tốt', '2026-07-25 15:56:40'),
(7, 'dich_vu', 6, 'Trần Đức', 'duc@gmail.com', '0366388333', 5, 'ok', '2026-07-25 15:57:54'),
(8, 'dich_vu', 4, 'Trần Đức', 'duc@gmail.com', '0366388219', 5, 'tot', '2026-07-25 16:20:38'),
(13, 'bac_si', 2, 'Trần A', '202220@gmail.com', '0366336363', 5, 'ew', '2026-07-26 07:03:56'),
(18, 'bac_si', 1, '8l', 'tduc45310@gmail.com', '0366377103', 5, 'ưeeeeee', '2026-07-28 10:21:38'),
(19, 'Dịch vụ', 9, 'rê', 'tduc45310@gmail.com', '0366388104', 5, 'ewwwwwww', '2026-07-28 13:58:43');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dich_vu`
--

CREATE TABLE `dich_vu` (
  `id` int(11) NOT NULL,
  `ten_dich_vu` varchar(255) NOT NULL,
  `do_tuoi` varchar(100) DEFAULT NULL,
  `hinh_anh` longtext DEFAULT NULL,
  `mo_ta` text DEFAULT NULL,
  `gia` decimal(12,2) NOT NULL DEFAULT 0.00,
  `gia_cu` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `dich_vu`
--

INSERT INTO `dich_vu` (`id`, `ten_dich_vu`, `do_tuoi`, `hinh_anh`, `mo_ta`, `gia`, `gia_cu`, `created_at`) VALUES
(1, 'Gói vắc xin cho trẻ trước khi đi học', '4-6 tuổi', 'IMAGE/anh2.jpg', 'Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu, cứu sống hàng triệu người mỗi năm. Vắc xin làm giảm nguy cơ mắc bệnh bằng cách làm việc với hệ thống phòng thủ tự nhiên của cơ thể bạn để xây dựng khả năng bảo vệ. Khi bạn chủng ngừa, hệ thống miễn dịch của bạn sẽ phản ứng lại.\n\nHiện chúng ta đã có vắc xin để ngăn ngừa hơn 20 căn bệnh đe dọa tính mạng, giúp mọi người ở mọi lứa tuổi sống lâu hơn, sống khỏe hơn. Tiêm chủng hiện ngăn ngừa 2-3 triệu ca tử vong mỗi năm do các bệnh như bạch hầu, uốn ván, ho gà, cúm và sởi.\n\nTiêm chủng là một thành phần quan trọng của chăm sóc sức khỏe ban đầu và là quyền con người không thể chối cãi. Đây cũng là một trong những khoản đầu tư tốt nhất cho sức khỏe mà tiền có thể mua được. Vắc xin cũng rất quan trọng trong việc phòng ngừa và kiểm soát các đợt bùng phát bệnh truyền nhiễm. Chúng củng cố an ninh y tế toàn cầu và sẽ là một công cụ quan trọng trong cuộc chiến chống lại sự kháng thuốc.', 2000000.00, 3000000.00, '2026-07-24 15:51:50'),
(2, 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)', '9-18 tuổi', 'IMAGE/anh3.jpg', 'Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu, cứu sống hàng triệu người mỗi năm. Vắc xin làm giảm nguy cơ mắc bệnh bằng cách làm việc với hệ thống phòng thủ tự nhiên của cơ thể bạn để xây dựng khả năng bảo vệ. Khi bạn chủng ngừa, hệ thống miễn dịch của bạn sẽ phản ứng lại.\n\nHiện chúng ta đã có vắc xin để ngăn ngừa hơn 20 căn bệnh đe dọa tính mạng, giúp mọi người ở mọi lứa tuổi sống lâu hơn, sống khỏe hơn. Tiêm chủng hiện ngăn ngừa 2-3 triệu ca tử vong mỗi năm do các bệnh như bạch hầu, uốn ván, ho gà, cúm và sởi.\n\nTiêm chủng là một thành phần quan trọng của chăm sóc sức khỏe ban đầu và là quyền con người không thể chối cãi. Đây cũng là một trong những khoản đầu tư tốt nhất cho sức khỏe mà tiền có thể mua được. Vắc xin cũng rất quan trọng trong việc phòng ngừa và kiểm soát các đợt bùng phát bệnh truyền nhiễm. Chúng củng cố an ninh y tế toàn cầu và sẽ là một công cụ quan trọng trong cuộc chiến chống lại sự kháng thuốc.', 1500000.00, 1800000.00, '2026-07-24 15:51:50'),
(4, 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai', 'Phụ nữ mang thai', 'IMAGE/anh5.jpg', 'Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu, cứu sống hàng triệu người mỗi năm. Vắc xin làm giảm nguy cơ mắc bệnh bằng cách làm việc với hệ thống phòng thủ tự nhiên của cơ thể bạn để xây dựng khả năng bảo vệ. Khi bạn chủng ngừa, hệ thống miễn dịch của bạn sẽ phản ứng lại.\n\nHiện chúng ta đã có vắc xin để ngăn ngừa hơn 20 căn bệnh đe dọa tính mạng, giúp mọi người ở mọi lứa tuổi sống lâu hơn, sống khỏe hơn. Tiêm chủng hiện ngăn ngừa 2-3 triệu ca tử vong mỗi năm do các bệnh như bạch hầu, uốn ván, ho gà, cúm và sởi.\n\nTiêm chủng là một thành phần quan trọng của chăm sóc sức khỏe ban đầu và là quyền con người không thể chối cãi. Đây cũng là một trong những khoản đầu tư tốt nhất cho sức khỏe mà tiền có thể mua được. Vắc xin cũng rất quan trọng trong việc phòng ngừa và kiểm soát các đợt bùng phát bệnh truyền nhiễm. Chúng củng cố an ninh y tế toàn cầu và sẽ là một công cụ quan trọng trong cuộc chiến chống lại sự kháng thuốc.', 2000000.00, 2399999.00, '2026-07-24 15:51:50'),
(9, 'Gói vắc xin cho người trưởng thành (từ 18 tuổi)', '', 'IMAGE/anh5.jpg', 'ƯQQQQQQQQQQ', 15000000.00, 0.00, '2026-07-26 15:41:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `specialty` varchar(150) NOT NULL,
  `image` varchar(255) NOT NULL,
  `mo_ta_chi_tiet` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `specialty`, `image`, `mo_ta_chi_tiet`) VALUES
(1, 'BS. TRẦN THÚY VÂN', 'CK I - SẢN PHỤ KHOA', 'IMAGE/BS.Tran Thuy Van.webp', '<h1 class=\"ql-align-justify\">Bác sĩ Trần Thúy Vân</h1><p class=\"ql-align-justify\"><strong style=\"color: rgb(120, 120, 120);\">Bài viết có ích: </strong><strong style=\"color: rgb(16, 102, 52);\">3574 lượt bình chọn</strong></p><p class=\"ql-align-justify\">Bác sĩ Trần Thúy Vân chuyên khoa phụ khoa, có gần 30 năm kinh nghiệm trong việc tư vấn và điều trị các bệnh phụ khoa (viêm nhiễm phụ khoa, rối loạn kinh nguyệt, bệnh lý cổ tử cung, tử cung, vòi trứng,…), kế hoạch hóa gia đình (khám tư vấn tránh thai, tư vấn và thực hiện phá thai an toàn (phá thai bằng thuốc và nạo, hút thai), bệnh lây truyền qua đường tình dục (sùi mào gà, lậu, herper sinh dục,…)…</p><h2 class=\"ql-align-justify\">Bác sĩ Trần Thúy Vân thông tin chi tiết</h2><p class=\"ql-align-justify\"><img src=\"http://tuvanphukhoa.com/wp-content/uploads/2021/06/bac-si-van-1.jpg\" alt=\"Bác sĩ Trần Thúy Vân\" height=\"450\" width=\"600\"></p><p class=\"ql-align-justify\"><strong>Họ và tên:</strong> Trần Thúy Vân.<strong>‍</strong></p><p class=\"ql-align-justify\"><strong>Năm sinh:</strong> 1962.</p><p class=\"ql-align-justify\"><strong>Trình độ:</strong> Tốt nghiệp Đại Học Y Bắc Thái năm 1986.</p><p class=\"ql-align-justify\"><strong>Phạm vi hoạt động chuyên môn</strong>: Khám bệnh, chữa bệnh chuyên khoa phụ sản – KHHGĐ, Siêu âm sản phụ khoa.</p><h3 class=\"ql-align-justify\"><strong>Đào tạo sau Đại Học</strong></h3><p class=\"ql-align-justify\"><strong>Từ 10/2013 – 8/2004</strong>: Định hướng chuyên ngành sản phụ khoa tại BV phụ sản trung ương.</p><p class=\"ql-align-justify\"><strong>Từ 3/2005 – 4/2005</strong>: Siêu âm sản phụ khoa tại BV phụ sản trung ương.</p><p class=\"ql-align-justify\"><strong>Từ 8/2005 – 11/2005</strong>: Siêu âm ổ bụng tại Bệnh viện Bạch Mai</p><p class=\"ql-align-justify\"><strong>Từ 10/2013 – 11/2013</strong>: Quy trình khám điệu trị hiếm muộn &amp; thủ thuật IUI tại Bệnh viện phụ sản Hà Nội.</p><h3 class=\"ql-align-justify\">Công tác</h3><p class=\"ql-align-justify\"><strong>Từ 10/1988 – 2/2003</strong>: Bác sĩ tại trạm y tế xí nghiệp xe đạp Xuân Hòa ( nay là công ty Xuân Hòa).</p><p class=\"ql-align-justify\"><strong>Từ 8/2003 – 6/2009</strong>: Bác sĩ – Trưởng khoa tại Trung tâm y tế Mê Linh</p><p class=\"ql-align-justify\"><strong>Từ 7/2009 – 5/2017</strong>: BS. Phó trưởng khoa – Phụ trách khoa : Trung tâm chăm sóc SKSS Hà Nội.</p><p class=\"ql-align-justify\">Từ 2017 đến nay bác sĩ Thúy vân đảm nhiệm vị trí chuyên sản phụ khoa tại Phòng khám đa khoa Quốc Tế Hà Nội.</p><p class=\"ql-align-justify\">Bác sĩ Trần Thùy Vân là chuyên gia nổi tiếng trong lĩnh vực sản phụ khoa với hơn 30 năm kinh nghiệm chẩn đoán và điều trị nhiều bệnh lý. Chuyên môn của bác sĩ bao gồm:</p><ul><li class=\"ql-align-justify\">Bệnh phụ khoa: Bác sĩ Vân có nhiều kinh nghiệm trong việc điều trị các bệnh viêm nhiễm vùng kín, viêm âm đạo, rối loạn kinh nguyệt, bất thường tử cung, viêm lộ tuyến cổ tử cung, viêm ống dẫn trứng, u nang buồng trứng và các bệnh lý liên quan khác.</li><li class=\"ql-align-justify\">&nbsp;Chăm sóc sức khỏe sinh sản: Bác sĩ Vân thành thạo trong việc tư vấn và hướng dẫn bệnh nhân các biện pháp tránh thai an toàn, chăm sóc trước sinh, khám sức khỏe tiền hôn nhân, xử trí sảy thai (nếu phù hợp) và thụ tinh nhân tạo.</li><li class=\"ql-align-justify\">&nbsp;Các bệnh lây truyền qua đường tình dục: Với kiến ​​thức sâu rộng trong lĩnh vực này, bác sĩ Vân có khả năng chẩn đoán và điều trị các bệnh lây truyền qua đường tình dục bao gồm lậu, giang mai, mụn rộp sinh dục và sùi mào gà.</li><li class=\"ql-align-justify\">&nbsp;Phẫu thuật thẩm mỹ: Bác sĩ Vân đưa ra những lời khuyên quý báu và thực hiện các thủ thuật phẫu thuật thẩm mỹ để cải thiện vẻ đẹp của vùng kín sau khi sinh.</li></ul><p class=\"ql-align-justify\">Kinh nghiệm và kiến ​​thức chuyên môn sâu rộng của Bác sĩ Trần Thùy Vân trong các lĩnh vực này khiến bác sĩ Vân trở thành một chuyên gia y tế được đánh giá cao trong lĩnh vực sản phụ khoa.</p><h2 class=\"ql-align-justify\">Thông điệp Bác sĩ Trần Thúy Vân muốn gửi gắm</h2><blockquote class=\"ql-align-justify\">Trong lĩnh vực y tế, đặc biệt là trong sản phụ khoa, việc đưa ra thông tin chính xác và đáng tin cậy là điều cực kỳ quan trọng để bảo vệ sức khỏe của bệnh nhân. Với hơn 30 năm kinh nghiệm trong lĩnh vực này, tôi hiểu rõ tầm quan trọng của việc chia sẻ những kiến thức chuyên môn của mình một cách cẩn thận và có trách nhiệm.</blockquote><blockquote class=\"ql-align-justify\">Do đó, tôi rất hân hạnh được chia sẻ thông tin chính xác và đáng tin cậy về các vấn đề liên quan đến sản phụ khoa qua blog của mình. Mặc dù không đầy đủ và hoàn hảo, những thông tin này đều được cung cấp với tình yêu và trách nhiệm tận tâm nhất. Mong rằng các bạn sẽ tìm thấy những kiến thức hữu ích và giá trị từ các bài viết của tôi, để có thể bảo vệ sức khỏe của mình và gia đình một cách tốt nhất.</blockquote><h2 class=\"ql-align-justify\">Review đánh giá từ bệnh nhân khi được khám bởi bác sĩ Thúy Vân</h2><p class=\"ql-align-justify\">Tôi rất vui khi được khám và điều trị bệnh phụ khoa bởi bác sĩ Trần Thúy Vân. Bác sĩ Vân rất tận tâm và thân thiện trong việc thăm khám và giải đáp các thắc mắc của tôi. Bác sĩ Vân đã giúp tôi hiểu rõ hơn về bệnh lý của mình và cung cấp cho tôi các phương pháp điều trị hiệu quả. Tôi rất hài lòng với dịch vụ của bác sĩ Vân và sẽ chắc chắn quay lại nếu có bất kỳ vấn đề nào liên quan đến sức khỏe sinh sản của tôi. (Hải Yến – Hà Nội)</p><p class=\"ql-align-justify\">Tôi muốn chia sẻ với mọi người về trải nghiệm khám và điều trị bệnh phụ khoa tuyệt vời của tôi với bác sĩ Trần Thúy Vân. Bác sĩ Vân rất tận tâm và chuyên nghiệp, đã giúp tôi hiểu rõ hơn về bệnh lý của mình và cung cấp cho tôi các phương pháp điều trị tối ưu nhất. Bên cạnh đó, bác sĩ Vân còn rất chu đáo và thân thiện trong việc giải đáp các thắc mắc của tôi. Tôi rất cảm kích sự chăm sóc tận tâm của bác sĩ Vân và sẽ giới thiệu cô ấy cho bạn bè và người thân của mình. (Thanh Nga – Hải Dương)</p><p class=\"ql-align-justify\">Tôi đã được khám và điều trị bệnh phụ khoa bởi bác sĩ Trần Thúy Vân và tôi rất ấn tượng với sự chuyên nghiệp và tận tâm của cô ấy. Bác sĩ Vân đã giải đáp cho tôi những thắc mắc và lo lắng của mình một cách rất cẩn thận và tận tâm. Tôi cảm thấy rất thoải mái và tin tưởng khi được điều trị bởi bác sĩ Vân. Tôi sẽ chắc chắn quay lại với bác sĩ Vân nếu có bất kỳ vấn đề nào liên quan đến sức khỏe sinh sản của tôi và tôi sẽ khuyên bạn bè của mình đến với cô ấy nếu họ có cùng vấn đề. (Như Lan – Hòa Bình)</p><p class=\"ql-align-justify\">Nếu bạn cần được giải đáp hoặc hỗ trợ về bất kỳ vấn đề liên quan đến lĩnh vực sản phụ khoa, hãy liên hệ trực tiếp với Bác sĩ Trần Thúy Vân qua số điện thoại (+84) 869 725 632. Bác sĩ Vân sẽ cố gắng giúp đỡ bạn nhiều nhất có thể.</p><p><br></p>'),
(2, 'BS. NGUYỄN ANH TUẤN', 'BÁC SĨ KHOA HUYẾT HỌC', 'IMAGE/BS.Nguyen Anh Tuan.jpg', NULL),
(3, 'BS. TRẦN TIẾN QUANG', 'CK I SẢN PHỤ KHOA', 'IMAGE/BS.Tran Tien Quang.jpg', NULL),
(4, 'szcx', 'sd', '', NULL),
(5, 'fdb', 'dfb', '', ''),
(6, 's', 'ds', 'IMAGE/BS.Tran Thuy Van.webp', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kho_vacxin`
--

CREATE TABLE `kho_vacxin` (
  `id` int(11) NOT NULL,
  `ma_lo` varchar(50) NOT NULL,
  `ten_vacxin` varchar(255) NOT NULL,
  `hang_san_xuat` varchar(255) DEFAULT NULL,
  `so_luong_ton` int(11) DEFAULT 0,
  `han_su_dung` date DEFAULT NULL,
  `trang_thai_kho` varchar(100) DEFAULT 'Đủ tiêu chuẩn',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `kho_vacxin`
--

INSERT INTO `kho_vacxin` (`id`, `ma_lo`, `ten_vacxin`, `hang_san_xuat`, `so_luong_ton`, `han_su_dung`, `trang_thai_kho`, `created_at`) VALUES
(1, 'VAC-8821', 'Infana Hexa (6 trong 1)', 'Sanofi Pasteur', 1240, '2028-12-15', 'Đủ tiêu chuẩn', '2026-07-28 16:01:20'),
(2, 'VAC-4412', 'Priorix (Sởi - Quai bị - Rubella)', 'GSK', 850, '2027-08-20', 'Đủ tiêu chuẩn', '2026-07-28 16:01:20'),
(3, 'VAC-9012', 'Gardasil 9 (Phòng HPV)', 'Merck Sharp & Dohme', 100, '2027-05-10', 'Đủ tiêu chuẩn', '2026-07-28 16:01:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lien_he`
--

CREATE TABLE `lien_he` (
  `id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(50) NOT NULL,
  `tin_nhan` text NOT NULL,
  `trang_thai` varchar(50) DEFAULT 'Chưa trả lời',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lien_he`
--

INSERT INTO `lien_he` (`id`, `ho_ten`, `email`, `so_dien_thoai`, `tin_nhan`, `trang_thai`, `ngay_tao`) VALUES
(1, 'phòng trọ mỹ đình Nhom4', 'tduc45310@gmail.com', '0366388104', 'XXXXXXX', 'Chưa trả lời', '2026-07-27 06:08:16'),
(2, 'Trần Việt Đức', 'tduc45310@gmail.com', '0366388104', 'ok', 'Đã trả lời', '2026-07-27 06:13:16'),
(3, 'phòng trọ mỹ đình Nhom4', 'tduc45310@gmail.com', '0366388104', 'ds', 'Đã trả lời', '2026-07-29 17:13:04'),
(4, 'Trần Việt Đức', 'hanoi@gmail.com', '0366388104', 'skjVKBZ', 'Chưa trả lời', '2026-07-29 17:16:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT '#'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `title`, `image`, `link`) VALUES
(1, 'Gói vắc xin cho trẻ trước khi đi học (4-6 tuổi)', 'IMAGE/anh2.jpg', '#'),
(2, 'Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)', 'IMAGE/anh3.jpg', '#'),
(3, 'Gói vắc xin cho trẻ sơ sinh', 'IMAGE/anh4.png', '#'),
(4, 'Gói vắc xin cho phụ nữ sắp & trong khi mang thai', 'IMAGE/anh5.jpg', '#');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tin_tuc`
--

CREATE TABLE `tin_tuc` (
  `id` int(11) NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `tom_tat` text DEFAULT NULL,
  `noi_dung` longtext DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `ngay_dang` date NOT NULL,
  `is_hot` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tin_tuc`
--

INSERT INTO `tin_tuc` (`id`, `tieu_de`, `tom_tat`, `noi_dung`, `hinh_anh`, `ngay_dang`, `is_hot`, `created_at`) VALUES
(1, 'Một số bài tập yoga giúp đẹp da, chậm lão hóa', 'Bạn có thể lựa chọn bất kỳ hình thức tập luyện nào phù hợp với bản thân như chạy bộ, đạp xe, tập yoga...', NULL, 'IMAGE/Yoga.jpg', '2024-05-28', 1, '2026-07-24 15:52:23'),
(2, '10 thực phẩm giàu vitamin E giúp nuôi dưỡng làn da', 'Cách bổ sung vitamin E tự nhiên hiệu quả.', NULL, 'IMAGE/Vitamin E.jpg', '2024-05-28', 0, '2026-07-24 15:52:23'),
(3, 'Cách dùng tinh dầu vỏ bưởi chăm sóc tóc', 'Hướng dẫn sử dụng tinh dầu vỏ bưởi đúng cách.', NULL, 'IMAGE/Tinh dau buoi.jpg', '2024-05-28', 0, '2026-07-24 15:52:23'),
(4, 'Cách đi bộ ngắt quãng giúp giảm cân', 'Phương pháp đi bộ ngắt quãng đốt mỡ thừa.', NULL, 'IMAGE/di bo ngat quang.webp', '2024-05-28', 0, '2026-07-24 15:52:23'),
(5, 'Vitamin A tự ý uống có thể gây ngộ độc, làm sao để nhận biết?', 'Dấu hiệu nhận biết ngộ độc Vitamin A.', NULL, 'IMAGE/Vitamin A.jpg', '2024-05-28', 0, '2026-07-24 15:52:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'customer',
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `fullName`, `email`, `password`, `phone`, `role`, `status`, `created_at`) VALUES
(1, 'Quản trị viên', 'admin@gmail.com', '123456', '0987654321', 'manager', 'active', '2026-07-25 10:22:32'),
(3, 'Ngyễn Minh Đúc', 'duc@gmail.com', '123456', '0366388104', 'staff', 'active', '2026-07-25 10:45:51'),
(5, 'a777', 'tduc45310@gmail.com', '123456', '0288103777', 'customer', 'active', '2026-07-25 10:49:53'),
(11, 'sa', 'w@gmail.com', '1111111', '0366388104', 'customer', 'active', '2026-07-25 10:57:00'),
(12, 'chaoban', 'chaoban@gmail.com', '111111111111', '0377737373', 'staff', 'locked', '2026-07-25 10:57:31'),
(13, 'duc', '20220111@eaut.edu.vn', '123', '0373773733', 'customer', 'active', '2026-07-26 16:53:27'),
(14, 'Trần Viết A', 'baoson2405@gmail.com', '123', '0322828283', 'customer', 'active', '2026-07-28 14:18:46'),
(15, 'đức', '2022011@gmail.com', '123', '0303300333', 'customer', 'active', '2026-07-29 16:24:12'),
(19, 'tahn', 'duc12@gmail.com', '123456', '0123456891', 'customer', 'active', '2026-07-30 14:48:43');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cham_cong`
--
ALTER TABLE `cham_cong`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `chuyen_khoa`
--
ALTER TABLE `chuyen_khoa`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `dich_vu`
--
ALTER TABLE `dich_vu`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `kho_vacxin`
--
ALTER TABLE `kho_vacxin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_lo` (`ma_lo`);

--
-- Chỉ mục cho bảng `lien_he`
--
ALTER TABLE `lien_he`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tin_tuc`
--
ALTER TABLE `tin_tuc`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT cho bảng `cham_cong`
--
ALTER TABLE `cham_cong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `chuyen_khoa`
--
ALTER TABLE `chuyen_khoa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `dich_vu`
--
ALTER TABLE `dich_vu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `kho_vacxin`
--
ALTER TABLE `kho_vacxin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `lien_he`
--
ALTER TABLE `lien_he`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tin_tuc`
--
ALTER TABLE `tin_tuc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
