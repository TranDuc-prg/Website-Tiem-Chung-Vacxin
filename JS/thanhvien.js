    document.addEventListener("DOMContentLoaded", function() {
      fetch('api.php?action=get_staff')
        .then(response => response.json())
        .then(data => {
          const tableBody = document.getElementById('staff-table-body');
          const teamGrid = document.getElementById('staff-card-grid');
          
          const avatarPool = [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
          ];
          
          if (data && data.length > 0) {
            tableBody.innerHTML = '';
            teamGrid.innerHTML = '';
            
            data.forEach((member, index) => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${String(index + 1).padStart(2, '0')}</td>
                <td><a href="#">#${member.id}</a></td>
                <td>${member.ho_ten}</td>
                <td><span class="badge">${member.chuc_vu}</span></td>
                <td>${member.so_dien_thoai || 'Chưa cập nhật'}</td>
                <td>${member.email}</td>
              `;
              tableBody.appendChild(row);

              const randomAvatar = avatarPool[index % avatarPool.length];

              const card = document.createElement('div');
              card.className = 'team-card';
              card.innerHTML = `
                <img src="${randomAvatar}" alt="${member.ho_ten}">
                <h3>${member.ho_ten}</h3>
                <div class="badge" style="margin-bottom: 8px;">${member.chuc_vu}</div>
                <div class="student-id">Mã NV: #${member.id}</div>
                <div class="class-info">SĐT: ${member.so_dien_thoai || 'Chưa cập nhật'}</div>
                <div class="hobby">📧 ${member.email}</div>
                <div class="quote">"Hệ thống quản lý và tiêm chủng Vacxin."</div>
              `;
              teamGrid.appendChild(card);
            });
          } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Không có dữ liệu nhân sự.</td></tr>`;
            teamGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Không có dữ liệu nhân sự.</p>`;
          }
        })
        .catch(error => console.error('Lỗi khi tải dữ liệu thành viên:', error));
    });
