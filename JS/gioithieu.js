    document.addEventListener("DOMContentLoaded", async () => {
      const sideTimeSelect = document.getElementById('side-time');
      if (sideTimeSelect) {
        const times = ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"];
        sideTimeSelect.innerHTML = '<option value="">Chọn giờ</option>' + times.map(t => `<option value="${t}">${t}</option>`).join('');
      }

      const sideDoctorSelect = document.getElementById('side-doctor');
      try {
        const resDoc = await fetch('api.php?action=get_all_doctors');
        if (resDoc.ok) {
          const doctors = await resDoc.json();
          if (Array.isArray(doctors) && sideDoctorSelect) {
            sideDoctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>' + 
              doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialty || 'Bác sĩ'})</option>`).join('');
          }
        }
      } catch (e) {
        console.error("Lỗi tải bác sĩ cho sidebar:", e);
      }

      const sideServiceSelect = document.getElementById('side-service');
      try {
        const resServ = await fetch('api.php?action=get_all_services');
        if (resServ.ok) {
          const servs = await resServ.json();
          if (Array.isArray(servs) && sideServiceSelect) {
            sideServiceSelect.innerHTML = '<option value="">Chọn dịch vụ / Vắc-xin</option>' + 
              servs.map(s => `<option value="${s.id}" data-name="${s.ten_dich_vu}">${s.ten_dich_vu} (${Number(s.gia || 0).toLocaleString('vi-VN')} đ)</option>`).join('');
          }
        }
      } catch (e) {
        console.error("Lỗi tải dịch vụ cho sidebar:", e);
      }

      const sidebarNewsContainer = document.getElementById('sidebar-news-container');
      if (sidebarNewsContainer) {
        try {
          const resNews = await fetch('api.php?action=get_all_news');
          if (resNews.ok) {
            const newsList = await resNews.json();
            if (Array.isArray(newsList) && newsList.length > 0) {
              sidebarNewsContainer.innerHTML = newsList.slice(0, 4).map(item => `
                <a href="news-detail.html?id=${item.id}" class="side-news-item">
                  <img src="${item.hinh_anh || 'IMAGE/anh1.png'}" alt="${item.tieu_de}">
                  <div><h4>${item.tieu_de}</h4></div>
                </a>
              `).join('');
            } else {
              sidebarNewsContainer.innerHTML = '<p style="font-size:13px; color:#64748b; text-align:center;">Chưa có bài viết mới.</p>';
            }
          }
        } catch (e) {
          console.error("Lỗi tải bài viết mới:", e);
        }
      }

      const sideBookingForm = document.getElementById('sidebar-booking-form');
      if (sideBookingForm) {
        sideBookingForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          let currentCustomerId = null;
          const loggedUser = localStorage.getItem('medivax_user') || sessionStorage.getItem('medivax_user');
          if (loggedUser) {
            try {
              const userData = JSON.parse(loggedUser);
              currentCustomerId = userData.id || userData.customer_id || null;
            } catch (err) {
              console.error("Lỗi đọc thông tin user đăng nhập", err);
            }
          }

          const serviceSelectElement = document.getElementById('side-service');
          let selectedServiceName = "";
          if (serviceSelectElement && serviceSelectElement.selectedIndex > 0) {
            const selectedOption = serviceSelectElement.options[serviceSelectElement.selectedIndex];
            selectedServiceName = selectedOption.getAttribute('data-name') || selectedOption.text;
          }

          const bookingData = {
            customer_id: currentCustomerId,
            fullName: document.getElementById('side-name').value.trim(),
            doctor_id: document.getElementById('side-doctor').value,
            email: document.getElementById('side-email').value.trim(),
            service_id: document.getElementById('side-service').value,
            chi_tiet_don_hang: selectedServiceName,
            phone: document.getElementById('side-phone').value.trim(),
            dia_chi: document.getElementById('side-address').value.trim(),
            booking_date: document.getElementById('side-date').value,
            booking_time: document.getElementById('side-time').value
          };

          try {
            const response = await fetch('api.php?action=create_appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingData)
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                alert(result.message || 'Đặt lịch hẹn / Giữ vắc-xin thành công!');
                sideBookingForm.reset();
              } else {
                alert(result.message || 'Đặt lịch thất bại.');
              }
            } else {
              alert('Đặt lịch thất bại, vui lòng thử lại sau.');
            }
          } catch (error) {
            console.error('Lỗi khi đặt lịch:', error);
            alert('Không thể kết nối tới máy chủ.');
          }
        });
      }
    });
