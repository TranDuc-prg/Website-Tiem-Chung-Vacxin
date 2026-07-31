    let currentSlideIndex = 0;
    let currentDoctorSlideIndex = 0;

    document.addEventListener("DOMContentLoaded", async () => {
      updateCartCount();
      checkUserLoginStatus();
      autoFillUserData();

      const btnOpenVideo = document.getElementById('btnOpenVideo');
      const videoModal = document.getElementById('videoModal');
      const closeVideoModal = document.getElementById('closeVideoModal');
      const youtubeIframe = document.getElementById('youtubeIframe');

      if (btnOpenVideo && videoModal) {
        btnOpenVideo.addEventListener('click', (e) => {
          e.preventDefault();
          youtubeIframe.src = "https://www.youtube.com/embed/hmRbYLBqjyw?autoplay=1";
          videoModal.style.display = "flex";
        });
      }

      if (closeVideoModal && videoModal) {
        closeVideoModal.addEventListener('click', () => {
          videoModal.style.display = "none";
          youtubeIframe.src = "";
        });

        window.addEventListener('click', (e) => {
          if (e.target === videoModal) {
            videoModal.style.display = "none";
            youtubeIframe.src = "";
          }
        });
      }

      
      const sliderWrapper = document.getElementById('home-services-slider');
      if (sliderWrapper) {
        let services = [];
        try {
          const response = await fetch('api.php?action=get_all_services');
          if (response.ok) {
            services = await response.json();
          }
        } catch (error) {
          console.error("Không thể kết nối API dịch vụ:", error);
        }

        if (Array.isArray(services) && services.length > 0) {
          sliderWrapper.innerHTML = services.map(s => {
            const newPrice = Number(s.gia || 0);
            const oldPrice = Number(s.gia_cu || 0);
            const formattedNewPrice = newPrice.toLocaleString('vi-VN') + ' đ';
            const displayOldPrice = (oldPrice > newPrice) ? `<span class="price-old">${oldPrice.toLocaleString('vi-VN')} đ</span>` : '';
            const safeName = (s.ten_dich_vu || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            return `
              <div class="service-slide-item" onclick="viewServiceDetail(${s.id || 0})">
                <img src="${s.hinh_anh || 'IMAGE/anh2.jpg'}" alt="${safeName}">
                <div class="service-slide-content">
                  <h3>${s.ten_dich_vu}</h3>
                  <div class="service-age"><strong>Đối tượng:</strong> ${s.do_tuoi || 'Mọi độ tuổi'}</div>
                  <div class="price-box">
                    <span class="price-new">${formattedNewPrice}</span>
                    ${displayOldPrice}
                  </div>
                  <p class="service-desc">${s.mo_ta || ''}</p>
                  <div class="card-action-buttons">
                    <a href="javascript:void(0);" onclick="event.stopPropagation(); viewServiceDetail(${s.id || 0});" class="btn-detail">Xem chi tiết</a>
                    <a href="javascript:void(0);" onclick="event.stopPropagation(); addToVaccineCart(${s.id}, '${safeName}', ${newPrice})" class="btn-buy">Mua giữ thuốc</a>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      const doctorsContainer = document.getElementById('doctors-grid-container');
      const bookingDoctorSelect = document.getElementById('book-doctor');
      const reviewDoctorSelect = document.getElementById('review-doctor-id');
      let doctorsMap = {}; 

      try {
        const res = await fetch('api.php?action=get_all_doctors');
        if (res.ok) {
          const doctors = await res.json();
          if (Array.isArray(doctors) && doctors.length > 0) {
            doctors.forEach(doc => {
              doctorsMap[doc.id] = `${doc.name} (${doc.specialty || 'Bác sĩ'})`;
            });

            if (doctorsContainer) {
              doctorsContainer.innerHTML = doctors.map(doc => `
                <div class="doctor-card" style="min-width: calc(33.333% - 14px); flex: 0 0 calc(33.333% - 14px); box-sizing: border-box;">
                  <img src="${doc.image || 'IMAGE/anh1.png'}" alt="${doc.name}" style="cursor: pointer;" onclick="window.location.href='doctor-detail.html?id=${doc.id}'">
                  <h3 style="cursor: pointer;" onclick="window.location.href='doctor-detail.html?id=${doc.id}'">${doc.name}</h3>
                  <p>${doc.specialty || 'Bác sĩ chuyên khoa'}</p>
                  <a href="#booking" class="btn-primary">Đặt lịch khám</a>
                </div>
              `).join('');
            }

            if (bookingDoctorSelect) {
              bookingDoctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>' + 
                doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialty || 'Bác sĩ'})</option>`).join('');
            }

            if (reviewDoctorSelect) {
              reviewDoctorSelect.innerHTML = '<option value="">-- Chọn bác sĩ --</option>' + 
                doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialty || 'Bác sĩ'})</option>`).join('');
            }
          }
        }
      } catch (e) {
        console.error("Lỗi tải danh sách bác sĩ:", e);
      }

      const bookingServiceSelect = document.getElementById('book-service');
      if (bookingServiceSelect) {
        try {
          const res = await fetch('api.php?action=get_all_services');
          if (res.ok) {
            const servs = await res.json();
            if (Array.isArray(servs) && servs.length > 0) {
              bookingServiceSelect.innerHTML = '<option value="">Chọn dịch vụ / Vắc-xin</option>' + 
                servs.map(s => `<option value="${s.id}" data-name="${s.ten_dich_vu}">${s.ten_dich_vu} (${Number(s.gia || 0).toLocaleString('vi-VN')} đ)</option>`).join('');
            }
          }
        } catch (e) {
          console.error("Lỗi tải dịch vụ cho form đặt lịch:", e);
        }
      }

      const bookingTimeSelect = document.getElementById('book-time');
      if (bookingTimeSelect) {
        const times = ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"];
        bookingTimeSelect.innerHTML = '<option value="">Chọn giờ</option>' + times.map(t => `<option value="${t}">${t}</option>`).join('');
      }

      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const body = item.querySelector('.faq-body');
        if (header && body) {
          header.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            faqItems.forEach(other => {
              other.classList.remove('active');
              const otherBody = other.querySelector('.faq-body');
              const otherSpan = other.querySelector('.faq-header span');
              if (otherBody) otherBody.style.display = 'none';
              if (otherSpan) otherSpan.textContent = '▼';
            });
            if (!isOpen) {
              item.classList.add('active');
              body.style.display = 'block';
              const span = header.querySelector('span');
              if (span) span.textContent = '▲';
            }
          });
        }
      });

      const reviewsContainer = document.getElementById('home-reviews-container');
      if (reviewsContainer) {
        try {
          const res = await fetch('api.php?action=get_reviews&loai=bac_si');
          if (res.ok) {
            const reviews = await res.json();
            if (Array.isArray(reviews) && reviews.length > 0) {
              reviewsContainer.innerHTML = reviews.map(r => {
                const doctorInfo = r.target_id && doctorsMap[r.target_id] 
                  ? `<div style="font-size: 13px; color: #0284c7; font-weight: 600; margin-bottom: 4px;">🏥 Đánh giá Bác sĩ: ${doctorsMap[r.target_id]}</div>` 
                  : (r.target_id ? `<div style="font-size: 13px; color: #0284c7; font-weight: 600; margin-bottom: 4px;">🏥 Đánh giá Bác sĩ (ID: ${r.target_id})</div>` : '');

                return `
                  <div class="review-card" style="border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #fff;">
                    ${doctorInfo}
                    <div class="stars" style="color: #f59e0b;">${'★'.repeat(parseInt(r.so_sao) || 5)}</div>
                    <p style="margin: 8px 0; font-style: italic;">"${r.noi_dung}"</p>
                    <div class="author" style="font-size: 14px; color: #475569;"><strong>${r.ho_ten}</strong> / <span>Khách hàng</span></div>
                  </div>
                `;
              }).join('');
            } else {
              reviewsContainer.innerHTML = '<p style="color:#64748b; text-align:center;">Chưa có nhận xét nào.</p>';
            }
          }
        } catch (e) {
          console.error("Lỗi khi tải nhận xét:", e);
        }
      }

      const bookingForm = document.getElementById('booking-form');
      if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
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

          const serviceSelectElement = document.getElementById('book-service');
          let selectedServiceName = "";
          if (serviceSelectElement && serviceSelectElement.selectedIndex > 0) {
            const selectedOption = serviceSelectElement.options[serviceSelectElement.selectedIndex];
            selectedServiceName = selectedOption.getAttribute('data-name') || selectedOption.text;
          }

          const bookingData = {
            customer_id: currentCustomerId,
            fullName: document.getElementById('book-name').value.trim(),
            doctor_id: document.getElementById('book-doctor').value,
            email: document.getElementById('book-email').value.trim(),
            service_id: document.getElementById('book-service').value,
            chi_tiet_don_hang: selectedServiceName,
            phone: document.getElementById('book-phone').value.trim(),
            dia_chi: document.getElementById('book-address').value.trim(),
            booking_date: document.getElementById('book-date').value,
            booking_time: document.getElementById('book-time').value
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
                bookingForm.reset();
                autoFillUserData();
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

      const reviewForm = document.getElementById('submit-review-form');
      if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const reviewData = {
            loai: 'bac_si',
            target_id: document.getElementById('review-doctor-id').value,
            ho_ten: document.getElementById('review-name').value.trim(),
            email: document.getElementById('review-email').value.trim(),
            lien_he: document.getElementById('review-phone').value.trim(),
            so_sao: document.getElementById('review-stars').value,
            noi_dung: document.getElementById('review-content').value.trim()
          };

          try {
            const response = await fetch('api.php?action=add_review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(reviewData)
            });

            if (response.ok) {
              const result = await response.json();
              if(result.success) {
                alert('Cảm ơn bạn đã gửi đánh giá!');
                reviewForm.reset();
                location.reload(); 
              } else {
                alert(result.message || 'Gửi đánh giá thất bại.');
              }
            } else {
              alert('Gửi đánh giá thất bại.');
            }
          } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
          }
        });
      }

      const newsContainer = document.getElementById('news-grid-container');
      if (newsContainer) {
        try {
          const res = await fetch('api.php?action=get_all_news');
          if (res.ok) {
            const newsList = await res.json();
            if (Array.isArray(newsList) && newsList.length > 0) {
              const mainNews = newsList[0];
              const subNewsItems = newsList.slice(1, 5).map(item => `
                <div class="news-list-item">
                  <img src="${item.hinh_anh || 'IMAGE/Yoga.jpg'}" alt="${item.tieu_de}">
                  <div>
                    <h4>${item.tieu_de}</h4>
                    <a href="news-detail.html?id=${item.id}">Xem chi tiết &rarr;</a>
                  </div>
                </div>
              `).join('');

              newsContainer.innerHTML = `
                <div class="news-main">
                  <img src="${mainNews.hinh_anh || 'IMAGE/Yoga.jpg'}" alt="${mainNews.tieu_de}">
                  <div class="news-date">${mainNews.ngay_dang || 'Cập nhật gần đây'}</div>
                  <h3>${mainNews.tieu_de}</h3>
                  <p>${mainNews.tom_tat || mainNews.noi_dung || ''}</p>
                  <a href="news-detail.html?id=${mainNews.id}" class="btn-primary" style="margin-top: 10px; display:inline-block;">Xem chi tiết</a>
                </div>
                <div class="news-list">
                  ${subNewsItems}
                </div>
              `;
            }
          }
        } catch (e) {
          console.error("Lỗi khi tải tin tức:", e);
        }
      }
    });

    window.addEventListener('resize', () => {
      currentSlideIndex = 0;
      const sliderWrapper = document.getElementById('home-services-slider');
      if (sliderWrapper) sliderWrapper.style.transform = `translateX(0%)`;

      currentDoctorSlideIndex = 0;
      const doctorWrapper = document.getElementById('doctors-grid-container');
      if (doctorWrapper) doctorWrapper.style.transform = `translateX(0%)`;
    });

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
          console.error("Lỗi phân tích dữ liệu người dùng:", e);
        }
      }
    }

    function autoFillUserData() {
      const loggedUser = localStorage.getItem('medivax_user') || sessionStorage.getItem('medivax_user');
      if (loggedUser) {
        try {
          const userData = JSON.parse(loggedUser);
          const nameInput = document.getElementById('book-name');
          const emailInput = document.getElementById('book-email');
          const phoneInput = document.getElementById('book-phone');
          const addressInput = document.getElementById('book-address');

          if (nameInput && !nameInput.value) nameInput.value = userData.ho_ten || userData.name || '';
          if (emailInput && !emailInput.value) emailInput.value = userData.email || '';
          if (phoneInput && !phoneInput.value) phoneInput.value = userData.so_dien_thoai || userData.phone || '';
          if (addressInput && !addressInput.value) addressInput.value = userData.dia_chi || '';
        } catch (e) {
          console.error("Lỗi auto-fill dữ liệu user:", e);
        }
      }
    }

    function viewServiceDetail(id) {
      window.location.href = `service-detail.html?id=${id}`;
    }

    function updateCartCount() {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      let totalCount = cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
      const countSpan = document.getElementById('cart-count');
      if (countSpan) countSpan.textContent = totalCount;
    }

    function addToVaccineCart(id, name, price) {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: id, name: name, price: parseFloat(price) || 0, quantity: 1 });
      }
      localStorage.setItem('medivax_cart', JSON.stringify(cart));
      updateCartCount();
      alert('Đã thêm vắc-xin vào giỏ thành công!');
    }

    async function lookupVaccineOrder() {
      const phone = document.getElementById('lookup-input').value.trim();
      const resultDiv = document.getElementById('lookup-result');

      if (!phone) {
        alert('Vui lòng nhập số điện thoại để tra cứu!');
        return;
      }

      resultDiv.innerHTML = `<p style="margin-top: 10px; color: #555;">Đang tra cứu dữ liệu từ kho lạnh...</p>`;

      try {
        const response = await fetch(`api.php?action=lookup_vaccine&phone=${encodeURIComponent(phone)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            let html = `<div class="lookup-success-box" style="margin-top: 15px; padding: 15px; background: #e0f7fa; border-radius: 6px; color: #006064;">
              <strong>Kết quả tra cứu cho SĐT: ${phone}</strong><br><br>`;
            
            data.orders.forEach((order) => {
              html += `
                <div style="border-bottom: 1px solid #b2ebf2; padding-bottom: 8px; margin-bottom: 8px;">
                  • <b>Mã phiếu/Đơn #${order.id}</b><br>
                  - Dịch vụ/Vắc-xin: <b>${order.chi_tiet_don_hang}</b><br>
                  - Trạng thái: <span style="color: #d32f2f; font-weight: bold;">${order.trang_thai}</span><br>
                  - Ngày đặt: ${order.ngay_dat || 'Chưa cập nhật'} | Giờ hẹn: ${order.thoi_han || 'Chưa rõ'}
                </div>
              `;
            });
            html += `</div>`;
            resultDiv.innerHTML = html;
          } else {
            resultDiv.innerHTML = `<div class="lookup-success-box" style="margin-top: 15px; padding: 12px; background: #ffebee; border-radius: 6px; color: #c62828;">
              Không tìm thấy phiếu đặt giữ vắc-xin nào tương ứng với số điện thoại: <b>${phone}</b>.
            </div>`;
          }
        } else {
          resultDiv.innerHTML = `<div style="margin-top: 15px; color: red;">Không thể kết nối đến máy chủ cơ sở dữ liệu.</div>`;
        }
      } catch (error) {
        console.error('Lỗi khi tra cứu:', error);
        resultDiv.innerHTML = `<div style="margin-top: 15px; color: red;">Đã xảy ra lỗi trong quá trình tra cứu.</div>`;
      }
    }

    function moveSlide(direction) {
      const sliderWrapper = document.getElementById('home-services-slider');
      if (!sliderWrapper) return;
      const items = sliderWrapper.querySelectorAll('.service-slide-item');
      if (items.length === 0) return;

      let visibleCount = 3;
      if (window.innerWidth <= 600) visibleCount = 1;
      else if (window.innerWidth <= 900) visibleCount = 2;

      const maxIndex = Math.max(0, items.length - visibleCount);
      currentSlideIndex += direction;
      if (currentSlideIndex < 0) currentSlideIndex = maxIndex;
      else if (currentSlideIndex > maxIndex) currentSlideIndex = 0;

      const movePercentage = currentSlideIndex * (100 / visibleCount);
      sliderWrapper.style.transform = `translateX(-${movePercentage}%)`;
    }

    function moveDoctorSlide(direction) {
      const sliderWrapper = document.getElementById('doctors-grid-container');
      if (!sliderWrapper) return;
      const items = sliderWrapper.querySelectorAll('.doctor-card');
      if (items.length === 0) return;

      let visibleCount = 3;
      if (window.innerWidth <= 600) visibleCount = 1;
      else if (window.innerWidth <= 900) visibleCount = 2;

      const maxIndex = Math.max(0, items.length - visibleCount);
      currentDoctorSlideIndex += direction;
      if (currentDoctorSlideIndex < 0) currentDoctorSlideIndex = maxIndex;
      else if (currentDoctorSlideIndex > maxIndex) currentDoctorSlideIndex = 0;

      const movePercentage = currentDoctorSlideIndex * (100 / visibleCount);
      sliderWrapper.style.transform = `translateX(-${movePercentage}%)`;
    }
