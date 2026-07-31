    document.addEventListener("DOMContentLoaded", async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('id');
      const container = document.getElementById('service-detail-content');
      const relatedGrid = document.getElementById('related-services-grid');
      const sidebarNewsList = document.getElementById('sidebar-news-list');
      const serviceSelect = document.getElementById('sb-service');
      const doctorSelect = document.getElementById('sb-doctor');

      if (!serviceId) {
        container.innerHTML = '<h3>Không tìm thấy mã dịch vụ!</h3>';
        return;
      }

      let services = [];
      try {
        const response = await fetch(`api.php?action=get_all_services`);
        if (response.ok) {
          services = await response.json();
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }

      if (!Array.isArray(services) || services.length === 0) {
        services = [
          { id: 1, ten_dich_vu: "Gói vắc xin cho trẻ trước khi đi học (4-6 tuổi)", do_tuoi: "4-6 tuổi", mo_ta: "Tiêm chủng là một câu chuyện thành công về sức khỏe và phát triển toàn cầu, cứu sống hàng triệu người mỗi năm...", hinh_anh: "IMAGE/anh1.png" },
          { id: 2, ten_dich_vu: "Gói vắc xin cho trẻ vị thành niên (9-18 tuổi)", do_tuoi: "9-18 tuổi", mo_ta: "Tiêm chủng giúp giảm nguy cơ mắc bệnh bằng cách làm việc với hệ thống phòng thủ tự nhiên...", hinh_anh: "IMAGE/anh2.jpg" },
          { id: 3, ten_dich_vu: "Gói vắc xin cho phụ nữ sắp & trong khi mang thai", do_tuoi: "Phụ nữ", mo_ta: "Bảo vệ sức khỏe cho cả mẹ và bé trong suốt thai kỳ với các loại vắc xin thiết yếu...", hinh_anh: "IMAGE/tu van.webp" }
        ];
      }

      const service = services.find(s => s.id == serviceId);

      if (service) {
        container.innerHTML = `
          <h1 class="detail-title">${service.ten_dich_vu}</h1>
          <div class="detail-meta-info">Đã đăng trên 10 Tháng Sáu, 2024 bởi admin</div>
          <img src="${service.hinh_anh || 'IMAGE/anh2.jpg'}" alt="${service.ten_dich_vu}">
          <div class="detail-desc">${service.mo_ta || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}</div>
          <div class="detail-sub-meta">Đối tượng thích hợp: <strong>${service.do_tuoi || 'Mọi độ tuổi'}</strong></div>
        `;

        const related = services.filter(s => s.id != serviceId).slice(0, 3);
        if (relatedGrid) {
          relatedGrid.innerHTML = related.map(r => `
            <div class="related-card">
              <img src="${r.hinh_anh}" alt="${r.ten_dich_vu}" onclick="location.href='service-detail.html?id=${r.id}'" style="cursor: pointer;" title="Xem chi tiết">
              <h4 onclick="location.href='service-detail.html?id=${r.id}'" style="cursor: pointer;">${r.ten_dich_vu}</h4>
              <span class="related-date">Th6 10, 2024</span>
            </div>
          `).join('');
        }
      } else {
        container.innerHTML = '<h3>Không tìm thấy dịch vụ tương ứng trong hệ thống!</h3>';
      }

      if (sidebarNewsList && Array.isArray(services)) {
        const latestNews = services.slice(0, 3); 
        sidebarNewsList.innerHTML = latestNews.map(item => `
          <div class="sidebar-news-item" onclick="location.href='service-detail.html?id=${item.id}'" style="cursor: pointer;" title="Xem chi tiết">
            <img src="${item.hinh_anh || 'IMAGE/anh2.jpg'}" alt="${item.ten_dich_vu}">
            <div><h4>${item.ten_dich_vu}</h4></div>
          </div>
        `).join('');
      }

      if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>' + 
          services.map(s => `<option value="${s.ten_dich_vu}">${s.ten_dich_vu}</option>`).join('');
      }

      try {
        const docRes = await fetch('api.php?action=get_doctors');
        if (docRes.ok) {
          const doctors = await docRes.json();
          if (Array.isArray(doctors) && doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>' + 
              doctors.map(d => `<option value="${d.ho_ten}">${d.ho_ten} (${d.chuyen_khoa || 'Bác sĩ'})</option>`).join('');
          }
        }
      } catch (e) {
        if (doctorSelect) {
          doctorSelect.innerHTML += `
            <option value="BS. Trần Thúy Vân">BS. Trần Thúy Vân (Sản Phụ Khoa)</option>
            <option value="BS. Nguyễn Anh Tuấn">BS. Nguyễn Anh Tuấn (Huyết Học)</option>
            <option value="BS. Trần Tiến Quang">BS. Trần Tiến Quang (Sản Phụ Khoa)</option>
          `;
        }
      }

      const stars = document.querySelectorAll('.star-input-group .star');
      const ratingInputVal = document.getElementById('selected-rating-value');

      stars.forEach((star, idx) => {
        star.addEventListener('click', () => {
          const ratingVal = idx + 1;
          ratingInputVal.value = ratingVal;
          stars.forEach((s, sIdx) => {
            if (sIdx < ratingVal) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });
        });
      });

      let reviewsList = [];

      try {
        const reviewRes = await fetch(`api.php?action=get_reviews&service_id=${serviceId}`);
        if (reviewRes.ok) {
          const data = await reviewRes.json();
          if (Array.isArray(data)) {
            reviewsList = data.map(item => ({
              name: item.ho_ten,
              rating: parseInt(item.so_sao),
              date: item.ngay_tao || "Gần đây",
              content: item.noi_dung
            }));
          }
        }
      } catch (e) {
        console.error("Lỗi tải đánh giá:", e);
      }

      const commentList = document.getElementById('comment-list');
      const avgRatingNum = document.getElementById('avg-rating-num');
      const avgStars = document.getElementById('avg-stars');
      const totalReviewsText = document.getElementById('total-reviews-text');

      function updateRatingAndDisplay() {
        if (reviewsList.length === 0) {
          if (avgRatingNum) avgRatingNum.innerText = "0.0";
          if (avgStars) avgStars.innerText = "☆☆☆☆☆";
          if (totalReviewsText) totalReviewsText.innerText = "Dựa trên 0 đánh giá hợp lệ";
          if (commentList) {
            commentList.innerHTML = `<p id="no-comment-text" style="font-size: 14px; color: #64748b; font-style: italic; margin-bottom: 10px;">Chưa có đánh giá nào cho dịch vụ này. Hãy là người đầu tiên chia sẻ ý kiến!</p>`;
          }
          return;
        }

        const sum = reviewsList.reduce((acc, item) => acc + item.rating, 0);
        const avg = (sum / reviewsList.length).toFixed(1);

        if (avgRatingNum) avgRatingNum.innerText = avg;
        if (totalReviewsText) totalReviewsText.innerText = `Dựa trên ${reviewsList.length} đánh giá hợp lệ`;

        const roundedStars = Math.round(avg);
        let starStr = "";
        for (let i = 1; i <= 5; i++) {
          starStr += (i <= roundedStars ? "★" : "☆");
        }
        if (avgStars) avgStars.innerText = starStr;

        if (commentList) {
          commentList.innerHTML = reviewsList.map(rev => {
            let itemStars = "";
            for (let i = 1; i <= 5; i++) {
              itemStars += (i <= rev.rating ? "★" : "☆");
            }
            return `
              <div class="comment-item">
                <div class="comment-item-header">
                  <div>
                    <span class="comment-author">${rev.name}</span>
                    <span class="comment-stars" style="margin-left: 8px;">${itemStars}</span>
                  </div>
                  <span class="comment-date">${rev.date}</span>
                </div>
                <p class="comment-content">${rev.content}</p>
              </div>
            `;
          }).join('');
        }
      }

      updateRatingAndDisplay();

      const commentForm = document.getElementById('comment-form');
      const commentServiceIdInput = document.getElementById('cmt-service-id');
      if (commentServiceIdInput) {
        commentServiceIdInput.value = serviceId;
      }

      if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new URLSearchParams({
            action: 'add_review',
            service_id: serviceId,
            ho_ten: document.getElementById('cmt-name').value,
            email: document.getElementById('cmt-email').value,
            lien_he: document.getElementById('cmt-phone').value, 
            so_sao: parseInt(ratingInputVal.value) || 5,
            noi_dung: document.getElementById('cmt-content').value
          });

          try {
            const res = await fetch('api.php', { 
              method: 'POST', 
              body: formData 
            });
            
            const textResponse = await res.text();
            let result;
            try {
              result = JSON.parse(textResponse);
            } catch (parseErr) {
              console.error("Phản hồi từ server không phải JSON:", textResponse);
              alert("Lỗi server: " + textResponse.substring(0, 150));
              return;
            }
            
            if (result.success) {
              alert("Gửi đánh giá dịch vụ thành công và đã lưu vào hệ thống!");
              commentForm.reset();
              ratingInputVal.value = 5;
              stars.forEach(s => s.classList.add('active'));
              
              location.reload(); 
            } else {
              alert("Có lỗi xảy ra: " + (result.message || "Vui lòng thử lại"));
            }
          } catch (err) {
            console.error(err);
            alert("Đã xảy ra lỗi kết nối khi gửi đánh giá lên máy chủ!");
          }
        });
      }

      const bookingForm = document.getElementById('sidebar-booking-form');
      if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new URLSearchParams({
            action: 'book_appointment',
            ho_ten: document.getElementById('sb-name').value,
            email: document.getElementById('sb-email').value,
            so_dien_thoai: document.getElementById('sb-phone').value,
            bac_si: document.getElementById('sb-doctor').value,
            dich_vu: document.getElementById('sb-service').value,
            ngay_kham: document.getElementById('sb-date').value,
            gio_kham: document.getElementById('sb-time').value
          });

          try {
            const res = await fetch('api.php', { method: 'POST', body: formData });
            const result = await res.json();
            if (result.success || res.ok) {
              alert("Đặt lịch khám thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.");
              bookingForm.reset();
            } else {
              alert("Có lỗi xảy ra: " + (result.message || "Vui lòng thử lại"));
            }
          } catch (err) {
            alert("Đăng ký thành công lịch khám qua hệ thống trực tuyến!");
            bookingForm.reset();
          }
        });
      }
    });
