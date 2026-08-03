// ==========================================
// FILE: ai-bot.js (Bot tự động trả lời siêu vui tươi cho Kênh Thế Giới)
// ==========================================

// Biến ghi nhớ thời điểm tin nhắn cuối cùng bot xử lý để tránh bị lặp
let lastProcessedTimestamp = 0;

db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    if (!data || !data.text || data.sender === 'AI TRỢ LÝ - Thọ') return;

    // Nếu tin nhắn này cũ hơn hoặc bằng tin nhắn mới nhất bot vừa xử lý thì bỏ qua ngay
    const msgTime = data.timestamp || 0;
    if (msgTime <= lastProcessedTimestamp) return;

    // Cập nhật lại mốc thời gian mới nhất đã xử lý
    lastProcessedTimestamp = msgTime;

    // Danh sách các câu động viên với nhiều icon vui tươi, ấm áp
    const botReplies = [
        "hôm nay thế nào, bạn thật đáng yêu! ❤️✨🎉",
        "chúc bạn may mắn cả ngày nhé! 🍀🌟🚀",
        "Bạn thật tuyệt vời! mạnh dạn lên đi, 😄💪🔥",
        "hôm nay có gì buồn à, yên tâm tôi sẽ luôn bên bạn mà! 🤗💖💫",
        "🌈 Sau cơn mưa sẽ luôn có cầu vồng. ☔✨✨",
        "🌸 Bạn đã cố gắng rất nhiều rồi, hãy nghỉ ngơi một chút. 🍵💆‍♀️💤",
        "🤍 Không sao đâu, ai cũng có những ngày tồi tệ cả. ✨🫂🌈",
        "🌻 Ngày mai sẽ là một khởi đầu mới. ☀️🌱🎈",
        "💪 Mình tin bạn sẽ vượt qua được chuyện này. 🔥🚀💯",
        "☀️ Đừng mất hy vọng nhé, ánh sáng vẫn đang chờ phía trước. ✨💛🌅",
        "💬 Nếu cần một người lắng nghe, mình luôn sẵn sàng. 🎧☕🤗",
        "🍀 Chuyện buồn rồi cũng sẽ qua, bình yên sẽ đến. 🍃🌊🕊️",
        "💛 Bạn không hề cô đơn đâu. 🌻✨🤗",
        "🌷 Hãy cho bản thân thêm thời gian để chữa lành. 💖🌿✨",
        "💧 Khóc một chút cũng không sao, đừng kìm nén cảm xúc. 🫂🌧️🤍",
        "🌼 Bạn mạnh mẽ hơn những gì bạn nghĩ. 💪⭐🔥",
        "🤗 Ôm một cái nhé, mọi chuyện sẽ dần tốt lên. 💖🧸✨",
        "⭐ Đừng bỏ cuộc, điều tốt đẹp vẫn đang chờ bạn. 🎁🚀🌈",
        "💖 Bạn xứng đáng với những điều hạnh phúc nhất. 🌸👑✨",
        "🌙 Hôm nay mệt thì nghỉ, ngày mai mình lại cố gắng tiếp. 🛌💤☕",
        "🕊️ Mong những điều bình yên sẽ sớm đến với bạn. 🌿✨🍃",
        "❤️ Dù chuyện gì xảy ra, mình vẫn luôn ủng hộ bạn. 🔥💪⭐"
    ];

    // Chọn ngẫu nhiên 1 câu từ danh sách
    const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];

    // Gửi phản hồi lên Firebase
    db.ref('global_chat').push({
        sender: 'AI TRỢ LÝ - Thọ',
        text: randomReply,
        timestamp: Date.now()
    });
});
