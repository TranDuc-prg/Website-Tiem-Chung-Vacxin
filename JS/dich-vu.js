    document.addEventListener("DOMContentLoaded", () => {
      updateCartCount();
    });

    function updateCartCount() {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      let totalCount = cart.reduce((sum, item) => sum + parseInt(item.quantity || 1), 0);
      const countSpan = document.getElementById('cart-count');
      if (countSpan) countSpan.textContent = totalCount;
    }

    function addToCart(id, tenDichVu, gia, hinhAnh) {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      
      let existingItem = cart.find(item => item.id === id || item.id == id);
      if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
      } else {
        cart.push({
          id: id,
          name: tenDichVu,
          price: gia,
          image: hinhAnh,
          quantity: 1
        });
      }

      localStorage.setItem('medivax_cart', JSON.stringify(cart));
      updateCartCount();
      window.location.href = 'cart.html';
    }

    document.addEventListener("DOMContentLoaded", async () => {
      const container = document.getElementById('main-service-list');
      const serviceSelect = document.getElementById('sb-service');
      const doctorSelect = document.getElementById('sb-doctor');

      let services = [];
      try {
        const response = await fetch('api.php?action=get_all_services');
        if (response.ok) {
          services = await response.json();
        }
      } catch (error) {
        console.error("Lỗi tải API dịch vụ:", error);
      }

      if (!Array.isArray(services) || services.length === 0) {
        services = [
          { id: 1, ten_dich_vu: "Gói vắc xin cho trẻ trước khi đi học (4-6 tuổi)", do_tuoi: "4-6 tuổi", mo_ta: "Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu...", hinh_anh: "IMAGE/anh1.png", gia: 1500000, gia_cu: 1800000 },
          { id: 2, ten_dich_vu: "Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)", do_tuoi: "9-18 tuổi", mo_ta: "Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu...", hinh_anh: "IMAGE/anh2.jpg", gia: 2000000, gia_cu: 2300000 },
          { id: 3, ten_dich_vu: "Gói vắc xin cho phụ nữ sắp & trong khi mang thai", do_tuoi: "Phụ nữ", mo_ta: "Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu...", hinh_anh: "IMAGE/tu van.webp", gia: 1800000, gia_cu: 2100000 }
        ];
      }

      container.innerHTML = `
        <div class="service-grid">
          ${services.map(s => {
            const id = s.id || 1;
            const tenDV = s.ten_dich_vu || 'Dịch vụ tiêm chủng';
            const gia = s.gia || 0;
            const img = s.hinh_anh || 'IMAGE/anh2.jpg';
            
            const giaMoi = Number(gia).toLocaleString('vi-VN') + ' đ';
            const giaCuHTML = (s.gia_cu && Number(s.gia_cu) > Number(gia)) 
              ? `<span class="old-price">${Number(s.gia_cu).toLocaleString('vi-VN')} đ</span>` 
              : '';

            return `
              <div class="service-card-item">
                <img src="${img}" alt="${tenDV}" onclick="location.href='service-detail.html?id=${id}'">
                <div class="service-card-info">
                  <div class="date">📅 Đối tượng: ${s.do_tuoi || 'Mọi độ tuổi'}</div>
                  <h3 onclick="location.href='service-detail.html?id=${id}'">${tenDV}</h3>
                  <p>${s.mo_ta ? s.mo_ta.substring(0, 80) + '...' : 'Chưa có mô tả chi tiết.'}</p>
                  
                  <div class="service-price-row">
                    <span class="new-price">${giaMoi}</span>
                    ${giaCuHTML}
                  </div>

                  <div class="service-actions">
                    <button onclick="location.href='service-detail.html?id=${id}'" class="btn-detail">Xem chi tiết</button>
                    <button onclick='addToCart(${id}, ${JSON.stringify(tenDV)}, ${gia}, ${JSON.stringify(img)})' class="btn-buy">Mua giữ thuốc</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>' + 
          services.map(s => `<option value="${s.id}">${s.ten_dich_vu}</option>`).join('');
      }

      try {
        const docRes = await fetch('api.php?action=get_doctors');
        if (docRes.ok) {
          const doctors = await docRes.json();
          if (Array.isArray(doctors) && doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>' + 
              doctors.map(d => `<option value="${d.id}">${d.name || d.ho_ten} ${d.chuyen_khoa ? '('+d.chuyen_khoa+')' : ''}</option>`).join('');
          }
        }
      } catch (e) {
        if (doctorSelect) {
          doctorSelect.innerHTML = `
            <option value="">Chọn bác sĩ</option>
            <option value="1">BS. Nguyễn Anh Tuấn (Huyết Học)</option>
            <option value="2">BS. Trần Thúy Vân (Sản Phụ Khoa)</option>
            <option value="3">BS. Trần Tiến Quang (Sản Phụ Khoa)</option>
          `;
        }
      }

      const bookingForm = document.getElementById('sidebar-booking-form');
      if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const bookingData = {
            action: 'create_appointment',
            fullName: document.getElementById('sb-name').value,
            dia_chi: document.getElementById('sb-address').value,
            email: document.getElementById('sb-email').value,
            phone: document.getElementById('sb-phone').value,
            doctor_id: document.getElementById('sb-doctor').value,
            service_id: document.getElementById('sb-service').value,
            booking_date: document.getElementById('sb-date').value,
            booking_time: document.getElementById('sb-time').value,
            loai_giao_dich: 'Lịch tiêm'
          };

          try {
            const res = await fetch('api.php', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingData) 
            });
            const result = await res.json();
            
            if (result.success) {
              alert(result.message || "Đặt lịch khám thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.");
              bookingForm.reset();
            } else {
              alert("Có lỗi xảy ra: " + (result.message || "Vui lòng thử lại"));
            }
          } catch (err) {
            console.error('Lỗi kết nối:', err);
            alert("Lỗi kết nối đến máy chủ khi đăng ký lịch khám!");
          }
        });
      }
    });
