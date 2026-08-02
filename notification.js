// --- Quản lý thông báo nổi và âm thanh Ting Ting khi nhận tiền ---

function initToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }
}

function playNotificationSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio context chờ tương tác người dùng.");
    }
}

function showMoneyToast(message) {
    initToastContainer();
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        background: linear-gradient(135deg, #00ffcc, #00b386);
        color: #000;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: bold;
        font-family: 'Orbitron', sans-serif;
        box-shadow: 0 5px 15px rgba(0, 255, 204, 0.4);
        border: 2px solid #fff;
        animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
    `;
    toast.innerHTML = `💰 ${message}`;

    container.appendChild(toast);
    playNotificationSound();

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function listenForTransactions(userId) {
    if (!userId) return;
    const notifRef = firebase.database().ref('users/' + userId + '/notifications');
    
    notifRef.limitToLast(1).on('child_added', (snapshot) => {
        const notifData = snapshot.val();
        if (notifData && !notifData.read) {
            showMoneyToast(`Nhận ${Number(notifData.amount).toLocaleString()} VNĐ từ ${notifData.senderName}!`);
            snapshot.ref.update({ read: true });
        }
    });
}

