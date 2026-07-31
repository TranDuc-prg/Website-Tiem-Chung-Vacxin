    document.addEventListener("DOMContentLoaded", async () => {
      updateCartCount();
      checkUserLoginStatus();

      const urlParams = new URLSearchParams(window.location.search);
      const doctorId = urlParams.get('id');

      const container = document.getElementById('doctor-detail-container');

      if (!doctorId) {
        container.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 40px; background: white; border-radius: 16px;"><p style="color: red; font-weight: 600;">Không tìm thấy mã bác sĩ yêu cầu.</p><a href="index.html" class="btn-book-now" style="margin-top:15px; display:inline-block; width: auto; padding: 10px 25px;">Quay lại trang chủ</a></div>`;
        return;
      }

      try {
        const res = await fetch('api.php?action=get_doctors');
        if (res.ok) {
          const doctors = await res.json();
          const doctor = doctors.find(d => String(d.id) === String(doctorId));

          if (doctor) {
            container.innerHTML = `
              <!-- Cột trái: Ảnh & Thông tin nhanh -->
              <div class="doctor-sidebar-card">
                <img src="${doctor.hinh_anh || doctor.image || 'IMAGE/anh1.png'}" alt="${doctor.ho_ten || doctor.name}">
                <h2>${doctor.ho_ten || doctor.name}</h2>
                <span class="specialty-badge">🩺 ${doctor.hoc_vi_chuc_vu || doctor.specialty || 'Bác sĩ Chuyên khoa'}</span>
                <div>
                  <a href="index.html#booking" class="btn-book-now">📅 Đặt lịch khám ngay</a>
                </div>
              </div>

              <!-- Cột phải: Chi tiết chuyên môn -->
              <div class="doctor-main-content">
                <h3>📖 Giới thiệu chuyên môn</h3>
                <p><strong>Học vị / Chức vụ:</strong> ${doctor.hoc_vi_chuc_vu || doctor.specialty || 'Bác sĩ điều trị cao cấp tại Hệ thống Tiêm chủng Vacxin'}</p>
                
                <p><strong>Mô tả chi tiết / Tiểu sử:</strong></p>
                <div style="color: #334155; line-height: 1.8; margin-bottom: 25px;">
                  ${doctor.mo_ta_chi_tiet || doctor.tieu_su || 'Chưa có mô tả chi tiết cho bác sĩ này.'}
                </div>
              </div>
            `;
          } else {
            container.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 40px; background: white; border-radius: 16px;"><p style="color: red; font-weight: 600;">Không tìm thấy thông tin chi tiết của bác sĩ này.</p><a href="index.html" class="btn-book-now" style="margin-top:15px; display:inline-block; width: auto; padding: 10px 25px;">Quay lại trang chủ</a></div>`;
          }
        }
      } catch (e) {
        console.error("Lỗi kết nối API:", e);
        container.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 40px; background: white; border-radius: 16px;"><p style="color: red; font-weight: 600;">Đã xảy ra lỗi khi tải dữ liệu hệ thống.</p></div>`;
      }
    });

    function updateCartCount() {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      let totalCount = cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
      const countSpan = document.getElementById('cart-count');
      if (countSpan) countSpan.textContent = totalCount;
    }

    function checkUserLoginStatus() {
      const loggedUser = localStorage.getItem('medivax_user') || sessionStorage.getItem('medivax_user');
      const btnLogin = document.getElementById('btn-login-header');
      const userNameSpan = document.getElementById('header-user-name');
      const btnLogout = document.getElementById('btn-logout-header');

      if (loggedUser) {
        try {
          const userData = JSON.parse(loggedUser);
          if (btnLogin) btnLogin.style.display = 'none';
          if (userNameSpan) {
            userNameSpan.textContent = `Xin chào, ${userData.ho_ten || userData.name || 'Khách hàng'}`;
            userNameSpan.style.display = 'inline-block';
          }
          if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.onclick = () => {
              localStorage.removeItem('medivax_user');
              sessionStorage.removeItem('medivax_user');
              location.reload();
            };
          }
        } catch (e) {
          console.error("Lỗi phân tích dữ liệu user:", e);
        }
      }
    }
