// ==========================================
// FILE: ai-bot.js (AI Trợ Lý cho Kênh Thế Giới)
// ==========================================

const GEMINI_API_KEY = "AQ.Ab8RN6LawGMelsmH9OKwpKG4TKhirJp_cxk7M5yU119e7uo0ew"; 

async function askGemini(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemPrompt = `Bạn là 'AI TRỢ LÝ - Thọ', một trợ lý ảo thông minh, vui tính trong game cá cược. Hãy trả lời ngắn gọn (dưới 50 chữ) và dùng emoji. Câu hỏi: "${userMessage}"`;

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
        
        // In toàn bộ dữ liệu phản hồi từ Google ra F12 để kiểm tra
        console.log("Phản hồi từ Gemini API:", data);

        // Kiểm tra nếu API trả về lỗi cấu trúc hoặc khóa lỗi
        if (data.error) {
            console.error("Lỗi từ Google API:", data.error.message);
            return `Lỗi API: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI đang lú chút do cấu trúc trả về lạ! 🤖";
        }
    } catch (error) {
        console.error("Lỗi mạng khi fetch:", error);
        return "Lỗi kết nối mạng tới Google API! 😅";
    }
}

db.ref('global_chat').on('child_added', async snap => {
    const data = snap.val();
    if (!data || !data.text || data.sender === 'AI TRỢ LÝ - Thọ') return;

    const messageText = data.text.toLowerCase().trim();
    
    if (messageText.startsWith("@bot") || messageText.startsWith("@ai") || messageText.includes("trợ lý") || messageText.includes("ai ơi")) {
        
        const aiResponse = await askGemini(data.text);
        
        db.ref('global_chat').push({
            sender: 'AI TRỢ LÝ - Thọ',
            text: aiResponse,
            timestamp: Date.now()
        });
    }
});
