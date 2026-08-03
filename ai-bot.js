// ==========================================
// FILE: ai-bot.js (AI Trợ Lý cho Kênh Thế Giới)
// ==========================================

const GEMINI_API_KEY = "AQ.Ab8RN6K3DrM1BLWRrEZuqEehSXQOCQ3KN6n74Dd1QRZtvKD0PA"; 

async function askGemini(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
        
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI đang lú chút, Thọ hỏi lại nha! 🤖";
        }
    } catch (error) {
        console.error("Lỗi kết nối Gemini:", error);
        return "Mạng mẽo thế nào ấy, không gọi được AI! 😅";
    }
}

db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    // Kiểm tra dữ liệu: dùng data.text thay vì data.msg
    if (!data || !data.text || data.sender === 'AI TRỢ LÝ - Thọ') return;

    const messageText = data.text.toLowerCase().trim();
    
    // Điều kiện kích hoạt khi gõ @bot, @ai hoặc chứa từ khóa
    if (messageText.startsWith("@bot") || messageText.startsWith("@ai") || messageText.includes("trợ lý") || messageText.includes("ai ơi")) {
        
        const aiResponse = await askGemini(data.text);
        
        // Đẩy phản hồi lên Firebase theo đúng chuẩn cấu trúc text
        db.ref('global_chat').push({
            sender: 'AI TRỢ LÝ - Thọ',
            text: aiResponse,
            timestamp: Date.now()
        });
    }
});
