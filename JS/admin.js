const API_URL = (window.location.port === '5500' || window.location.port === '5501' || window.location.protocol === 'file:')
  ? 'http://localhost/vaccination-center/api.php'
  : 'api.php';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role === 'customer') {
    alert("Bạn không có quyền truy cập trang quản trị!");
    window.location.href = 'index.html';
    return;
  }

  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    userInfo.innerText = `${currentUser.fullName || 'User'} (${(currentUser.role || 'USER').toUpperCase()})`;
  }

  loadAppointments();
  loadAccounts();
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = "login.html";
});

window.loadAccounts = async () => {
  const tbody = document.getElementById('accounts-list');
  if (!tbody) return;

  const roleFilter = document.getElementById('filter-role')?.value || 'all';

  try {
    const res = await fetch(`${API_URL}?action=get_users&role=${roleFilter}`);
    const accounts = await res.json();

    tbody.innerHTML = '';

    accounts.forEach((data) => {
      const id = data.id;
      const role = data.role || 'customer';
      const isLocked = data.status === 'locked';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${data.fullName || 'Chưa cập nhật'}</b></td>
        <td>${data.email || '---'}</td>
        <td style="font-weight: 600; color: #d97706;">${data.password || '---'}</td>
        <td>${data.phone || '---'}</td>
        <td><span class="badge ${getRoleBadgeClass(role)}">${role.toUpperCase()}</span></td>
        <td>
          <span style="color: ${isLocked ? '#ef4444' : '#22c55e'}; font-weight: bold;">
            ${isLocked ? '🔒 Đã khóa' : '🟢 Hoạt động'}
          </span>
        </td>
        <td>
          <button class="btn" style="background: #eab308; color: white; padding: 4px 8px;" 
            onclick="openEditAccountModal('${id}', '${data.fullName || ''}', '${data.email || ''}', '${data.phone || ''}', '${role}')">Sửa</button>
          <button class="btn" style="background: ${isLocked ? '#22c55e' : '#f97316'}; color: white; padding: 4px 8px;" 
            onclick="toggleLockAccount('${id}', ${isLocked})">
            ${isLocked ? 'Mở khóa' : 'Khóa'}
          </button>
          <button class="btn btn-danger" style="padding: 4px 8px;" onclick="deleteAccount('${id}')">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi tải danh sách tài khoản:", err);
  }
};

window.openAccountModal = () => {
  document.getElementById('acc-id').value = '';
  document.getElementById('form-account').reset();
  document.getElementById('modal-title').innerText = 'Thêm tài khoản mới';
  document.getElementById('acc-email').disabled = false;
  document.getElementById('account-modal').style.display = 'flex';
};

window.openEditAccountModal = (id, name, email, phone, role) => {
  document.getElementById('acc-id').value = id;
  document.getElementById('acc-name').value = name;
  document.getElementById('acc-email').value = email;
  document.getElementById('acc-email').disabled = true;
  document.getElementById('acc-phone').value = phone;
  document.getElementById('acc-role').value = role;
  
  const passwordInput = document.getElementById('acc-password');
  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.placeholder = 'Nhập mật khẩu mới (Bỏ trống nếu giữ nguyên)';
  }

  document.getElementById('modal-title').innerText = 'Chỉnh sửa tài khoản';
  document.getElementById('account-modal').style.display = 'flex';
};

window.closeAccountModal = () => {
  document.getElementById('account-modal').style.display = 'none';
};

document.getElementById('form-account')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('acc-id').value;
  const fullName = document.getElementById('acc-name').value;
  const email = document.getElementById('acc-email').value;
  const phone = document.getElementById('acc-phone').value;
  const role = document.getElementById('acc-role').value;
  const password = document.getElementById('acc-password').value;

  try {
    let action = id ? 'update_user' : 'add_user';
    let bodyData = { id, fullName, email, phone, role, password };

    if (!id && (!password || password.length < 6)) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    const res = await fetch(`${API_URL}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const result = await res.json();
    if (result.success) {
      alert(id ? "Đã cập nhật tài khoản!" : "Đã tạo tài khoản thành công!");
      closeAccountModal();
      loadAccounts();
    } else {
      alert("Lỗi: " + result.message);
    }
  } catch (err) {
    alert("Lỗi kết nối máy chủ: " + err.message);
  }
});

window.toggleLockAccount = async (id, currentStatus) => {
  const newStatus = currentStatus ? 'active' : 'locked';
  const actionText = currentStatus ? 'MỞ KHÓA' : 'KHÓA';

  if (confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) {
    try {
      const res = await fetch(`${API_URL}?action=toggle_lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Đã ${actionText} thành công!`);
        loadAccounts();
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  }
};

window.deleteAccount = async (id) => {
  if (confirm("Bạn có chắc chắn muốn XÓA tài khoản này?")) {
    try {
      const res = await fetch(`${API_URL}?action=delete_user&id=${id}`);
      const result = await res.json();
      if (result.success) {
        alert("Đã xóa tài khoản!");
        loadAccounts();
      }
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  }
};

function getRoleBadgeClass(role) {
  switch (role) {
    case 'manager':
    case 'admin': return 'badge-success';
    case 'staff': return 'badge-warning';
    default: return '';
  }
}

async function loadAppointments() {
  const tbody = document.getElementById('appointments-list');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}?action=get_appointments`);
    const appointments = await res.json();

    tbody.innerHTML = '';

    appointments.forEach((data) => {
      const id = data.id;
      const status = data.status || 'pending';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${data.fullname || '---'}</b></td>
        <td>${data.phone || '---'}</td>
        <td>${data.service_name || 'Dịch vụ #' + data.service_id} / ${data.doctor_name || 'Bác sĩ #' + data.doctor_id}</td>
        <td>${data.booking_date || ''} (${data.booking_time || ''})</td>
        <td><span class="badge ${status === 'confirmed' ? 'badge-success' : 'badge-warning'}">${status}</span></td>
        <td>
          <select onchange="updateStatus('${id}', this.value)" style="padding: 4px; border-radius: 4px;">
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
            <option value="canceled" ${status === 'canceled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi khi tải lịch hẹn:", err);
  }
}

window.updateStatus = async (id, newStatus) => {
  try {
    const res = await fetch(`${API_URL}?action=update_appointment_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    const result = await res.json();
    if (result.success) {
      alert("Đã cập nhật trạng thái lịch hẹn!");
    }
  } catch (error) {
    alert("Lỗi cập nhật: " + error.message);
  }
};