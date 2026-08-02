// --- FILE: admin.js ---

// Kiểm tra quyền và tự động kích hoạt giao diện Admin cho tài khoản ndt999
function checkAdminAccount(username) {
    if (username === 'ndt999') {
        // Cấp thêm số dư hoặc khởi tạo dữ liệu admin nếu cần
        firebase.database().ref('ndt999/balance').transaction((current) => {
            return current || 5000000;
        });
        
        // Hiện nút mở bảng quản trị ngay lập tức khi đúng tài khoản ndt999
        const btnAdmin = document.getElementById('btn-open-admin');
        if (btnAdmin) {
            btnAdmin.style.display = 'block';
        }
    }
}

// Tự động quét kiểm tra ngay khi trang web vừa tải xong
window.addEventListener('DOMContentLoaded', () => {
    // Lấy thông tin currentUser từ localStorage hoặc biến toàn cục của game
    const savedUser = localStorage.getItem('currentUser') || window.currentUser;
    if (savedUser === 'ndt999') {
        checkAdminAccount('ndt999');
    }
});

// Mở bảng quản trị và load dữ liệu real-time theo nhánh gốc
function openAdminPanel() {
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) modal.style.display = 'block';

    const tbody = document.getElementById('admin-user-list');
    
    firebase.database().ref('/').on('value', (snapshot) => {
        tbody.innerHTML = '';
        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 15px;">Chưa có tài khoản.</td></tr>';
            return;
        }

        snapshot.forEach((childSnap) => {
            const username = childSnap.key;
            const userData = childSnap.val();
            
            // Chỉ lấy các node có chứa thuộc tính balance (tài khoản người chơi)
            if (userData && typeof userData === 'object' && 'balance' in userData) {
                const balance = userData.balance ? Number(userData.balance).toLocaleString() : '0';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 10px; border: 1px solid #333; font-weight: bold; color: #00ffcc;">${username}</td>
                    <td style="padding: 10px; border: 1px solid #333; color: #ffcc00;">${balance} VNĐ</td>
                    <td style="padding: 10px; border: 1px solid #333;">
                        <button onclick="adminAddMoney('${username}')" style="background: #00ffcc; color: #000; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">+ Thêm tiền</button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        });
    });
}

function closeAdminPanel() {
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) modal.style.display = 'none';
}

// Cộng tiền nhanh cho user bất kỳ
function adminAddMoney(targetUser) {
    const amountStr = prompt(`Nhập số tiền muốn cộng cho ${targetUser}:`, "10000000");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Số tiền không hợp lệ!");

    firebase.database().ref(targetUser + '/balance').transaction((current) => {
        return (current || 0) + amount;
    }, (err, committed) => {
        if (committed) alert(`Đã cộng thành công cho ${targetUser}!`);
    });
}
