// --- QUẢN LÝ HỆ THỐNG GIFTCODE ---

const GLOBAL_GIFTCODES = {
    "GAMEVUI999": {
        amount: 10000000, 
        maxUses: 10,      
        active: true
    },
    "GAMEHAY999": {
        amount: 10000000, 
        maxUses: 10,      
        active: true
    }
};

function claimGiftcode() {
    const codeInput = document.getElementById('giftcode-input');
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toUpperCase();
    if (!code) {
        alert("Vui lòng nhập mã Giftcode!");
        return;
    }

    if (typeof currentUser === 'undefined' || !currentUser) {
        alert("Vui lòng đăng nhập trước khi nhận quà!");
        return;
    }

    // ĐÃ SỬA: Thêm dấu ! để kiểm tra đúng điều kiện mã không tồn tại
    if (!GLOBAL_GIFTCODES.hasOwnProperty(code)) {
        alert("Mã Giftcode không tồn tại!");
        return;
    }

    const giftConfig = GLOBAL_GIFTCODES[code];
    if (!giftConfig.active) {
        alert("Mã Giftcode này đã tạm khóa!");
        return;
    }

    // ĐÃ SỬA: Hỗ trợ cả trường hợp currentUser là string hoặc object
    const userId = (typeof currentUser === 'object' && currentUser !== null) ? currentUser.uid : currentUser;
    
    const db = firebase.database();
    const codeRef = db.ref('giftcodes/' + code);
    const userClaimRef = db.ref('users/' + userId + '/claimedCodes/' + code);

    // 1. Kiểm tra lịch sử người dùng đã nhập chưa
    userClaimRef.once('value', (claimedSnap) => {
        if (claimedSnap.exists()) {
            alert("Bạn đã sử dụng mã Giftcode này rồi, không thể nhận lại!");
            return;
        }

        // 2. Kiểm tra và cập nhật lượt trên Firebase (Chống tranh chấp bằng Transaction)
        codeRef.transaction((currentData) => {
            if (!currentData) {
                return {
                    currentUses: 0,
                    maxUses: giftConfig.maxUses,
                    amount: giftConfig.amount
                };
            }
            if (currentData.currentUses >= currentData.maxUses) {
                return; // Hết lượt
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
                userClaimRef.set(true);

                const rewardAmount = giftConfig.amount;
                const userBalanceRef = db.ref('users/' + userId + '/balance');

                // Cộng tiền vào tài khoản người chơi trên Firebase
                userBalanceRef.transaction((currentBalance) => {
                    return (currentBalance || 0) + rewardAmount;
                }, (balErr, balCommitted) => {
                    if (balCommitted) {
                        codeInput.value = ''; // Xóa ô nhập

                        // Cập nhật biến số dư và giao diện ngay lập tức nếu có
                        if (typeof currentBalance !== 'undefined') {
                            currentBalance += rewardAmount;
                        }
                        const balanceEl = document.getElementById('ui-balance');
                        if (balanceEl) {
                            balanceEl.innerText = (typeof currentBalance !== 'undefined' ? currentBalance : rewardAmount).toLocaleString();
                        }

                        // Gọi thông báo nổi "Ting ting"
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
