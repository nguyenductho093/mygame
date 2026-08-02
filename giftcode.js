// --- QUẢN LÝ HỆ THỐNG GIFTCODE RIÊNG BIỆT ---

// Thọ có thể chỉnh sửa, thêm bớt danh sách các mã code tại đây cực kỳ dễ dàng
const GLOBAL_GIFTCODES = {
    "THO2027": {
        amount: 100000000,   // Mệnh giá 10.000.000 VNĐ (10m)
        maxUses: 10,        // Giới hạn 10 lượt toàn server
        active: true
    },
    // Thọ muốn thêm mã mới thì cứ viết tiếp vào đây theo mẫu:
    /*
    "TET2026": {
        amount: 5000000,    // 5 triệu
        maxUses: 20,        // 20 lượt
        active: true
    }
    */
};

// Hàm xử lý khi người chơi bấm nhận Giftcode
function claimGiftcode() {
    const codeInput = document.getElementById('giftcode-input');
    if (!codeInput) return;

    // Chuyển chữ thường thành chữ hoa và loại bỏ khoảng trắng
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        alert("Vui lòng nhập mã Giftcode!");
        return;
    }

    // Kiểm tra đăng nhập
    if (typeof currentUser === 'undefined' || !currentUser) {
        alert("Vui lòng đăng nhập trước khi nhận quà!");
        return;
    }

    // Kiểm tra xem mã có nằm trong danh sách quản lý ở trên không
    if (!GLOBAL_GIFTCODES.hasOwnProperty(code)) {
        alert("Mã Giftcode không tồn tại!");
        return;
    }

    const codeConfig = GLOBAL_GIFTCODES[code];
    if (!codeConfig.active) {
        alert("Mã Giftcode này đã tạm khóa!");
        return;
    }

    const userId = currentUser.uid;
    const db = firebase.database();
    const codeRef = db.ref('giftcodes/' + code);
    const userClaimedRef = db.ref('users/' + userId + '/claimedCodes/' + code);

    // 1. Kiểm tra lịch sử người dùng đã nhập chưa
    userClaimedRef.once('value', (claimedSnap) => {
        if (claimedSnap.exists()) {
            alert("Bạn đã sử dụng mã Giftcode này rồi, không thể nhận lại!");
            return;
        }

        // 2. Kiểm tra và cập nhật lượt trên Firebase (Chống tranh chấp bằng Transaction)
        codeRef.transaction((currentData) => {
            if (!currentData) {
                // Nếu trên Firebase chưa có node này, khởi tạo mặc định từ file cấu hình
                currentData = {
                    currentUses: 0,
                    maxUses: codeConfig.maxUses,
                    amount: codeConfig.amount
                };
            }

            // Kiểm tra giới hạn toàn server
            if (currentData.currentUses >= currentData.maxUses) {
                return; // Hết lượt, hủy transaction
            }

            currentData.currentUses++;
            return currentData;
        }, (error, committed, snapshot) => {
            if (error) {
                alert("Có lỗi xảy ra, vui lòng thử lại!");
            } else if (!committed) {
                alert("Mã Giftcode này đã hết lượt sử dụng trên toàn server!");
            } else {
                // Thành công: Đánh dấu user đã nhận mã này
                userClaimedRef.set(true);

                const rewardAmount = codeConfig.amount;
                const userBalanceRef = db.ref('users/' + userId + '/balance');

                // Cộng tiền vào tài khoản người chơi
                userBalanceRef.transaction((currentBalance) => {
                    return (currentBalance || 0) + rewardAmount;
                }, (balErr, balCommitted) => {
                    if (balCommitted) {
                        codeInput.value = ''; // Xóa ô nhập
                        
                        // Gọi thông báo nổi "ting ting" nếu đã tích hợp notification.js
                        if (typeof showMoneyToast === 'function') {
                            showMoneyToast(`Nhận thành công ${rewardAmount.toLocaleString()} VNĐ từ Giftcode: ${code}!`);
                        } else {
                            alert(`Nhận thành công ${rewardAmount.toLocaleString()} VNĐ!`);
                        }
                    }
                });
            }
        });
    });
}

