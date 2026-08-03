// ==========================================================================
// FILE: ai-bot.js (Bot Tự Động Kênh Thế Giới - Kèm Link Liên Hệ Facebook)
// ==========================================================================

// Ghi lại thời điểm trang vừa được load để ngăn bot trả lời dồn dập các tin cũ
const pageLoadTime = Date.now();

// Thời gian tự động xóa tin nhắn của bot (tính bằng mili-giây): 60 giây = 60000 ms
const BOT_MESSAGE_LIFETIME = 60000; 

db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    
    // Kiểm tra tính hợp lệ: Nếu không có dữ liệu, thiếu nội dung, hoặc do chính bot gửi thì bỏ qua
    if (!data || !data.text || data.sender === 'AI TRỢ LÝ - Thọ') return;

    // Nếu tin nhắn này có trước thời điểm load trang thì bỏ qua (chống lỗi dồn tin khi load lại trang)
    const msgTime = data.timestamp || 0;
    if (msgTime < pageLoadTime) return;

    // Danh sách các câu động viên, tương tác vui tươi và ấm áp
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

    // Gắn thêm dòng link liên hệ Facebook dạng thẻ HTML<a> để bấm vào là mở trực tiếp
    const fbLinkHtml = `<br><a href="https://www.facebook.com/nguyenductho0903" target="_blank" style="color: #0084ff; text-decoration: underline; font-size: 13px;">🔗 Báo lỗi / Liên hệ Admin Facebook</a>`;
    const fullMessageText = randomReply + fbLinkHtml;

    // Đẩy phản hồi của bot lên Firebase Realtime Database
    const newBotMsgRef = db.ref('global_chat').push({
        sender: 'AI TRỢ LÝ - Thọ',
        text: fullMessageText,
        timestamp: Date.now()
    });

    // Thiết lập đồng hồ đếm ngược 60 giây để XÓA RIÊNG tin nhắn của bot khỏi Firebase
    setTimeout(() => {
        newBotMsgRef.remove()
            .catch(error => {
                console.error("Không thể xóa tin nhắn của bot:", error);
            });
    }, BOT_MESSAGE_LIFETIME);
});
