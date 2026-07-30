const API_URL = (window.location.port === '5500' || window.location.port === '5501' || window.location.protocol === 'file:')
  ? 'http://localhost/vaccination-center/api.php'
  : 'api.php';

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister?.classList.remove('active');
    loginForm?.classList.remove('hidden');
    registerForm?.classList.add('hidden');
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin?.classList.remove('active');
    registerForm?.classList.remove('hidden');
    loginForm?.classList.add('hidden');
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';

    const emailEl = document.getElementById('login-email') || document.getElementById('email');
    const passEl = document.getElementById('login-password') || document.getElementById('password');

    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang xử lý...';
      }

      const res = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const rawText = await res.text();
      let data;

      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Server Response Raw Text:", rawText);
        throw new Error("Không thể kết nối API. Hãy kiểm tra lại XAMPP!");
      }

      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        alert("Đăng nhập thành công!");

        
        const role = data.user.role;
        if (role === 'admin' || role === 'manager') {
          window.location.href = 'admin.html';
        } else if (role === 'staff') {
          window.location.href = 'staff.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        alert(data.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';

    const nameEl = document.getElementById('reg-name') || document.getElementById('reg-fullname') || document.getElementById('fullname');
    const phoneEl = document.getElementById('reg-phone') || document.getElementById('phone');
    const emailEl = document.getElementById('reg-email') || document.getElementById('email');
    const passEl = document.getElementById('reg-password') || document.getElementById('password');

    const fullName = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';

    if (!fullName || !email || !password || !phone) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại, Email và Mật khẩu!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại phải bao gồm đúng 10 chữ số và bắt đầu bằng số 0!");
      phoneEl?.focus();
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang xử lý...';
      }

      const res = await fetch(`${API_URL}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, password })
      });

      const rawText = await res.text();
      let data;

      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Server Response Raw Text:", rawText);
        throw new Error("Không thể đọc phản hồi từ Server.");
      }

      if (data.success) {
        alert(data.message);
        
        tabLogin?.click();
        
        const loginEmailInput = document.getElementById('login-email') || document.getElementById('email');
        if (loginEmailInput) loginEmailInput.value = email;
        
        registerForm.reset();
      } else {
        alert(data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }
  });
});