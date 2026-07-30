const API_URL = (window.location.port === '5500' || window.location.port === '5501' || window.location.protocol === 'file:')
  ? 'http://localhost/vaccination-center/api.php'
  : 'api.php';

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
  "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

document.addEventListener('DOMContentLoaded', () => {
  checkAuthHeader();
  setupDateAndTimeslots();
  loadBookingFormData();
  loadHomeServices();
  initBookingForm();
});

  document.addEventListener("DOMContentLoaded", async () => {
    const doctorsContainer = document.getElementById('doctors-grid-container');
    if (!doctorsContainer) return;

    let doctors = [];
    try {
      
      const response = await fetch('api.php?action=get_all_doctors');
      if (response.ok) {
        doctors = await response.json();
      }
    } catch (error) {
      console.error("Không thể kết nối API lấy danh sách bác sĩ:", error);
    }

    
    if (Array.isArray(doctors) && doctors.length > 0) {
      doctorsContainer.innerHTML = doctors.map(doc => `
        <div class="doctor-card">
          <img src="${doc.hinh_anh || 'IMAGE/anh1.png'}" alt="${doc.ho_ten}" onerror="this.src='IMAGE/anh1.png'">
          <h3>${doc.ho_ten}</h3>
          <p>${doc.hoc_vi_chuc_vu || 'Bác sĩ chuyên khoa'}</p>
          <button class="btn-primary" onclick="window.location.href='#booking'">ĐẶT LỊCH HẸN</button>
        </div>
      `).join('');
    } else {
      doctorsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #64748b;">Chưa có thông tin bác sĩ trong hệ thống.</p>';
    }
  });
function checkAuthHeader() {
  const btnLogin = document.getElementById('btn-login-header');
  const userNameEl = document.getElementById('header-user-name');
  const btnLogout = document.getElementById('btn-logout-header');

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (currentUser) {
    if (btnLogin) btnLogin.style.display = 'none';
    if (userNameEl) {
      userNameEl.style.display = 'inline-block';
      userNameEl.innerText = `Xin chào, ${currentUser.fullName || currentUser.ho_ten || 'Khách hàng'}`;
    }
    if (btnLogout) {
      btnLogout.style.display = 'inline-block';
      btnLogout.addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
          localStorage.removeItem('currentUser');
          window.location.reload();
        }
      });
    }

    const nameInput = document.getElementById('book-name');
    const emailInput = document.getElementById('book-email');
    const phoneInput = document.getElementById('book-phone');

    if (nameInput) nameInput.value = currentUser.fullName || currentUser.ho_ten || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (phoneInput) phoneInput.value = currentUser.phone || currentUser.so_dien_thoai || '';
  }
}

function setupDateAndTimeslots() {
  const dateInput = document.getElementById('book-date');
  const timeSelect = document.getElementById('book-time');

  if (!dateInput || !timeSelect) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const minDateStr = `${year}-${month}-${day}`;

  dateInput.min = minDateStr;

  const currentHour = now.getHours();
  if (currentHour >= 17 && !dateInput.value) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tYear = tomorrow.getFullYear();
    const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tDay = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${tYear}-${tMonth}-${tDay}`;
  } else if (!dateInput.value) {
    dateInput.value = minDateStr;
  }

  function updateAvailableTimeSlots() {
    const selectedDate = dateInput.value;
    timeSelect.innerHTML = '<option value="">-- Chọn giờ --</option>';

    if (!selectedDate) return;

    const isToday = (selectedDate === minDateStr);
    const curH = now.getHours();
    const curM = now.getMinutes();

    let availableCount = 0;

    TIME_SLOTS.forEach(timeStr => {
      const [h, m] = timeStr.split(':').map(Number);

      let isPast = false;
      if (isToday) {
        if (h < curH || (h === curH && m <= curM)) {
          isPast = true;
        }
      }

      if (!isPast) {
        const option = document.createElement('option');
        option.value = timeStr;
        option.textContent = timeStr;
        timeSelect.appendChild(option);
        availableCount++;
      }
    });

    if (availableCount === 0 && isToday) {
      const option = document.createElement('option');
      option.value = "";
      option.disabled = true;
      option.selected = true;
      option.textContent = "Hôm nay đã hết giờ (Hãy chọn ngày khác)";
      timeSelect.appendChild(option);
    }
  }

  updateAvailableTimeSlots();
  dateInput.addEventListener('change', updateAvailableTimeSlots);
}

async function loadBookingFormData() {
  const doctorSelect = document.getElementById('book-doctor');
  const serviceSelect = document.getElementById('book-service');

  try {
    const resDoc = await fetch(`${API_URL}?action=get_doctors`);
    if (resDoc.ok) {
      const doctors = await resDoc.json();
      if (doctorSelect && Array.isArray(doctors) && doctors.length > 0) {
        doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>' +
          doctors.map(d => `<option value="${d.id}">${d.ho_ten || d.fullName}</option>`).join('');
      } else {
        setFallbackDoctors(doctorSelect);
      }
    } else {
      setFallbackDoctors(doctorSelect);
    }
  } catch (e) {
    setFallbackDoctors(doctorSelect);
  }

  try {
    const resSer = await fetch(`${API_URL}?action=get_services`);
    if (resSer.ok) {
      const services = await resSer.json();
      if (serviceSelect && Array.isArray(services) && services.length > 0) {
        serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>' +
          services.map(s => `<option value="${s.id}">${s.ten_dich_vu || s.serviceName}</option>`).join('');
      } else {
        setFallbackServices(serviceSelect);
      }
    } else {
      setFallbackServices(serviceSelect);
    }
  } catch (e) {
    setFallbackServices(serviceSelect);
  }
}

async function loadHomeServices() {
  const servicesContainer = document.querySelector('.services-grid');
  if (!servicesContainer) return;

  try {
    const response = await fetch(`${API_URL}?action=get_all_services`);
    if (response.ok) {
      const services = await response.json();
      if (Array.isArray(services) && services.length > 0) {
        servicesContainer.innerHTML = services.map(s => `
          <div class="service-card">
            <img src="${s.hinh_anh || 'IMAGE/anh2.jpg'}" alt="${s.ten_dich_vu}">
            <div class="service-card-body">
              <h3>${s.ten_dich_vu}</h3>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Đối tượng: ${s.do_tuoi || 'Mọi độ tuổi'}</p>
              <a href="#booking">Xem ngay ➔</a>
            </div>
          </div>
        `).join('');
      } else {
        servicesContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chưa có dịch vụ nào.</p>';
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách dịch vụ:", error);
  }
}

function setFallbackDoctors(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = `
    <option value="">Chọn bác sĩ</option>
    <option value="1">BS. TRẦN THÚY VÂN (CK I - Sản Phụ Khoa)</option>
    <option value="2">BS. NGUYỄN ANH TUẤN (Bác sĩ Khoa Huyết Học)</option>
    <option value="3">BS. TRẦN TIẾN QUANG (CK I - Sản Phụ Khoa)</option>
  `;
}

function setFallbackServices(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = `
    <option value="">Chọn dịch vụ</option>
    <option value="1">Gói vắc xin cho trẻ trước khi đi học (4-6 tuổi)</option>
    <option value="2">Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)</option>
    <option value="3">Gói vắc xin cho trẻ sơ sinh</option>
    <option value="4">Gói vắc xin cho phụ nữ sắp & trong khi mang thai</option>
  `;
}

function initBookingForm() {
  const bookingForm = document.getElementById('booking-form');
  if (!bookingForm) return;

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('book-name')?.value.trim();
    const doctorSelect = document.getElementById('book-doctor');
    const email = document.getElementById('book-email')?.value.trim();
    const serviceSelect = document.getElementById('book-service');
    const phone = document.getElementById('book-phone')?.value.trim();
    const date = document.getElementById('book-date')?.value;
    const time = document.getElementById('book-time')?.value;

    if (!name || !phone || !date || !time) {
      alert("Vui lòng nhập đầy đủ Họ tên, Số điện thoại, Ngày và Giờ khám!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ (Phải đúng 10 số, bắt đầu bằng số 0)!");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const bookingData = {
      fullName: name,
      email: email,
      phone: phone,
      doctorId: doctorSelect?.value || null,
      serviceId: serviceSelect?.value || null,
      appointmentDate: date,
      appointmentTime: time
    };

    try {
      const response = await fetch(`${API_URL}?action=create_appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const result = await response.json();

      if (result.success) {
        alert("🎉 Đặt lịch hẹn thành công! Đội ngũ tư vấn sẽ liên hệ lại với bạn sớm nhất.");
        bookingForm.reset();
        setupDateAndTimeslots();
      } else {
        alert("Lỗi: " + (result.message || "Không thể đặt lịch."));
      }
    } catch (err) {
      alert("Đã xảy ra lỗi kết nối đến máy chủ!");
    }
  });
}