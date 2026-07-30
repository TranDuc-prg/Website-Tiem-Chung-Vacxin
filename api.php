<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Kết nối cơ sở dữ liệu thất bại"]);
    exit();
}


$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);
if (empty($action) && isset($input['action'])) {
    $action = $input['action'];
}


function get_input_value($key, $default = '') {
    global $input, $_POST;
    if (isset($input[$key])) return $input[$key];
    if (isset($_POST[$key])) return $_POST[$key];
    return $default;
}

switch ($action) {

    
    case 'lookup_vaccine':
        $phone = trim($conn->real_escape_string(get_input_value('phone', $_GET['phone'] ?? '')));

        if (empty($phone)) {
            echo json_encode(["success" => false, "message" => "Vui lòng cung cấp số điện thoại tra cứu!"]);
            break;
        }

        $sql = "SELECT 
                    a.id AS id,
                    COALESCE(d.ten_dich_vu, a.chi_tiet_don_hang, 'Đăng ký tiêm chủng') AS chi_tiet_don_hang,
                    a.trang_thai AS trang_thai,
                    a.booking_date AS ngay_dat,
                    a.booking_time AS thoi_han
                FROM appointments a
                LEFT JOIN dich_vu d ON a.service_id = d.id
                WHERE a.phone = '$phone'
                ORDER BY a.id DESC";

        $result = $conn->query($sql);
        $orders = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $orders[] = $row;
            }
        }

        echo json_encode([
            "success" => true,
            "orders" => $orders
        ], JSON_UNESCAPED_UNICODE);
        break;

    
    case 'register':
    case 'add_customer':
        $fullName = trim($conn->real_escape_string(get_input_value('fullName', get_input_value('ho_ten'))));
        $phone = trim($conn->real_escape_string(get_input_value('phone', get_input_value('so_dien_thoai'))));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $password = trim($conn->real_escape_string(get_input_value('password')));
        $dia_chi = trim($conn->real_escape_string(get_input_value('dia_chi', '')));

        if (empty($fullName) || empty($phone) || empty($email) || empty($password)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập đầy đủ Họ tên, Số điện thoại, Email và Mật khẩu!"]);
            break;
        }

        $checkExist = $conn->query("SELECT id FROM users WHERE email = '$email' OR phone = '$phone' LIMIT 1");
        if ($checkExist && $checkExist->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Email hoặc Số điện thoại này đã được sử dụng!"]);
            break;
        }

        $sql = "INSERT INTO users (fullName, email, phone, password, role, status) 
                VALUES ('$fullName', '$email', '$phone', '$password', 'customer', 'active')";
                
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Đăng ký tài khoản thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'get_all_customers':
        $sql = "
            SELECT
                a.id AS id,
                COALESCE(u.fullName, a.fullName, 'Khách lẻ') AS ho_ten,
                COALESCE(u.phone, a.phone) AS so_dien_thoai,
                COALESCE(u.email, a.email) AS email,
                a.dia_chi AS dia_chi,
                a.booking_date AS ngay_tao
            FROM appointments a
            LEFT JOIN users u ON a.customer_id = u.id
            ORDER BY a.id DESC
        ";

        $result = $conn->query($sql);
        $customers = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $customers[] = $row;
            }
        }

        echo json_encode($customers, JSON_UNESCAPED_UNICODE);
        break;

  
    case 'get_vaccination_history':
        $user_id = intval(get_input_value('user_id', $_GET['user_id'] ?? 0));

        if ($user_id <= 0) {
            echo json_encode([], JSON_UNESCAPED_UNICODE);
            break;
        }

        $sql = "SELECT lsp.id, 
                       lsp.user_id,
                       COALESCE(lsp.ten_vacxin, 'Vắc-xin tiêu chuẩn') AS ten_vacxin, 
                       lsp.ngay_tiem, 
                       lsp.so_lote, 
                       COALESCE(lsp.co_so, 'Cơ sở chính - Medivax') AS co_so, 
                       COALESCE(lsp.trang_thai, 'Hoàn thành') AS trang_thai 
                FROM lich_su_tiem lsp 
                WHERE lsp.user_id = $user_id 
                ORDER BY lsp.ngay_tiem DESC";

        $result = $conn->query($sql);
        $history = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $history[] = $row;
            }
        }
        echo json_encode($history, JSON_UNESCAPED_UNICODE);
        break;

    case 'get_all_vaccination_history':
        $sql = "SELECT lsp.id, 
                       lsp.user_id, 
                       COALESCE(u.fullName, 'Khách lẻ') AS ho_ten,
                       COALESCE(lsp.ten_vacxin, 'Vắc-xin tiêu chuẩn') AS ten_vacxin, 
                       lsp.ngay_tiem, 
                       lsp.so_lote, 
                       COALESCE(lsp.co_so, 'Cơ sở chính - Medivax') AS co_so, 
                       lsp.trang_thai 
                FROM lich_su_tiem lsp 
                LEFT JOIN users u ON lsp.user_id = u.id 
                ORDER BY lsp.id DESC";
        $result = $conn->query($sql);
        $historyList = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $historyList[] = $row;
            }
        }
        echo json_encode($historyList, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_vaccination_history':
        $user_id = intval(get_input_value('user_id'));
        $ten_vacxin = trim($conn->real_escape_string(get_input_value('ten_vacxin')));
        $ngay_tiem = trim($conn->real_escape_string(get_input_value('ngay_tiem', date('Y-m-d'))));
        $so_lote = trim($conn->real_escape_string(get_input_value('so_lote')));
        $co_so = trim($conn->real_escape_string(get_input_value('co_so')));
        $trang_thai = trim($conn->real_escape_string(get_input_value('trang_thai', 'Hoàn thành')));

        if (empty($ten_vacxin)) {
            echo json_encode(["success" => false, "message" => "Tên vắc-xin không được để trống!"]);
            break;
        }

        $sql = "INSERT INTO lich_su_tiem (user_id, ten_vacxin, ngay_tiem, so_lote, co_so, trang_thai) 
                VALUES ($user_id, '$ten_vacxin', '$ngay_tiem', '$so_lote', '$co_so', '$trang_thai')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Thêm lịch sử tiêm thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_vaccination_history':
        $id = intval(get_input_value('id'));
        $user_id = intval(get_input_value('user_id'));
        $ten_vacxin = trim($conn->real_escape_string(get_input_value('ten_vacxin')));
        $ngay_tiem = trim($conn->real_escape_string(get_input_value('ngay_tiem')));
        $so_lote = trim($conn->real_escape_string(get_input_value('so_lote')));
        $co_so = trim($conn->real_escape_string(get_input_value('co_so')));
        $trang_thai = trim($conn->real_escape_string(get_input_value('trang_thai')));

        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "ID lịch sử tiêm không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE lich_su_tiem SET user_id=$user_id, ten_vacxin='$ten_vacxin', ngay_tiem='$ngay_tiem', so_lote='$so_lote', co_so='$co_so', trang_thai='$trang_thai' WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật lịch sử tiêm thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'delete_vaccination_history':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM lich_su_tiem WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa lịch sử tiêm thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi xóa: " . $conn->error]);
        }
        break;

    
    case 'get_accounts':
    case 'get_users':
        $role = $_GET['role'] ?? $_POST['role'] ?? 'all';
        $sql = "SELECT id, fullName, email, password, phone, role, status, created_at FROM users";
        if ($role !== 'all') {
            $roleEsc = $conn->real_escape_string($role);
            $sql .= " WHERE role = '$roleEsc'";
        }
        $sql .= " ORDER BY id DESC";
        $result = $conn->query($sql);
        $users = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
        }
        echo json_encode($users, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_account':
    case 'add_user':
        $fullName = trim($conn->real_escape_string(get_input_value('fullName')));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $password = trim($conn->real_escape_string(get_input_value('password', '123456')));
        $phone = trim($conn->real_escape_string(get_input_value('phone')));
        $role = $conn->real_escape_string(get_input_value('role', 'customer'));
        $status = $conn->real_escape_string(get_input_value('status', 'active'));

        if (empty($fullName) || empty($email)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập đầy đủ Họ tên và Email!"]);
            break;
        }

        $checkEmail = $conn->query("SELECT id FROM users WHERE email = '$email'");
        if ($checkEmail && $checkEmail->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Email này đã được sử dụng!"]);
            break;
        }

        $sql = "INSERT INTO users (fullName, email, password, phone, role, status) 
                VALUES ('$fullName', '$email', '$password', '$phone', '$role', '$status')";

        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Thêm tài khoản thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_account':
    case 'update_user':
        $id = intval(get_input_value('id'));
        $fullName = trim($conn->real_escape_string(get_input_value('fullName')));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $phone = trim($conn->real_escape_string(get_input_value('phone')));
        $role = trim($conn->real_escape_string(get_input_value('role', 'customer')));
        $status = trim($conn->real_escape_string(get_input_value('status', 'active')));
        $password = get_input_value('password');

        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "ID tài khoản không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE users SET fullName='$fullName', email='$email', phone='$phone', role='$role', status='$status'";
        if (!empty($password)) {
            $passEsc = $conn->real_escape_string($password);
            $sql .= ", password='$passEsc'";
        }
        $sql .= " WHERE id=$id";

        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật tài khoản thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'toggle_lock':
        $id = intval(get_input_value('id'));
        $status = $conn->real_escape_string(get_input_value('status', 'active'));
        $sql = "UPDATE users SET status='$status' WHERE id=$id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $conn->error]);
        }
        break;

    case 'delete_account':
    case 'delete_user':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        $sql = "DELETE FROM users WHERE id=$id";
        
        if ($id > 0 && $conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Xóa tài khoản thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    
    case 'get_appointments':
        $sql = "SELECT a.*, 
                       COALESCE(u.fullName, a.fullName, 'Khách lẻ') AS fullName,
                       COALESCE(doc.name, 'Chưa chọn bác sĩ') AS doctor_name, 
                       COALESCE(doc.name, 'Chưa chọn bác sĩ') AS ten_bac_si, 
                       COALESCE(d.ten_dich_vu, a.chi_tiet_don_hang, 'Tiêm chủng vắc-xin') AS service_name 
                FROM appointments a
                LEFT JOIN users u ON a.customer_id = u.id
                LEFT JOIN doctors doc ON a.doctor_id = doc.id
                LEFT JOIN dich_vu d ON a.service_id = d.id
                ORDER BY a.id DESC";
        $result = $conn->query($sql);
        $appointments = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $row['doctor_id'] = $row['doctor_name'];
                $row['doctor_name'] = $row['doctor_name'] ?? 'Chưa chọn bác sĩ';
                $row['ten_bac_si'] = $row['doctor_name'];
                $appointments[] = $row;
            }
        }
        echo json_encode($appointments, JSON_UNESCAPED_UNICODE);
        break;

    case 'create_appointment':
    case 'add_appointment':
        $fullName = trim($conn->real_escape_string(get_input_value('fullName', get_input_value('fullname'))));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $phone = trim($conn->real_escape_string(get_input_value('phone')));
        $dia_chi = trim($conn->real_escape_string(get_input_value('dia_chi')));
        $doctorId = intval(get_input_value('doctor_id', get_input_value('doctorId', 0)));
        $serviceId = intval(get_input_value('service_id', get_input_value('serviceId', 0)));
        $bookingDate = $conn->real_escape_string(get_input_value('booking_date', date('Y-m-d')));
        $bookingTime = $conn->real_escape_string(get_input_value('booking_time', date('H:i')));
        $loai_giao_dich = $conn->real_escape_string(get_input_value('loai_giao_dich', 'Lịch tiêm'));
        
        $raw_chi_tiet = get_input_value('chi_tiet_don_hang');
        if (is_array($raw_chi_tiet)) {
            $chi_tiet_don_hang = $conn->real_escape_string(implode('; ', $raw_chi_tiet));
        } else {
            $chi_tiet_don_hang = trim($conn->real_escape_string($raw_chi_tiet));
        }


        if (empty($chi_tiet_don_hang) && $serviceId > 0) {
            $servQuery = $conn->query("SELECT ten_dich_vu FROM dich_vu WHERE id = $serviceId LIMIT 1");
            if ($servQuery && $servQuery->num_rows > 0) {
                $servRow = $servQuery->fetch_assoc();
                $chi_tiet_don_hang = $conn->real_escape_string($servRow['ten_dich_vu']);
            }
        }

        if (empty($fullName) || empty($phone)) {
            echo json_encode(["success" => false, "message" => "Vui lòng điền đầy đủ thông tin bắt buộc!"]);
            break;
        }

      
            $customerId = 0;
            $findUser = $conn->query("SELECT id FROM users WHERE phone = '$phone' LIMIT 1");

            if ($findUser && $findUser->num_rows > 0) {
                $customerId = intval($findUser->fetch_assoc()['id']);
            } else {
                
                $sqlInsert = "INSERT INTO users (fullName, email, password, phone, role, status) 
                            VALUES ('$fullName', '$email', '123', '$phone', 'customer', 'active')
                            ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)";
                            
                if ($conn->query($sqlInsert)) {
                    $customerId = $conn->insert_id;
                } else {
                   
                    $fallbackQuery = $conn->query("SELECT id FROM users WHERE phone = '$phone' LIMIT 1");
                    if ($fallbackQuery && $fallbackQuery->num_rows > 0) {
                        $customerId = intval($fallbackQuery->fetch_assoc()['id']);
                    }
                }
            }

            $customerVal = ($customerId > 0) ? $customerId : "NULL";

      
        $sql = "INSERT INTO appointments (customer_id, fullName, email, phone, dia_chi, doctor_id, service_id, booking_date, booking_time, trang_thai, loai_giao_dich, chi_tiet_don_hang) 
                VALUES ($customerVal, '$fullName', '$email', '$phone', '$dia_chi', $doctorId, $serviceId, '$bookingDate', '$bookingTime', 'Chờ xác nhận', '$loai_giao_dich', '$chi_tiet_don_hang')";

        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Đặt lịch/giữ thuốc thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi cơ sở dữ liệu: " . $conn->error]);
        }
        break;

    case 'update_appointment_status':
        $id = intval(get_input_value('id', $_POST['id'] ?? 0));
        $status = trim(get_input_value('trang_thai', get_input_value('status', $_POST['trang_thai'] ?? $_POST['status'] ?? '')));
        
        if (empty($status)) {
            $status = 'Đã đến';
        }
        $statusEsc = $conn->real_escape_string($status);
        
        $sql = "UPDATE appointments SET trang_thai='$statusEsc' WHERE id=$id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật trạng thái thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'delete_appointment':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM appointments WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa lịch hẹn thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi xóa lịch hẹn: " . $conn->error]);
        }
        break;

   
    case 'get_doctors':
    case 'get_all_doctors':
        $result = $conn->query("SELECT id, name, specialty, image, mo_ta_chi_tiet FROM doctors");
        $doctors = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $doctors[] = $row;
            }
        }
        echo json_encode($doctors, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_doctor':
        $name = trim($conn->real_escape_string(get_input_value('name')));
        $specialty = trim($conn->real_escape_string(get_input_value('specialty')));
        $image = trim($conn->real_escape_string(get_input_value('image')));
        $mo_ta_chi_tiet = trim($conn->real_escape_string(get_input_value('mo_ta_chi_tiet')));

        if (empty($name)) {
            echo json_encode(["success" => false, "message" => "Tên bác sĩ không được để trống!"]);
            break;
        }

        $sql = "INSERT INTO doctors (name, specialty, image, mo_ta_chi_tiet) VALUES ('$name', '$specialty', '$image', '$mo_ta_chi_tiet')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Thêm bác sĩ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_doctor':
        $id = intval(get_input_value('id'));
        $name = trim($conn->real_escape_string(get_input_value('name')));
        $specialty = trim($conn->real_escape_string(get_input_value('specialty')));
        $image = trim($conn->real_escape_string(get_input_value('image')));
        $mo_ta_chi_tiet = trim($conn->real_escape_string(get_input_value('mo_ta_chi_tiet')));

        if ($id <= 0 || empty($name)) {
            echo json_encode(["success" => false, "message" => "Thông tin bác sĩ không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE doctors SET name='$name', specialty='$specialty', image='$image', mo_ta_chi_tiet='$mo_ta_chi_tiet' WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật bác sĩ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'delete_doctor':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM doctors WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa bác sĩ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'get_services':
    case 'get_all_services':
        $result = $conn->query("SELECT id, ten_dich_vu, do_tuoi, hinh_anh, mo_ta, gia, gia_cu, created_at FROM dich_vu ORDER BY id DESC");
        $services = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $services[] = $row;
            }
        }
        echo json_encode($services, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_service':
        $ten_dich_vu = trim($conn->real_escape_string(get_input_value('ten_dich_vu')));
        $do_tuoi = trim($conn->real_escape_string(get_input_value('do_tuoi')));
        $mo_ta = trim($conn->real_escape_string(get_input_value('mo_ta')));
        $hinh_anh = trim($conn->real_escape_string(get_input_value('hinh_anh')));
        $gia = floatval(get_input_value('gia', 0));
        $gia_cu = floatval(get_input_value('gia_cu', 0));

        if (empty($ten_dich_vu)) {
            echo json_encode(["success" => false, "message" => "Tên dịch vụ không được để trống!"]);
            break;
        }

        $sql = "INSERT INTO dich_vu (ten_dich_vu, do_tuoi, mo_ta, hinh_anh, gia, gia_cu) VALUES ('$ten_dich_vu', '$do_tuoi', '$mo_ta', '$hinh_anh', $gia, $gia_cu)";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Thêm dịch vụ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_service':
        $id = intval(get_input_value('id'));
        $ten_dich_vu = trim($conn->real_escape_string(get_input_value('ten_dich_vu')));
        $do_tuoi = trim($conn->real_escape_string(get_input_value('do_tuoi')));
        $mo_ta = trim($conn->real_escape_string(get_input_value('mo_ta')));
        $hinh_anh = trim($conn->real_escape_string(get_input_value('hinh_anh')));
        $gia = floatval(get_input_value('gia', 0));
        $gia_cu = floatval(get_input_value('gia_cu', 0));

        if ($id <= 0 || empty($ten_dich_vu)) {
            echo json_encode(["success" => false, "message" => "Thông tin không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE dich_vu SET ten_dich_vu='$ten_dich_vu', do_tuoi='$do_tuoi', mo_ta='$mo_ta', hinh_anh='$hinh_anh', gia=$gia, gia_cu=$gia_cu WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật dịch vụ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'delete_service':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM dich_vu WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa dịch vụ thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

   
    case 'get_all_news':
    case 'get_news':
        $result = $conn->query("SELECT id, tieu_de, tom_tat, noi_dung, ngay_dang, hinh_anh FROM tin_tuc ORDER BY id DESC");
        $newsList = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $newsList[] = $row;
            }
        }
        echo json_encode($newsList, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_news':
        $tieu_de = trim($conn->real_escape_string(get_input_value('tieu_de')));
        $tom_tat = trim($conn->real_escape_string(get_input_value('tom_tat')));
        $noi_dung = trim($conn->real_escape_string(get_input_value('noi_dung')));
        $hinh_anh = trim($conn->real_escape_string(get_input_value('hinh_anh')));
        $ngay_dang = trim($conn->real_escape_string(get_input_value('ngay_dang', date('Y-m-d'))));

        if (empty($tieu_de)) {
            echo json_encode(["success" => false, "message" => "Tiêu đề tin tức không được để trống!"]);
            break;
        }

        $sql = "INSERT INTO tin_tuc (tieu_de, tom_tat, noi_dung, hinh_anh, ngay_dang) VALUES ('$tieu_de', '$tom_tat', '$noi_dung', '$hinh_anh', '$ngay_dang')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Đăng tin tức thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_news':
        $id = intval(get_input_value('id'));
        $tieu_de = trim($conn->real_escape_string(get_input_value('tieu_de')));
        $tom_tat = trim($conn->real_escape_string(get_input_value('tom_tat')));
        $noi_dung = trim($conn->real_escape_string(get_input_value('noi_dung')));
        $hinh_anh = trim($conn->real_escape_string(get_input_value('hinh_anh')));
        $ngay_dang = trim($conn->real_escape_string(get_input_value('ngay_dang', date('Y-m-d'))));

        if ($id <= 0 || empty($tieu_de)) {
            echo json_encode(["success" => false, "message" => "Thông tin tin tức không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE tin_tuc SET tieu_de='$tieu_de', tom_tat='$tom_tat', noi_dung='$noi_dung', hinh_anh='$hinh_anh', ngay_dang='$ngay_dang' WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật tin tức thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'delete_news':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM tin_tuc WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa tin tức thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

  
    case 'get_contacts':
        $sql = "SELECT id, ho_ten, email, so_dien_thoai, tin_nhan, trang_thai, ngay_tao AS ngay_gui FROM lien_he ORDER BY id DESC";
        $result = $conn->query($sql);
        $contacts = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }
        }
        echo json_encode($contacts, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_contact':
        $ho_ten = trim($conn->real_escape_string(get_input_value('ho_ten')));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $so_dien_thoai = trim($conn->real_escape_string(get_input_value('so_dien_thoai')));
        $tin_nhan = trim($conn->real_escape_string(get_input_value('tin_nhan')));

        if (empty($ho_ten) || empty($email) || empty($so_dien_thoai) || empty($tin_nhan)) {
            echo json_encode(["success" => false, "message" => "Vui lòng điền đầy đủ thông tin vào các trường!"]);
            break;
        }

        $sql = "INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tin_nhan, trang_thai) 
                VALUES ('$ho_ten', '$email', '$so_dien_thoai', '$tin_nhan', 'Chưa trả lời')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cảm ơn bạn đã liên hệ! Tin nhắn của bạn đã được gửi thành công."]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'update_contact_status':
        $id = intval(get_input_value('id', $_POST['id'] ?? 0));
        $trang_thai = trim($conn->real_escape_string(get_input_value('trang_thai', $_POST['trang_thai'] ?? 'Đã trả lời')));
        
        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "ID không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE lien_he SET trang_thai = '$trang_thai' WHERE id = $id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật trạng thái thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'delete_contact':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        $sql = "DELETE FROM lien_he WHERE id=$id";
        if ($id > 0 && $conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Xóa yêu cầu thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi xóa yêu cầu: " . $conn->error]);
        }
        break;
        
   
    case 'get_staff':
        $sql = "SELECT id, fullName AS ho_ten, phone AS so_dien_thoai, email, role AS chuc_vu FROM users WHERE role IN ('staff', 'manager') ORDER BY id DESC";
        $result = $conn->query($sql);
        $staffList = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                if ($row['chuc_vu'] == 'manager') {
                    $row['chuc_vu'] = 'Quản lý / Quản trị';
                } else {
                    $row['chuc_vu'] = 'Nhân viên';
                }
                $staffList[] = $row;
            }
        }
        echo json_encode($staffList, JSON_UNESCAPED_UNICODE);
        break;

    case 'check_in':
        $nhan_vien_id = intval(get_input_value('nhan_vien_id', $_POST['nhan_vien_id'] ?? 0));
        $ngay_cham_cong = date('Y-m-d');
        $gio_vao = date('H:i:s');
        $trang_thai = 'Đang làm việc';

        if ($nhan_vien_id <= 0) {
            echo json_encode(["success" => false, "message" => "Không tìm thấy mã nhân viên!"]);
            break;
        }

        $check = $conn->query("SELECT id FROM cham_cong WHERE nhan_vien_id = $nhan_vien_id AND ngay_cham_cong = '$ngay_cham_cong'");
        if ($check && $check->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Hôm nay bạn đã thực hiện vào ca rồi!"]);
            break;
        }

        $sql = "INSERT INTO cham_cong (nhan_vien_id, ngay_cham_cong, gio_vao, trang_thai) VALUES ($nhan_vien_id, '$ngay_cham_cong', '$gio_vao', '$trang_thai')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Check-in thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;
    
    case 'check_out':
        $nhan_vien_id = intval(get_input_value('nhan_vien_id', $_POST['nhan_vien_id'] ?? 0));
        $ngay_cham_cong = date('Y-m-d');
        $gio_ra = date('H:i:s');
        $trang_thai = 'Hoàn thành ca';

        if ($nhan_vien_id <= 0) {
            echo json_encode(["success" => false, "message" => "Không tìm thấy mã nhân viên!"]);
            break;
        }

        $sql = "UPDATE cham_cong SET gio_ra = '$gio_ra', trang_thai = '$trang_thai' WHERE nhan_vien_id = $nhan_vien_id AND ngay_cham_cong = '$ngay_cham_cong'";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Check-out thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'get_attendance':
        $result = $conn->query("SELECT c.id, c.nhan_vien_id, c.ngay_cham_cong, c.gio_vao, c.gio_ra, c.trang_thai, nv.fullName AS ho_ten FROM cham_cong c LEFT JOIN users nv ON c.nhan_vien_id = nv.id ORDER BY c.id DESC");
        $list = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $list[] = $row;
            }
        }
        echo json_encode($list, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_attendance':
        $nhan_vien_id = intval(get_input_value('nhan_vien_id'));
        $ngay_cham_cong = trim($conn->real_escape_string(get_input_value('ngay_cham_cong', date('Y-m-d'))));
        $gio_vao = trim($conn->real_escape_string(get_input_value('gio_vao', '08:00')));
        $gio_ra = trim($conn->real_escape_string(get_input_value('gio_ra', '17:00')));
        $trang_thai = trim($conn->real_escape_string(get_input_value('trang_thai', 'Đúng giờ')));

        $sql = "INSERT INTO cham_cong (nhan_vien_id, ngay_cham_cong, gio_vao, gio_ra, trang_thai) VALUES ($nhan_vien_id, '$ngay_cham_cong', '$gio_vao', '$gio_ra', '$trang_thai')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $conn->error]);
        }
        break;

    case 'update_attendance':
        $id = intval(get_input_value('id'));
        $nhan_vien_id = intval(get_input_value('nhan_vien_id'));
        $ngay_cham_cong = trim($conn->real_escape_string(get_input_value('ngay_cham_cong', date('Y-m-d'))));
        $gio_vao = trim($conn->real_escape_string(get_input_value('gio_vao', '08:00')));
        $gio_ra = trim($conn->real_escape_string(get_input_value('gio_ra', '17:00')));
        $trang_thai = trim($conn->real_escape_string(get_input_value('trang_thai', 'Đúng giờ')));

        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "ID không hợp lệ!"]);
            break;
        }

        $sql = "UPDATE cham_cong SET nhan_vien_id=$nhan_vien_id, ngay_cham_cong='$ngay_cham_cong', gio_vao='$gio_vao', gio_ra='$gio_ra', trang_thai='$trang_thai' WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $conn->error]);
        }
        break;

    case 'delete_attendance':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM cham_cong WHERE id=$id")) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $conn->error]);
        }
        break;

  
    case 'login':
        $email = trim($conn->real_escape_string(get_input_value('email', $_POST['email'] ?? '')));
        $password = trim($conn->real_escape_string(get_input_value('password', $_POST['password'] ?? '')));

        if (empty($email) || empty($password)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập đầy đủ email và mật khẩu!"]);
            break;
        }

        $sql = "SELECT id, fullName, email, phone, role, status FROM users WHERE email = '$email' AND password = '$password' LIMIT 1";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            if ($user['status'] === 'locked') {
                echo json_encode(["success" => false, "message" => "Tài khoản của bạn đã bị khóa!"]);
                break;
            }

            echo json_encode([
                "success" => true,
                "message" => "Đăng nhập thành công!",
                "user" => $user
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["success" => false, "message" => "Email hoặc mật khẩu không chính xác!"]);
        }
        break;

   
    case 'get_danhgia':
    case 'get_reviews':
        $sql = "SELECT id, loai, target_id, ho_ten, email, lien_he, so_sao, noi_dung, ngay_tao FROM danh_gia ORDER BY id DESC";
        $result = $conn->query($sql);
        $reviews = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $reviews[] = $row;
            }
        }
        echo json_encode($reviews, JSON_UNESCAPED_UNICODE);
        break;

    case 'add_review':
        $loai = trim($conn->real_escape_string(get_input_value('loai', 'bac_si')));
        $target_id = intval(get_input_value('target_id', 0));
        $ho_ten = trim($conn->real_escape_string(get_input_value('ho_ten')));
        $email = trim($conn->real_escape_string(get_input_value('email')));
        $lien_he = trim($conn->real_escape_string(get_input_value('lien_he')));
        $so_sao = intval(get_input_value('so_sao', 5));
        $noi_dung = trim($conn->real_escape_string(get_input_value('noi_dung')));

        if (empty($ho_ten) || empty($noi_dung)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập họ tên và nội dung đánh giá!"]);
            break;
        }

        $sql = "INSERT INTO danh_gia (loai, target_id, ho_ten, email, lien_he, so_sao, noi_dung) 
                VALUES ('$loai', $target_id, '$ho_ten', '$email', '$lien_he', $so_sao, '$noi_dung')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Gửi đánh giá thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi CSDL: " . $conn->error]);
        }
        break;

    case 'delete_danhgia':
    case 'delete_review':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM danh_gia WHERE id=$id")) {
            echo json_encode(["success" => true, "message" => "Xóa đánh giá thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi xóa đánh giá: " . $conn->error]);
        }
        break;

  
    case 'get_inventory':
       
        $sql = "SELECT id, ma_lo, ten_vacxin, hang_san_xuat, so_luong_ton, han_su_dung, trang_thai_kho FROM kho_vacxin ORDER BY id DESC";
        $result = $conn->query($sql);
        $inventory = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $inventory[] = $row;
            }
        }
        echo json_encode($inventory, JSON_UNESCAPED_UNICODE);
        break;

   case 'add_inventory':
        $ma_lo = trim($conn->real_escape_string(get_input_value('ma_lo')));
        $ten_vacxin = trim($conn->real_escape_string(get_input_value('ten_vacxin')));
        $hang_san_xuat = trim($conn->real_escape_string(get_input_value('hang_san_xuat')));
        $so_luong_ton = intval(get_input_value('so_luong_ton', 0));
        $han_su_dung = trim($conn->real_escape_string(get_input_value('han_su_dung', date('Y-m-d'))));

        if (empty($ma_lo) || empty($ten_vacxin)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập Mã lô và Tên vắc-xin!"]);
            break;
        }

        $trang_thai_kho = "Đủ tiêu chuẩn";
        $today = date('Y-m-d');
        
        if ($han_su_dung < $today) {
            $trang_thai_kho = "Hết hạn";
        } else if ($so_luong_ton < 10) { 
            $trang_thai_kho = "Sắp hết";
        }

        $sql = "INSERT INTO kho_vacxin (ma_lo, ten_vacxin, hang_san_xuat, so_luong_ton, han_su_dung, trang_thai_kho) 
                VALUES ('$ma_lo', '$ten_vacxin', '$hang_san_xuat', $so_luong_ton, '$han_su_dung', '$trang_thai_kho')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Thêm lô vắc-xin vào kho thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'update_inventory':
        $id = intval(get_input_value('id', 0));
        $ma_lo = trim($conn->real_escape_string(get_input_value('ma_lo')));
        $ten_vacxin = trim($conn->real_escape_string(get_input_value('ten_vacxin')));
        $hang_san_xuat = trim($conn->real_escape_string(get_input_value('hang_san_xuat')));
        $so_luong_ton = intval(get_input_value('so_luong_ton', 0));
        $han_su_dung = trim($conn->real_escape_string(get_input_value('han_su_dung', date('Y-m-d'))));

        if ($id <= 0) {
            echo json_encode(["success" => false, "message" => "ID lô vắc-xin không hợp lệ!"]);
            break;
        }

        if (empty($ma_lo) || empty($ten_vacxin)) {
            echo json_encode(["success" => false, "message" => "Vui lòng nhập Mã lô và Tên vắc-xin!"]);
            break;
        }

       
        $trang_thai_kho = "Đủ tiêu chuẩn";
        $today = date('Y-m-d');
        
        if ($han_su_dung < $today) {
            $trang_thai_kho = "Hết hạn";
        } else if ($so_luong_ton < 10) {
            $trang_thai_kho = "Sắp hết";
        }

        $sql = "UPDATE kho_vacxin SET 
                    ma_lo = '$ma_lo', 
                    ten_vacxin = '$ten_vacxin', 
                    hang_san_xuat = '$hang_san_xuat', 
                    so_luong_ton = $so_luong_ton, 
                    han_su_dung = '$han_su_dung', 
                    trang_thai_kho = '$trang_thai_kho' 
                WHERE id = $id";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Cập nhật lô vắc-xin thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
        }
        break;

    case 'delete_inventory':
        $id = intval($_GET['id'] ?? get_input_value('id', 0));
        if ($id > 0 && $conn->query("DELETE FROM kho_vacxin WHERE id = $id")) {
            echo json_encode(["success" => true, "message" => "Xóa lô vắc-xin thành công!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi xóa: " . $conn->error]);
        }
        break;

        case 'get_statistics':
   
    $sql_rev = "SELECT COUNT(a.id) as luot_tiem, SUM(d.gia) as doanh_thu 
                FROM appointments a 
                JOIN dich_vu d ON a.service_id = d.id 
                WHERE a.trang_thai = 'Đã đến'";
    $res_rev = $conn->query($sql_rev)->fetch_assoc();

   
    $sql_stock = "SELECT SUM(so_luong_ton) as tong_ton FROM kho_vacxin";
    $res_stock = $conn->query($sql_stock)->fetch_assoc();

   
    $sql_staff = "SELECT COUNT(*) as tong_nv FROM users WHERE role = 'staff'";
    $res_staff = $conn->query($sql_staff)->fetch_assoc();

    echo json_encode([
        "success" => true,
        "data" => [
            "doanh_thu" => floatval($res_rev['doanh_thu'] ?? 0),
            "tong_luot_tiem" => intval($res_rev['luot_tiem'] ?? 0),
            "tong_ton_kho" => intval($res_stock['tong_ton'] ?? 0),
            "tong_nhan_vien" => intval($res_staff['tong_nv'] ?? 0)
        ]
    ], JSON_UNESCAPED_UNICODE);
    break;

    default:
        echo json_encode(["success" => false, "message" => "Yêu cầu hành động không hợp lệ"], JSON_UNESCAPED_UNICODE);
        break;
}

        

$conn->close();
?>