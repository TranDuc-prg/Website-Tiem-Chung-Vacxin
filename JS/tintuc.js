  const API_URL = 'api.php';

  document.addEventListener('DOMContentLoaded', () => {
    loadNewsData();
    loadDoctors();
    loadServices();
  });

  async function loadNewsData() {
    const container = document.getElementById('news-container');
    const recentContainer = document.getElementById('recent-news-list');

    try {
      const response = await fetch(`${API_URL}?action=get_all_news`);
      if (response.ok) {
        const newsList = await response.json();

        if (!Array.isArray(newsList) || newsList.length === 0) {
          container.innerHTML = '<div class="no-data">Chưa có bài viết nào được đăng tải.</div>';
          recentContainer.innerHTML = '<div style="font-size:13px; color:#64748b; text-align:center;">Chưa có bài viết mới.</div>';
          return;
        }

        container.innerHTML = newsList.map(item => `
          <div class="news-card-horizontal">
            <div class="news-card-img">
              <img src="${item.hinh_anh || 'IMAGE/anh1.jpg'}" alt="${escapeHtml(item.tieu_de)}" onerror="this.src='IMAGE/anh1.jpg'">
            </div>
            <div class="news-card-body">
              <div class="news-card-date">${item.ngay_dang || '28 Tháng Năm, 2024'}</div>
              <a href="news-detail.html?id=${item.id}" class="news-card-title">${escapeHtml(item.tieu_de)}</a>
              <p class="news-card-summary">${escapeHtml(item.tom_tat || 'Đang cập nhật nội dung tóm tắt cho bài viết này...')}</p>
            </div>
          </div>
        `).join('');

        const recentItems = newsList.slice(0, 5);
        recentContainer.innerHTML = recentItems.map(item => `
          <a href="news-detail.html?id=${item.id}" class="recent-item">
            <img src="${item.hinh_anh || 'IMAGE/anh1.jpg'}" alt="" onerror="this.src='IMAGE/anh1.jpg'">
            <div class="recent-item-title">${escapeHtml(item.tieu_de)}</div>
          </a>
        `).join('');

      } else {
        container.innerHTML = '<div class="no-data">Không thể kết nối đến máy chủ.</div>';
      }
    } catch (error) {
      console.error("Lỗi:", error);
      container.innerHTML = '<div class="no-data">Lỗi kết nối mạng khi tải tin tức.</div>';
    }
  }

  async function loadDoctors() {
    try {
      const response = await fetch(`${API_URL}?action=get_doctors`);
      if (response.ok) {
        const doctors = await response.json();
        let html = '<option value="">Chọn bác sĩ</option>';
        doctors.forEach(doc => {
          html += `<option value="${doc.id}">${doc.name}</option>`;
        });
        document.getElementById('booking_doctor').innerHTML = html;
      }
    } catch (error) {
      console.error('Lỗi tải danh sách bác sĩ:', error);
    }
  }

  async function loadServices() {
    try {
      const response = await fetch(`${API_URL}?action=get_services`);
      if (response.ok) {
        const services = await response.json();
        let html = '<option value="">Chọn dịch vụ</option>';
        services.forEach(srv => {
          html += `<option value="${srv.id}">${srv.ten_dich_vu}</option>`;
        });
        document.getElementById('booking_service').innerHTML = html;
      }
    } catch (error) {
      console.error('Lỗi tải danh sách dịch vụ:', error);
    }
  }


  async function submitBooking(event) {
    event.preventDefault();

    const bookingData = {
      action: 'create_appointment',
      fullName: document.getElementById('booking_fullname').value,
      email: document.getElementById('booking_email').value,
      phone: document.getElementById('booking_phone').value,
      dia_chi: document.getElementById('booking_address').value, 
      doctor_id: document.getElementById('booking_doctor').value,
      service_id: document.getElementById('booking_service').value,
      booking_date: document.getElementById('booking_date').value,
      booking_time: document.getElementById('booking_time').value,
      loai_giao_dich: 'Lịch tiêm'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || 'Đặt lịch khám thành công!');
        document.getElementById('bookingForm').reset();
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể đặt lịch khám.'));
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      alert('Lỗi kết nối đến máy chủ!');
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
