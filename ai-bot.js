// ==========================================
// FILE: ai-bot.js (AI Trợ Lý cho Kênh Thế Giới)
// ==========================================

const GEMINI_API_KEY = "AQ.Ab8RN6K3DrM1BLWRrEZuqEehSXQOCQ3KN6n74Dd1QRZtvKD0PA"; 

async function askGemini(userMessage) {
    // Chuyển sang endpoint v1 và dùng gemini-1.5-flash chuẩn
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemPrompt = `Bạn là 'AI TRỢ LÝ - Thọ', trợ lý ảo thông minh, vui tính trong game cá cược. Hãy trả lời ngắn gọn (dưới 50 chữ) và dùng emoji. Câu hỏi: "${userMessage}"`;

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
        
        if (data.error) {
            console.error("Lỗi từ Google API:", data.error.message);
            return `Lỗi API: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI đang lú chút, Hãy hỏi lại sau nha! 🤖";
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
