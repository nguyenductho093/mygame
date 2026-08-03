// ==========================================
// FILE: ai-bot.js (Bot tự động trả lời cho Kênh Thế Giới)
// ==========================================

db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    if (!data || !data.text || data.sender === 'AI TRỢ LÝ - Thọ') return;

    // Danh sách 4 câu trả lời cố định theo ý Thọ
    const botReplies = [
        "hôm nay thế nào, bạn thật đáng yêu! ❤️",
        "chúc bạn may mắn cả ngày nhé! 🍀",
        "Bạn thật tuyệt vời! mạnh dạn lên đi, 😄",
        "hôm nay có gì buồn à, yên tâm tôi sẽ luôn bên bạn mà! 🤗"
    ];

    // Chọn ngẫu nhiên 1 trong 4 câu trả lời
    const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];

    // Đẩy phản hồi của bot lên Firebase để hiển thị vào khung chat
    db.ref('global_chat').push({
        sender: 'AI TRỢ LÝ - Thọ',
        text: randomReply,
        timestamp: Date.now()
    });
});
