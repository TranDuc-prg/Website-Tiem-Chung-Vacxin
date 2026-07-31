    const API_URL = 'api.php';
    let currentRating = 5;

    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('id');

      if (!articleId) {
        document.getElementById('article-detail-container').innerHTML = '<div class="error-box">Không tìm thấy mã bài viết.</div>';
        return;
      }

      loadArticleDetail(articleId);
    });

    async function loadArticleDetail(id) {
      try {
        const [newsRes, reviewRes] = await Promise.all([
          fetch(`${API_URL}?action=get_all_news`),
          fetch(`${API_URL}?action=get_reviews&loai=tin_tuc&target_id=${id}`)
        ]);

        if (!newsRes.ok) throw new Error('Lỗi tải tin tức');
        
        const newsList = await newsRes.json();
        let comments = [];
        try {
          if (reviewRes.ok) {
            comments = await reviewRes.json();
          }
        } catch (e) {
          comments = [];
        }

        const article = newsList.find(item => item.id == id);
        const recentContainer = document.getElementById('recent-news-list');

        if (Array.isArray(newsList) && newsList.length > 0) {
          recentContainer.innerHTML = newsList.slice(0, 5).map(item => `
            <a href="news-detail.html?id=${item.id}" class="recent-item">
              <img src="${item.hinh_anh || 'IMAGE/anh1.jpg'}" alt="" onerror="this.src='IMAGE/anh1.jpg'">
              <div class="recent-item-title">${escapeHtml(item.tieu_de)}</div>
            </a>
          `).join('');
        }

        if (!article) {
          document.getElementById('article-detail-container').innerHTML = '<div class="error-box">Bài viết không tồn tại.</div>';
          return;
        }

        let avgRating = "5.0";
        let totalReviews = Array.isArray(comments) ? comments.length : 0;
        
        if (totalReviews > 0) {
          const totalStars = comments.reduce((sum, item) => sum + parseFloat(item.so_sao || 5), 0);
          avgRating = (totalStars / totalReviews).toFixed(1);
        }

        const relatedItems = newsList.filter(item => item.id != id).slice(0, 3);

        document.getElementById('article-detail-container').innerHTML = `
          <div class="article-detail-card">
            <h1 class="article-title">${escapeHtml(article.tieu_de)}</h1>
            <div class="article-meta">
              <span>Đã đăng trên ${article.ngay_dang || '28 Tháng Năm, 2024'} bởi admin</span>
            </div>
            
            <div class="article-body">
              ${article.tom_tat ? `<p><strong>${escapeHtml(article.tom_tat)}</strong></p>` : ''}
              ${article.hinh_anh ? `<img src="${article.hinh_anh}" alt="" onerror="this.style.display='none'">` : ''}
              <div>${article.noi_dung || 'Nội dung chi tiết đang được cập nhật...'}</div>
            </div>

            <div class="related-section">
              <div class="related-title">Bài viết liên quan</div>
              <div class="related-grid">
                ${relatedItems.length > 0 ? relatedItems.map(rel => `
                  <a href="news-detail.html?id=${rel.id}" class="related-card">
                    <img src="${rel.hinh_anh || 'IMAGE/anh1.jpg'}" alt="" onerror="this.src='IMAGE/anh1.jpg'">
                    <div class="related-card-body">
                      <div class="related-card-title">${escapeHtml(rel.tieu_de)}</div>
                      <div class="related-card-date">${rel.ngay_dang || 'Th5 28, 2024'}</div>
                    </div>
                  </a>
                `).join('') : '<p style="font-size:13px; color:#64748b;">Chưa có bài viết liên quan.</p>'}
              </div>
            </div>

            <div class="comment-section">
              <h3>Đánh giá & Bình luận dịch vụ</h3>
              <div class="comment-note">Hãy chia sẻ trải nghiệm hoặc thắc mắc của bạn về dịch vụ này.</div>
              
              <div class="rating-overview-box">
                <div class="rating-overview-score">
                  ${totalReviews > 0 ? avgRating : '5.0'}
                  <div class="rating-overview-stars">★★★★★</div>
                </div>
                <div class="rating-overview-info">
                  <h4>Đánh giá trung bình từ khách hàng</h4>
                  <p>Dựa trên ${totalReviews} đánh giá hợp lệ</p>
                </div>
              </div>

              <div class="comments-list-wrapper" id="comments-list">
                ${totalReviews > 0 ? comments.map(c => {
                  const ratingVal = parseInt(c.so_sao || 5);
                  return `
                    <div class="comment-item">
                      <div class="comment-item-header">
                        <span class="comment-author">
                          ${escapeHtml(c.ho_ten)} 
                          <span class="comment-stars">${'★'.repeat(ratingVal)}${'☆'.repeat(5 - ratingVal)}</span>
                        </span>
                        <span class="comment-date">${c.ngay_tao || ''}</span>
                      </div>
                      ${c.sdt || c.email ? `
                        <div class="comment-contact-info">
                          ${c.sdt ? `📞 ${escapeHtml(c.sdt)}` : ''} ${c.sdt && c.email ? ' | ' : ''} ${c.email ? `✉️ ${escapeHtml(c.email)}` : ''}
                        </div>
                      ` : ''}
                      <div class="comment-text">${escapeHtml(c.noi_dung)}</div>
                    </div>
                  `;
                }).join('') : '<p style="font-size: 13px; color: #64748b; padding: 10px 0;">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá bài viết này!</p>'}
              </div>

              <div class="comment-form-container">
                <div class="rating-select-group">
                  <span>Chất lượng dịch vụ (Chọn sao) *</span>
                  <div class="stars-selection" id="star-rating-box">
                    <span class="star-item active" data-value="1">★</span>
                    <span class="star-item active" data-value="2">★</span>
                    <span class="star-item active" data-value="3">★</span>
                    <span class="star-item active" data-value="4">★</span>
                    <span class="star-item active" data-value="5">★</span>
                  </div>
                  <span id="rating-text" style="font-size: 13px; color: #d97706;">(5/5 sao)</span>
                </div>

                <form class="comment-form" id="form-comment">
                  <textarea id="cmt-content" placeholder="Nội dung đánh giá *" required></textarea>
                  <div class="comment-form-row">
                    <input type="text" id="cmt-name" placeholder="Họ và tên *" required>
                    <input type="tel" id="cmt-phone" placeholder="Số điện thoại *" required>
                    <input type="email" id="cmt-email" placeholder="Email *" required>
                  </div>
                  <div class="comment-checkbox">
                   
                  </div>
                  <button type="submit" class="btn-comment-submit">GỬI ĐÁNH GIÁ</button>
                </form>
              </div>

            </div>

          </div>
        `;

        setupStarRating();

        document.getElementById('form-comment').addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('cmt-name').value;
          const phone = document.getElementById('cmt-phone').value;
          const email = document.getElementById('cmt-email').value;
          const text = document.getElementById('cmt-content').value;

          const formData = new URLSearchParams({
            action: 'add_review',
            loai: 'tin_tuc',
            target_id: id,
            ho_ten: name,
            sdt: phone,
            email: email,
            so_sao: currentRating,
            noi_dung: text
          });

          try {
            const res = await fetch(API_URL, {
              method: 'POST',
              body: formData
            });
            const result = await res.json();

            if (result.success) {
              alert('Gửi đánh giá thành công!');
              loadArticleDetail(id); 
            } else {
              alert('Lỗi: ' + (result.message || 'Không thể gửi bình luận.'));
            }
          } catch (err) {
            console.error(err);
            alert('Lỗi kết nối máy chủ!');
          }
        });

      } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById('article-detail-container').innerHTML = '<div class="error-box">Lỗi kết nối mạng hoặc máy chủ.</div>';
      }
    }

    function setupStarRating() {
      const stars = document.querySelectorAll('.star-item');
      const ratingText = document.getElementById('rating-text');

      stars.forEach(star => {
        star.addEventListener('click', function() {
          const val = parseInt(this.getAttribute('data-value'));
          currentRating = val;
          ratingText.innerText = `(${val}/5 sao)`;

          stars.forEach(s => {
            if (parseInt(s.getAttribute('data-value')) <= val) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });
        });
      });
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
