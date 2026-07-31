    document.addEventListener("DOMContentLoaded", () => {
      renderCart();
      checkUserLoginStatus();

      const checkoutForm = document.getElementById('checkout-form');
      if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
          if (cart.length === 0) {
            alert('Giỏ vắc-xin của bạn đang trống!');
            return;
          }

          const name = document.getElementById('checkout-name').value.trim();
          const phone = document.getElementById('checkout-phone').value.trim();
          const email = document.getElementById('checkout-email').value.trim();
          const address = document.getElementById('checkout-address').value.trim();
          const paymentMethod = document.getElementById('checkout-payment-method').value;

          if (!name || !phone) {
            alert('Vui lòng nhập đầy đủ họ tên và số điện thoại!');
            return;
          }

          let customerId = 0;
          const loggedUserStr = localStorage.getItem('medivax_user') || sessionStorage.getItem('medivax_user');
          if (loggedUserStr) {
            try {
              const uData = JSON.parse(loggedUserStr);
              customerId = uData.id || 0;
            } catch (err) {
              console.error(err);
            }
          }

          let orderDetails = cart.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');

          try {
            const response = await fetch('api.php?action=add_appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: customerId,
                fullName: name,
                phone: phone,
                email: email,
                dia_chi: address,
                booking_date: new Date().toISOString().split('T')[0],
                booking_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                trang_thai: 'Chờ xác nhận',
                loai_giao_dich: 'Giữ thuốc',
                chi_tiet_don_hang: orderDetails,
                phuong_thuc_thanh_toan: paymentMethod
              })
            });
            
            const result = await response.json();
            if (result.success) {
              alert(`Đã đặt giữ thuốc thành công cho khách hàng ${name}!`);
              localStorage.removeItem('medivax_cart');
              renderCart();
              checkoutForm.reset();
            } else {
              alert('Lỗi: ' + (result.message || 'Không thể lưu đơn giữ thuốc'));
            }
          } catch (error) {
            console.error("Lỗi kết nối:", error);
            alert('Lỗi kết nối đến máy chủ!');
          }
        });
      }
    });

    function updateCartCount() {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      let totalCount = cart.reduce((sum, item) => sum + parseInt(item.quantity || 1), 0);
      
      const countSpan = document.getElementById('cart-count');
      if (countSpan) {
        countSpan.textContent = totalCount;
      }
    }

    function renderCart() {
      updateCartCount();
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      const tbody = document.getElementById('cart-items-body');
      const totalPriceEl = document.getElementById('cart-total-price');

      if (!tbody) return;

      if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b;">Giỏ vắc-xin đang trống.</td></tr>`;
        if (totalPriceEl) totalPriceEl.textContent = '0 đ';
        return;
      }

      let grandTotal = 0;
      tbody.innerHTML = cart.map((item, index) => {
        let itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
        grandTotal += itemTotal;
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; font-weight: 500; color: #1e293b;">${item.name}</td>
            <td style="padding: 12px; text-align: center;">
              <div style="display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 4px;">
                <button type="button" onclick="changeQuantity(${index}, -1)" style="padding: 2px 8px; background: #f1f5f9; border: none; cursor: pointer;">-</button>
                <span style="padding: 0 12px;">${item.quantity}</span>
                <button type="button" onclick="changeQuantity(${index}, 1)" style="padding: 2px 8px; background: #f1f5f9; border: none; cursor: pointer;">+</button>
              </div>
            </td>
            <td style="padding: 12px; text-align: right; color: #0284c7; font-weight: 600;">${itemTotal.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 12px; text-align: center;">
              <button type="button" onclick="removeItem(${index})" style="background: #fee2e2; color: #ef4444; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Xóa</button>
            </td>
          </tr>
        `;
      }).join('');

      if (totalPriceEl) {
        totalPriceEl.textContent = grandTotal.toLocaleString('vi-VN') + ' đ';
      }
    }

    function changeQuantity(index, delta) {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
        localStorage.setItem('medivax_cart', JSON.stringify(cart));
        renderCart();
      }
    }

    function removeItem(index) {
      let cart = JSON.parse(localStorage.getItem('medivax_cart')) || [];
      cart.splice(index, 1);
      localStorage.setItem('medivax_cart', JSON.stringify(cart));
      renderCart();
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
            userNameSpan.textContent = `Xin chào, ${userData.fullName || userData.ho_ten || userData.name || 'Khách hàng'}`;
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

          const nameInput = document.getElementById('checkout-name');
          const phoneInput = document.getElementById('checkout-phone');
          const emailInput = document.getElementById('checkout-email');

          if (nameInput && !nameInput.value) nameInput.value = userData.fullName || userData.ho_ten || userData.name || '';
          if (phoneInput && !phoneInput.value) phoneInput.value = userData.phone || '';
          if (emailInput && !emailInput.value) emailInput.value = userData.email || '';

        } catch (e) {
          console.error("Lỗi phân tích dữ liệu người dùng:", e);
        }
      }
    }
