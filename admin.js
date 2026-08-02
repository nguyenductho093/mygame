// --- FILE: admin.js ---

// Kiểm tra nếu là tài khoản ndt999 thì cấp quyền và hiện nút Admin
function checkAdminAccount(username) {
    if (username === 'ndt999') {
        // Cấp số dư khủng
        firebase.database().ref('users/ndt999/balance').set(999999999999);
        
        // Hiện nút mở bảng quản trị
        const btnAdmin = document.getElementById('btn-open-admin');
        if (btnAdmin) btnAdmin.style.display = 'block';
    }
}

// Mở bảng quản trị và load dữ liệu real-time
function openAdminPanel() {
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) modal.style.display = 'block';

    const tbody = document.getElementById('admin-user-list');
    
    firebase.database().ref('users').on('value', (snapshot) => {
        tbody.innerHTML = '';
        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 15px;">Chưa có tài khoản.</td></tr>';
            return;
        }

        snapshot.forEach((childSnap) => {
            const username = childSnap.key;
            const userData = childSnap.val();
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

    firebase.database().ref('users/' + targetUser + '/balance').transaction((current) => {
        return (current || 0) + amount;
    }, (err, committed) => {
        if (committed) alert(`Đã cộng thành công cho ${targetUser}!`);
    });
}
