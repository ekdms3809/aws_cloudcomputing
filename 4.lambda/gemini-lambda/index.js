const { GoogleGenerativeAI } = require("@google/generative-ai");
const mysql = require('mysql2');
exports.handler = async (event) => {
    console.log("받은 이벤트", JSON.stringify(event))
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let inputData;
    try {
        inputData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return { statusCode: 400, body: 'Invalid JSON format' };
    }
    if (!inputData || !inputData.content || !inputData.noteId) {
        console.error('Invalid request: No content or noteId provided');
        return { statusCode: 400, body: 'No content or noteId provided' };
    }
    
    const userMessage = inputData.content;
    const noteId = inputData.noteId;
    
    try {
        const prompt = `당신은 사주명리학 전문가입니다. 사용자의 생년월일, 성별, 태어난 시간을 바탕으로 오늘의 사주 운세를 핵심만 간결하게 두줄로 분석해주세요.'
User input: ${userMessage}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
        const db = mysql.createConnection(dbConfig);
        db.connect();
        const sql = 'UPDATE notes SET ai_note = ?, ai_type = ? WHERE id = ?';
        const values = [aiResponse, 'gemini', noteId];
        await new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        db.end();
        return aiResponse;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Lambda function error');
    }
};
