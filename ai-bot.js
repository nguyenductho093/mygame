// ==========================================
// FILE: ai-bot.js (AI Trợ Lý cho Kênh Thế Giới)
// ==========================================

const GEMINI_API_KEY = "AQ.Ab8RN6K3DrM1BLWRrEZuqEehSXQOCQ3KN6n74Dd1QRZtvKD0PA"; 

// 1. Hàm gửi tin nhắn cho Gemini và nhận kết quả
async function askGemini(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // "Bơm" thông tin để định hình tính cách cho AI
    const systemPrompt = `Bạn là 'AI TRỢ LÝ - Thọ', một trợ lý ảo cực kỳ thông minh, vui tính và hài hước trong tựa game cá cược Gà - Vịt - Ngỗng. 
    Chủ nhân của bạn (admin) là Thọ (tài khoản ndt999). 
    Hãy trả lời ngắn gọn (dưới 50 chữ), thân thiện và dùng nhiều emoji. 
    Câu hỏi của người chơi: "${userMessage}"`;

    const requestBody = {
        contents: [{
            parts: [{ text: systemPrompt }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        
        // Trích xuất câu trả lời từ Gemini
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Lỗi khi gọi Gemini:", error);
        return "Xin lỗi, đường truyền từ vũ trụ AI đang bị nghẽn, lát chat sau nha! 😅";
    }
}

// 2. Lắng nghe kênh chat và phản hồi
db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    
    // Không để AI tự trả lời chính nó (tránh kẹt vòng lặp)
    if (data.sender === 'AI TRỢ LÝ - Thọ') return;

    const text = data.msg.toLowerCase();
    
    // ĐIỀU KIỆN KÍCH HOẠT: Chỉ gọi AI khi có người nhắn kèm từ khóa "@bot", "trợ lý", hoặc "ai"
    if (text.includes("@bot") || text.includes("trợ lý") || text.includes("ai")) {
        
        // Gọi Gemini
        const aiResponse = await askGemini(data.msg);
        
        // Đẩy câu trả lời của Gemini lên Firebase
        db.ref('global_chat').push({
            sender: 'AI TRỢ LÝ - Thọ',
            msg: aiResponse,
            color: '#FFD700', // Màu Vàng Gold sang trọng cho AI
            time: Date.now()
        });
    }
});
