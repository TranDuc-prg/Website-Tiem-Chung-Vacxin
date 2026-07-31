    const API_URL = 'api.php';
    const tensv = { "id": 5, "ho_ten": "TRAN VIET DUC", "vai_tro": "Quản trị" };

    let quillDoctorDesc;

    document.addEventListener('DOMContentLoaded', () => {
      const userDisplay = document.getElementById('user-profile-display');
      if (userDisplay) {
        userDisplay.innerText = `${tensv.ho_ten} (${tensv.vai_tro})`;
      }

      const today = new Date().toISOString().split('T')[0];
      const newsDateInput = document.getElementById('news-date');
      if(newsDateInput) newsDateInput.value = today;

      const dateLabel = document.getElementById('today-date-label');
      if(dateLabel) dateLabel.innerText = `Hôm nay: ${today}`;

      quillDoctorDesc = new Quill('#doctor-editor-container', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['image', 'video', 'link'], 
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean']
          ]
        }
      });

      startLiveClock();

      loadStaffAppointments();
      initServiceForm();
      initNewsForm();
      initDoctorForm();
    });

    function startLiveClock() {
      function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.innerText = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('vi-VN', options);
        const dateEl = document.getElementById('live-date');
        if (dateEl) dateEl.innerText = dateStr;
      }
      updateClock();
      setInterval(updateClock, 1000);
    }

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-tab');
        document.getElementById(target).classList.add('active');
        document.getElementById('current-title').innerText = this.innerText;

        if (target === 'tab-services') loadStaffServices();
        else if (target === 'tab-doctors') loadStaffDoctors();
        else if (target === 'tab-news') loadStaffNews();
        else if (target === 'tab-customers') loadCustomers();
        else if (target === 'tab-support') loadSupportContacts(); 
        else if (target === 'tab-attendance') checkTodayAttendanceStatus();
        else if (target === 'tab-checkin' || target === 'tab-appointments') loadStaffAppointments(); 
      });
    });

    async function loadStaffAppointments() {
      try {
        const response = await fetch(`${API_URL}?action=get_appointments`);
        if (response.ok) {
          const appointments = await response.json();
          renderCheckinTable(appointments);
          renderTodayAppointmentsTable(appointments);
        }
      } catch (error) { console.error("Lỗi tải lịch hẹn:", error); }
    }

    function renderCheckinTable(list) {
      const tbody = document.getElementById('appointmentTableBody');
      if (!tbody) return;
      if (!Array.isArray(list) || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">Không có lịch hẹn nào.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(item => {
        let badgeClass = 'badge-pending';
        let statusText = item.trang_thai || 'Chờ xác nhận';
        if (statusText === 'Đã đến') badgeClass = 'badge-arrived';
        else if (statusText === 'Không đến') badgeClass = 'badge-missing';
        else if (statusText === 'Hủy') badgeClass = 'badge-cancelled';

        return `
          <tr>
            <td><strong>${escapeHtml(item.ho_ten || item.fullName || 'Khách lẻ')}</strong><br><small style="color: var(--text-muted);">${escapeHtml(item.email || '')}</small></td>
            <td>${escapeHtml(item.phone || '')}</td>
            <td>${escapeHtml(item.service_name || 'Tiêm chủng vắc-xin')}</td>
            <td><span style="color: var(--primary); font-weight: 600;">${escapeHtml(item.doctor_id || item.doctor_name || 'Chưa chọn bác sĩ')}</span></td>
            <td>${escapeHtml(item.booking_time || '')} <br><small style="color: var(--text-muted);">(${escapeHtml(item.booking_date || '')})</small></td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>
              <div class="actions">
                <button class="btn-action btn-arrived" onclick="updateStatus(${item.id}, 'Đã đến')" title="Đã đến">✓</button>
                <button class="btn-action btn-missing" onclick="updateStatus(${item.id}, 'Không đến')" title="Không đến">✕</button>
                <button class="btn-action btn-cancel-status" onclick="updateStatus(${item.id}, 'Hủy')" title="Hủy">Hủy</button>
                <button class="btn-action btn-delete-row" onclick="deleteAppointment(${item.id})" title="Xóa">🗑</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderTodayAppointmentsTable(list) {
      const tbody = document.getElementById('appointmentTodayTableBody');
      if (!tbody) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const todayList = Array.isArray(list) ? list.filter(item => (item.booking_date || '').startsWith(todayStr)) : [];

      if (todayList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">Không có lịch hẹn nào trong hôm nay.</td></tr>';
        return;
      }

      tbody.innerHTML = todayList.map(item => {
        let badgeClass = 'badge-pending';
        let statusText = item.trang_thai || 'Chờ xác nhận';
        if (statusText === 'Đã đến') badgeClass = 'badge-arrived';
        else if (statusText === 'Không đến') badgeClass = 'badge-missing';
        else if (statusText === 'Hủy') badgeClass = 'badge-cancelled';

        return `
          <tr>
            <td><strong>${escapeHtml(item.fullName || item.ho_ten || 'Khách lẻ')}</strong><br><small style="color: var(--text-muted);">${escapeHtml(item.email || '')}</small></td>
            <td>${escapeHtml(item.phone || '')}</td>
            <td>${escapeHtml(item.service_name || 'Tiêm chủng vắc-xin')}</td>
            <td><span style="color: var(--primary); font-weight: 600;">${escapeHtml(item.doctor_id || item.doctor_name || 'Chưa chọn bác sĩ')}</span></td>
            <td>${escapeHtml(item.booking_time || '')} <br><small style="color: var(--text-muted);">(${escapeHtml(item.booking_date || '')})</small></td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>
              <div class="actions">
                <button class="btn-action btn-arrived" onclick="updateStatus(${item.id}, 'Đã đến')" title="Đã đến">✓</button>
                <button class="btn-action btn-missing" onclick="updateStatus(${item.id}, 'Không đến')" title="Không đến">✕</button>
                <button class="btn-action btn-cancel-status" onclick="updateStatus(${item.id}, 'Hủy')" title="Hủy">Hủy</button>
                <button class="btn-action btn-delete-row" onclick="deleteAppointment(${item.id})" title="Xóa">🗑</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function updateStatus(id, status) {
      if (!id) return;
      try {
        const response = await fetch(`${API_URL}?action=update_appointment_status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, trang_thai: status }) 
        });
        const result = await response.json();
        if (result.success) loadStaffAppointments();
        else alert("Lỗi: " + (result.message || "Không thể cập nhật"));
      } catch (e) { alert("Lỗi kết nối máy chủ!"); }
    }

    async function deleteAppointment(id) {
      if (!id) return;
      if (confirm('Bạn có chắc chắn muốn xóa lịch hẹn này không?')) {
        try {
          const response = await fetch(`${API_URL}?action=delete_appointment&id=${id}`);
          const result = await response.json();
          if (result.success) loadStaffAppointments();
          else alert('Lỗi xóa lịch hẹn');
        } catch (error) { alert('Lỗi kết nối máy chủ!'); }
      }
    }

    function filterCheckinTable() {
      let input = document.getElementById('searchInput').value.toLowerCase();
      let rows = document.getElementById('appointmentTableBody').getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = rows[i].textContent.toLowerCase().includes(input) ? "" : "none";
      }
    }

    async function loadStaffServices() {
      try {
        const res = await fetch(`${API_URL}?action=get_all_services`);
        if (res.ok) {
          const services = await res.json();
          const tbody = document.querySelector('#services-table tbody');
          if (!tbody) return;
          tbody.innerHTML = services.map(s => `
            <tr>
              <td>${s.id}</td>
              <td><strong>${escapeHtml(s.ten_dich_vu)}</strong></td>
              <td>${escapeHtml(s.do_tuoi || 'Mọi độ tuổi')}</td>
              <td><span style="color: var(--primary); font-weight: bold;">${Number(s.gia || 0).toLocaleString()} đ</span></td>
              <td><div style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(s.mo_ta || '')}</div></td>
              <td>${s.hinh_anh ? `<img src="${escapeHtml(s.hinh_anh)}" style="width:35px;height:35px;object-fit:cover;border-radius:4px;">` : 'Không'}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-warning" style="padding: 5px 10px; font-size: 12px;" onclick='editService(${JSON.stringify(s)})'>Sửa</button>
                  <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteService(${s.id})">Xóa</button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) { console.error(err); }
    }

    function initServiceForm() {
      const form = document.getElementById('service-form');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceId = document.getElementById('service-id').value;
        const actionType = serviceId ? 'update_service' : 'add_service';

        const bodyData = {
          id: serviceId ? parseInt(serviceId) : undefined,
          ten_dich_vu: document.getElementById('service-name').value.trim(),
          do_tuoi: document.getElementById('service-age').value.trim(),
          gia: document.getElementById('service-price').value.trim(),
          gia_cu: document.getElementById('service-old-price').value.trim(),
          mo_ta: document.getElementById('service-desc').value.trim(),
          hinh_anh: document.getElementById('service-image').value.trim()
        };

        const res = await fetch(`${API_URL}?action=${actionType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        const result = await res.json();
        if (result.success) {
          alert(serviceId ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ thành công!");
          resetServiceForm();
          loadStaffServices();
        } else { alert("Lỗi: " + result.message); }
      });
    }

    function editService(service) {
      document.getElementById('service-form-title').innerText = "✏️ Cập nhật thông tin dịch vụ";
      document.getElementById('service-id').value = service.id;
      document.getElementById('service-name').value = service.ten_dich_vu || '';
      document.getElementById('service-age').value = service.do_tuoi || '';
      document.getElementById('service-price').value = service.gia || '';
      document.getElementById('service-old-price').value = service.gia_cu || '';
      document.getElementById('service-desc').value = service.mo_ta || '';
      document.getElementById('service-image').value = service.hinh_anh || '';

      document.getElementById('btn-save-service').innerText = "Cập nhật dịch vụ";
      document.getElementById('btn-cancel-edit-service').style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetServiceForm() {
      document.getElementById('service-form-title').innerText = "➕ Thêm Dịch vụ / Gói Vắc-xin Mới";
      document.getElementById('service-form').reset();
      document.getElementById('service-id').value = '';
      document.getElementById('btn-save-service').innerText = "Lưu dịch vụ";
      document.getElementById('btn-cancel-edit-service').style.display = "none";
    }

    async function deleteService(id) {
      if (confirm("Xóa dịch vụ này?")) {
        const res = await fetch(`${API_URL}?action=delete_service&id=${id}`);
        const result = await res.json();
        if (result.success) loadStaffServices();
      }
    }

    async function loadStaffDoctors() {
      try {
        const res = await fetch(`${API_URL}?action=get_all_doctors`);
        if (res.ok) {
          const doctors = await res.json();
          const tbody = document.querySelector('#doctors-table tbody');
          if (!tbody) return;
          
          if (!Array.isArray(doctors) || doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">Chưa có dữ liệu bác sĩ.</td></tr>';
            return;
          }

          tbody.innerHTML = doctors.map(d => {
            const rawDesc = d.mo_ta_chi_tiet || d.description || d.mo_ta || d.bio || d.chitiet || d.details || d.content || '';
            const displayDesc = rawDesc.trim() !== ''
              ? `<div style="max-width:350px; max-height:120px; overflow:auto; white-space:normal; line-height:1.5;">${rawDesc}</div>`
              : '<span style="color:#94a3b8;font-style:italic;">Chưa có mô tả</span>';

            return `
              <tr>
                <td>${d.id}</td>
                <td>${d.image ? `<img src="${escapeHtml(d.image)}" style="width:40px;height:40px;object-fit:cover;border-radius:50%;">` : 'Không có'}</td>
                <td><strong>${escapeHtml(d.name)}</strong></td>
                <td>${escapeHtml(d.specialty || '')}</td>
                <td>${displayDesc}</td>
                <td>
                  <div class="actions">
                    <button class="btn btn-warning" style="padding: 5px 10px; font-size: 12px;" onclick='editDoctor(${JSON.stringify(d)})'>Sửa</button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteDoctor(${d.id})">Xóa</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) { console.error("Lỗi tải bác sĩ:", err); }
    }

    function initDoctorForm() {
      const form = document.getElementById("doctor-form");
      if (!form) return;

      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const doctorId = document.getElementById("doctor-id").value;
        const actionType = doctorId ? "update_doctor" : "add_doctor";
        const doctorDesc = quillDoctorDesc ? quillDoctorDesc.root.innerHTML : '';

        const bodyData = {
          id: doctorId ? parseInt(doctorId) : undefined,
          name: document.getElementById("doctor-name").value.trim(),
          specialty: document.getElementById("doctor-specialty").value.trim(),
          image: document.getElementById("doctor-image").value.trim(),
          mo_ta_chi_tiet: doctorDesc
        };

        try {
          const response = await fetch(`${API_URL}?action=${actionType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
          });

          const result = await response.json();

          if (result.success) {
            alert(doctorId ? "Cập nhật bác sĩ thành công!" : "Thêm bác sĩ thành công!");
            resetDoctorForm();
            loadStaffDoctors();
          } else {
            alert("Lỗi: " + result.message);
          }
        } catch (err) {
          console.error(err);
          alert("Không thể kết nối tới máy chủ!");
        }
      });
    }

    function editDoctor(doctor) {
      document.getElementById("doctor-id").value = doctor.id;
      document.getElementById("doctor-name").value = doctor.name;
      document.getElementById("doctor-specialty").value = doctor.specialty;
      document.getElementById("doctor-image").value = doctor.image;

      const rawDesc = doctor.mo_ta_chi_tiet || doctor.description || doctor.mo_ta || '';
      if (quillDoctorDesc) {
        quillDoctorDesc.root.innerHTML = rawDesc;
      }

      document.getElementById("doctor-form-title").innerText = "✏️ Cập nhật bác sĩ";
      document.getElementById("btn-cancel-edit-doctor").style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetDoctorForm() {
      document.getElementById("doctor-form").reset();
      document.getElementById("doctor-id").value = "";
      if (quillDoctorDesc) {
        quillDoctorDesc.setContents([]);
      }
      document.getElementById("doctor-form-title").innerText = "➕ Thêm Bác sĩ Mới";
      document.getElementById("btn-cancel-edit-doctor").style.display = "none";
    }

    async function deleteDoctor(id) {
      if (confirm("Bạn có chắc chắn muốn xóa bác sĩ này không?")) {
        try {
          const res = await fetch(`${API_URL}?action=delete_doctor&id=${id}`);
          const result = await res.json();
          if (result.success) loadStaffDoctors();
          else alert("Lỗi khi xóa bác sĩ.");
        } catch (err) { alert("Lỗi kết nối máy chủ!"); }
      }
    }

    async function loadStaffNews() {
      try {
        const res = await fetch(`${API_URL}?action=get_all_news`);
        if (res.ok) {
          const newsList = await res.json();
          const tbody = document.querySelector('#news-table tbody');
          if (!tbody) return;
          tbody.innerHTML = newsList.map(n => `
            <tr>
              <td>${n.id}</td>
              <td><strong>${escapeHtml(n.tieu_de)}</strong></td>
              <td>${escapeHtml(n.tom_tat || '')}</td>
              <td>${escapeHtml(n.ngay_dang || '')}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-warning" style="padding: 5px 10px; font-size: 12px;" onclick='editNews(${JSON.stringify(n)})'>Sửa</button>
                  <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteNews(${n.id})">Xóa</button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) { console.error(err); }
    }

    function initNewsForm() {
      const form = document.getElementById('news-form');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newsId = document.getElementById('news-id').value;
        const actionType = newsId ? 'update_news' : 'add_news';

        const bodyData = {
          id: newsId ? parseInt(newsId) : undefined,
          tieu_de: document.getElementById('news-title').value.trim(),
          tom_tat: document.getElementById('news-summary').value.trim(),
          noi_dung: document.getElementById('news-content').value.trim(),
          ngay_dang: document.getElementById('news-date').value.trim(),
          hinh_anh: ''
        };

        const res = await fetch(`${API_URL}?action=${actionType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        const result = await res.json();
        if (result.success) {
          alert(newsId ? "Cập nhật tin tức thành công!" : "Đăng tin thành công!");
          resetNewsForm();
          loadStaffNews();
        } else { alert("Lỗi: " + result.message); }
      });
    }

    function editNews(news) {
      document.getElementById('news-form-title').innerText = "✏️ Cập nhật Bài Viết / Tin Tức";
      document.getElementById('news-id').value = news.id;
      document.getElementById('news-title').value = news.tieu_de || '';
      document.getElementById('news-date').value = news.ngay_dang || new Date().toISOString().split('T')[0];
      document.getElementById('news-summary').value = news.tom_tat || '';
      document.getElementById('news-content').value = news.noi_dung || '';

      document.getElementById('btn-save-news').innerText = "Cập nhật bài viết";
      document.getElementById('btn-cancel-edit-news').style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetNewsForm() {
      document.getElementById('news-form-title').innerText = "➕ Đăng Bài Viết / Tin Tức Mới";
      document.getElementById('news-form').reset();
      document.getElementById('news-id').value = '';
      document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('btn-save-news').innerText = "Đăng bài viết";
      document.getElementById('btn-cancel-edit-news').style.display = "none";
    }

    async function deleteNews(id) {
      if (confirm("Xóa tin này?")) {
        const res = await fetch(`${API_URL}?action=delete_news&id=${id}`);
        const result = await res.json();
        if (result.success) loadStaffNews();
      }
    }

    async function loadCustomers() {
      try {
        const res = await fetch(`${API_URL}?action=get_all_customers`);
        if (res.ok) {
          const customers = await res.json();
          const tbody = document.querySelector('#customers-table tbody');
          if (!tbody) return;
          
          if (!Array.isArray(customers) || customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">Chưa có dữ liệu khách hàng.</td></tr>';
            return;
          }

          tbody.innerHTML = customers.map(c => `
            <tr>
              <td>${c.id}</td>
              <td><strong>${escapeHtml(c.ho_ten || 'Chưa cập nhật')}</strong></td>
              <td>${escapeHtml(c.so_dien_thoai || 'N/A')}</td>
              <td>${escapeHtml(c.email || 'N/A')}</td>
              <td>${escapeHtml(c.ngay_tao || 'N/A')}</td>
              <td>
                <button class="btn btn-teal" style="padding: 6px 12px; font-size: 12px;" onclick='viewCustomerDetail(${JSON.stringify(c)})'>👁️ Xem chi tiết</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) { console.error("Lỗi tải danh sách khách hàng:", err); }
    }

    function filterCustomerTable() {
      let input = document.getElementById('customerSearchInput').value.toLowerCase();
      let rows = document.querySelector('#customers-table tbody').getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = rows[i].textContent.toLowerCase().includes(input) ? "" : "none";
      }
    }

    async function viewCustomerDetail(customer) {
      const modal = document.getElementById('customerModal');
      const titleEl = document.getElementById('modal-customer-title');
      const bodyContent = document.getElementById('modal-customer-body');

      titleEl.innerText = `Hồ sơ chi tiết: ${customer.ho_ten || 'Khách hàng'}`;
      bodyContent.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; border: 1px solid var(--border-color);">
          <div><p><strong>Mã khách hàng:</strong> #${customer.id}</p></div>
          <div><p><strong>Số điện thoại:</strong> ${escapeHtml(customer.so_dien_thoai || 'Không có')}</p></div>
          <div><p><strong>Email liên hệ:</strong> ${escapeHtml(customer.email || 'Không có')}</p></div>
          <div style="grid-column: span 2;"><p><strong>Địa chỉ:</strong> ${escapeHtml(customer.dia_chi || 'Chưa cập nhật')}</p></div>
        </div>
        <h4 style="margin-bottom: 12px; color: #1e293b; font-size: 15px; border-bottom: 2px solid var(--primary); padding-bottom: 6px;">💉 Lịch sử Tiêm chủng & Giao dịch</h4>
        <div id="customer-history-loading" style="padding: 10px 0; color: var(--text-muted);">Đang tải dữ liệu tương tác...</div>
        <div id="customer-history-content"></div>
      `;
      modal.style.display = 'flex';

      try {
        const res = await fetch(`${API_URL}?action=get_appointments`);
        if (res.ok) {
          const allAppointments = await res.json();
          const cusAppointments = allAppointments.filter(app => {
            return (customer.so_dien_thoai && app.phone === customer.so_dien_thoai) || 
                   ((app.fullName || app.ho_ten || '').toLowerCase() === (customer.ho_ten || '').toLowerCase());
          });

          document.getElementById('customer-history-loading').style.display = 'none';
          const historyContent = document.getElementById('customer-history-content');

          if (cusAppointments.length === 0) {
            historyContent.innerHTML = `<p style="color: var(--text-muted); font-style: italic; padding: 10px 0;">Khách hàng này chưa có lịch hẹn nào trên hệ thống.</p>`;
          } else {
            historyContent.innerHTML = `
              <div class="custom-table-wrapper" style="box-shadow: none; border: 1px solid var(--border-color);">
                <table class="custom-table" style="font-size: 13px;">
                  <thead>
                    <tr><th>Dịch vụ</th><th>Bác sĩ</th><th>Thời gian hẹn</th><th>Loại giao dịch</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    ${cusAppointments.map(app => `
                      <tr>
                        <td>${escapeHtml(app.service_name || 'Tiêm chủng')}</td>
                        <td><span style="color: var(--primary); font-weight: 600;">${escapeHtml(app.doctor_id || app.doctor_name || 'Chưa chọn')}</span></td>
                        <td>${escapeHtml(app.booking_date || '')} (${escapeHtml(app.booking_time || '')})</td>
                        <td><span style="font-weight: 600; color: #475569;">${escapeHtml(app.loai_giao_dich || 'Lịch tiêm')}</span></td>
                        <td><span class="badge badge-arrived">${escapeHtml(app.trang_thai || 'Chờ xác nhận')}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }
        }
      } catch (e) { console.error(e); }
    }

    function openCustomerModalForAdd() {
      const modal = document.getElementById('customerModal');
      document.getElementById('modal-customer-title').innerText = "➕ Thêm mới hồ sơ khách hàng";
      document.getElementById('modal-customer-body').innerHTML = `
        <form id="add-customer-form" onsubmit="submitNewCustomer(event)">
          <div class="form-group">
            <label>Họ và tên khách hàng:</label>
            <input type="text" id="new-cus-name" class="form-control" required placeholder="Nhập họ tên...">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label>Số điện thoại:</label>
              <input type="text" id="new-cus-phone" class="form-control" required placeholder="Nhập SĐT...">
            </div>
            <div class="form-group">
              <label>Email:</label>
              <input type="email" id="new-cus-email" class="form-control" placeholder="Nhập email...">
            </div>
          </div>
          <div class="form-group">
            <label>Địa chỉ:</label>
            <input type="text" id="new-cus-address" class="form-control" placeholder="Nhập địa chỉ khách hàng...">
          </div>
          <button type="submit" class="btn btn-teal" style="margin-top: 10px;">Lưu thông tin khách hàng</button>
        </form>
      `;
      modal.style.display = 'flex';
    }

    async function submitNewCustomer(e) {
      e.preventDefault();
      const payload = {
        ho_ten: document.getElementById('new-cus-name').value.trim(),
        so_dien_thoai: document.getElementById('new-cus-phone').value.trim(),
        email: document.getElementById('new-cus-email').value.trim(),
        dia_chi: document.getElementById('new-cus-address').value.trim()
      };

      try {
        const res = await fetch(`${API_URL}?action=add_customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          alert("Thêm khách hàng thành công!");
          closeCustomerModal();
          loadCustomers();
        } else { alert("Lỗi: " + (result.message || "Không thể thêm khách hàng")); }
      } catch (err) { alert("Lỗi kết nối máy chủ!"); }
    }

    function closeCustomerModal() {
      document.getElementById('customerModal').style.display = 'none';
    }

    async function loadSupportContacts() {
      const tbody = document.querySelector('#support-table tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">Đang tải dữ liệu...</td></tr>';

      try {
        const res = await fetch(`${API_URL}?action=get_contacts`);
        if (res.ok) {
          const list = await res.json();
          if (!Array.isArray(list) || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">Chưa có yêu cầu hỗ trợ nào.</td></tr>';
            return;
          }

          tbody.innerHTML = list.map(item => {
            const statusClass = item.trang_thai === 'Đã trả lời' ? 'badge-arrived' : 'badge-pending';
            return `
              <tr>
                <td>${item.id}</td>
                <td><strong>${escapeHtml(item.ho_ten)}</strong></td>
                <td>📞 ${escapeHtml(item.so_dien_thoai)}<br><small style="color: var(--text-muted);">✉️ ${escapeHtml(item.email || 'Không có')}</small></td>
                <td><div style="max-width: 250px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(item.tin_nhan)}</div></td>
                <td><span class="badge ${statusClass}">${escapeHtml(item.trang_thai || 'Chưa trả lời')}</span></td>
                <td><small style="color: var(--text-muted);">${escapeHtml(item.ngay_gui || '')}</small></td>
                <td>
                  <div class="actions">
                    <button class="btn-action btn-arrived" onclick="updateContactStatus(${item.id}, 'Đã trả lời')" title="Đã trả lời">✓</button>
                    <button class="btn-action btn-delete-row" onclick="deleteContact(${item.id})" title="Xóa">🗑</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Lỗi kết nối khi tải dữ liệu.</td></tr>';
      }
    }

    async function updateContactStatus(id, status) {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}?action=update_contact_status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, trang_thai: status })
        });
        const result = await res.json();
        if (result.success) loadSupportContacts();
        else alert("Lỗi: " + (result.message || "Không thể cập nhật trạng thái"));
      } catch (e) { alert("Lỗi kết nối máy chủ!"); }
    }

    async function deleteContact(id) {
      if (!id) return;
      if (confirm("Bạn có chắc chắn muốn xóa yêu cầu tư vấn này không?")) {
        try {
          const res = await fetch(`${API_URL}?action=delete_contact&id=${id}`);
          const result = await res.json();
          if (result.success) loadSupportContacts();
          else alert("Lỗi xóa yêu cầu tư vấn");
        } catch (error) { alert("Lỗi kết nối máy chủ!"); }
      }
    }

    async function checkTodayAttendanceStatus() {
      const todayStr = new Date().toISOString().split('T')[0];
      const statusBox = document.getElementById('attendance-status-box');
      const statusText = document.getElementById('attendance-status-text');
      
      try {
        const res = await fetch(`${API_URL}?action=get_attendance`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const myRecord = list.find(item => String(item.nhan_vien_id) === String(tensv.id) && item.ngay_cham_cong === todayStr);
            if (myRecord) {
              statusBox.style.display = 'block';
              statusText.innerHTML = `Đã vào ca lúc: <strong style="color: #0d9488;">${myRecord.gio_vao || '--:--'}</strong> | Ra ca lúc: <strong style="color: #f59e0b;">${myRecord.gio_ra || 'Chưa ra ca'}</strong> | Trạng thái: <strong>${myRecord.trang_thai || 'Đang làm việc'}</strong>`;
            } else {
              statusBox.style.display = 'block';
              statusText.innerHTML = `<span style="color: #64748b; font-style: italic;">Hôm nay bạn chưa thực hiện vào ca.</span>`;
            }
          }
        }
      } catch (e) {
        console.error("Lỗi kiểm tra trạng thái chấm công:", e);
      }
    }

    async function performCheckIn() {
      const now = new Date();
      const payload = {
        nhan_vien_id: tensv.id,
        ten_nhan_vien: tensv.ho_ten,
        ngay_cham_cong: now.toISOString().split('T')[0],
        gio_vao: now.toTimeString().split(' ')[0],
        trang_thai: 'Đang làm việc'
      };

      try {
        const res = await fetch(`${API_URL}?action=check_in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          alert("Vào ca (Check-in) thành công lúc " + payload.gio_vao);
          checkTodayAttendanceStatus();
        } else {
          alert("Lỗi: " + (result.message || "Không thể thực hiện vào ca"));
        }
      } catch (e) {
        alert("Lỗi kết nối máy chủ!");
      }
    }

    async function performCheckOut() {
      const now = new Date();
      const payload = {
        nhan_vien_id: tensv.id,
        ngay_cham_cong: now.toISOString().split('T')[0],
        gio_ra: now.toTimeString().split(' ')[0],
        trang_thai: 'Hoàn thành'
      };

      try {
        const res = await fetch(`${API_URL}?action=check_out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          alert("Ra ca (Check-out) thành công lúc " + payload.gio_ra);
          checkTodayAttendanceStatus();
        } else {
          alert("Lỗi: " + (result.message || "Không thể thực hiện ra ca"));
        }
      } catch (e) {
        alert("Lỗi kết nối máy chủ!");
      }
    }

    function logout() {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    }

    function escapeHtml(text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
