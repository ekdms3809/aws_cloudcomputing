import React, { useState } from "react";
import "./App.css";

const GEMINI_URL = "https://3vhe3u5oiyvdfjgeug6sts3kfe0tdzdh.lambda-url.us-east-1.on.aws";
const NOVA_URL = "https://zbgmju7ovmvjzkvdtgxuwbuxna0vxaig.lambda-url.us-east-1.on.aws";

// [수정] 별자리 계산 함수
function getZodiacSign(month, day) {
  const signs = [
    { name: "염소자리", start: [1, 1], end: [1, 19] },
    { name: "물병자리", start: [1, 20], end: [2, 18] },
    { name: "물고기자리", start: [2, 19], end: [3, 20] },
    { name: "양자리", start: [3, 21], end: [4, 19] },
    { name: "황소자리", start: [4, 20], end: [5, 20] },
    { name: "쌍둥이자리", start: [5, 21], end: [6, 21] },
    { name: "게자리", start: [6, 22], end: [7, 22] },
    { name: "사자자리", start: [7, 23], end: [8, 22] },
    { name: "처녀자리", start: [8, 23], end: [9, 22] },
    { name: "천칭자리", start: [9, 23], end: [10, 22] },
    { name: "전갈자리", start: [10, 23], end: [11, 21] },
    { name: "사수자리", start: [11, 22], end: [12, 21] },
    { name: "염소자리", start: [12, 22], end: [12, 31] },
  ];
  for (const s of signs) {
    const afterStart = month > s.start[0] || (month === s.start[0] && day >= s.start[1]);
    const beforeEnd = month < s.end[0] || (month === s.end[0] && day <= s.end[1]);
    if (afterStart && beforeEnd) return s.name;
  }
  return "염소자리";
}

// [수정] 생년월일 유효성 검사 함수
function isValidBirthDate(str) {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  return true;
}

// [수정] 생년월일 입력 자동 포맷 (YYYY-MM-DD)
function formatBirthInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return digits.slice(0, 4) + "-" + digits.slice(4);
  return digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6);
}

function App() {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [geminiResult, setGeminiResult] = useState(null);
  const [novaResult, setNovaResult] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [novaLoading, setNovaLoading] = useState(false);

  const isLoading = geminiLoading || novaLoading;

  // [수정] 생년월일 키보드 입력 핸들러
  const handleBirthChange = (e) => {
    setBirthDate(formatBirthInput(e.target.value));
  };

  const testGemini = async () => {
    if (!birthDate || !gender) {
      setGeminiResult("⚠️ 생년월일과 성별은 필수 입력입니다.");
      return;
    }
    if (!isValidBirthDate(birthDate)) {
      setGeminiResult("⚠️ 생년월일 형식이 올바르지 않습니다. (예: 1995-03-15)");
      return;
    }
    setGeminiLoading(true);
    setGeminiResult(null);
    try {
      let prompt = `생년월일: ${birthDate}, 성별: ${gender}`;
      if (birthTime) prompt += `, 태어난 시간: ${birthTime}`;
      prompt += `\n당신은 사주명리학 전문가입니다. 사용자의 생년월일, 성별, 태어난 시간을 바탕으로 오늘의 사주 운세를 핵심만 간결하게 두줄로 분석해주세요. 한자를 사용하지 말고, 줄바꿈 없이 자연스러운 문장으로 작성해주세요.`;

      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: prompt, noteId: 1 }),
      });
      const text = await res.text();
      setGeminiResult(text.replace(/^"|"$/g, "").trim());
    } catch (e) {
      setGeminiResult("❌ 오류: " + e.message);
    } finally {
      setGeminiLoading(false);
    }
  };

  const testNova = async () => {
    if (!birthDate) {
      setNovaResult("⚠️ 생년월일은 필수 입력입니다.");
      return;
    }
    if (!isValidBirthDate(birthDate)) {
      setNovaResult("⚠️ 생년월일 형식이 올바르지 않습니다. (예: 1995-03-15)");
      return;
    }
    setNovaLoading(true);
    setNovaResult(null);
    try {
      const [, m, d] = birthDate.split("-").map(Number);
      const zodiac = getZodiacSign(m, d);
      const prompt = `나의 별자리는 ${zodiac}입니다. 당신은 서양 점성술 전문가입니다. 별자리를 바탕으로 오늘의 운세를 핵심만 간결하게 두줄로 분석해주세요. 한자를 사용하지 말고, 줄바꿈 없이 자연스러운 문장으로 작성해주세요.`;

      const res = await fetch(NOVA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: prompt, noteId: 1 }),
      });
      const text = await res.text();
      setNovaResult(text);
    } catch (e) {
      setNovaResult("❌ 오류: " + e.message);
    } finally {
      setNovaLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* [수정] 헤더 영역 */}
        <div className="header">
          <h1>🔮 오늘의 운세</h1>
          <p className="subtitle">생년월일과 성별을 입력하고 운세를 확인하세요</p>
        </div>

        {/* [수정] 카드형 입력 폼 */}
        <div className="card">
          {/* [수정] 생년월일 - text 타입으로 키보드 직접 입력 */}
          <div className="form-group">
            <label className="form-label" htmlFor="birthDate">🎂 생년월일 *</label>
            <input
              id="birthDate"
              type="text"
              className="form-input"
              placeholder="예: 1995-03-15"
              maxLength={10}
              value={birthDate}
              onChange={handleBirthChange}
              disabled={isLoading}
            />
          </div>

          {/* [수정] 성별 - 토글 버튼 스타일 */}
          <div className="form-group">
            <label className="form-label">👤 성별 *</label>
            <div className="gender-toggle">
              <button
                type="button"
                className={`gender-btn ${gender === "남" ? "active male" : ""}`}
                onClick={() => setGender("남")}
                disabled={isLoading}
              >
                ♂ 남
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === "여" ? "active female" : ""}`}
                onClick={() => setGender("여")}
                disabled={isLoading}
              >
                ♀ 여
              </button>
            </div>
          </div>

          {/* 태어난 시간 (선택) */}
          <div className="form-group">
            <label className="form-label" htmlFor="birthTime">🕐 태어난 시간 (선택)</label>
            <input
              id="birthTime"
              type="time"
              className="form-input"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* [수정] 버튼 그룹 */}
          <div className="button-group">
            <button
              className="action-btn gemini-btn"
              onClick={testGemini}
              disabled={isLoading}
            >
              {geminiLoading ? "분석 중..." : "🌙 Gemini 사주 운세"}
            </button>
            <button
              className="action-btn nova-btn"
              onClick={testNova}
              disabled={isLoading}
            >
              {novaLoading ? "분석 중..." : "⭐ Nova 별자리 운세"}
            </button>
          </div>
        </div>

        {/* [수정] 결과 영역 */}
        {geminiLoading && (
          <div className="result-card loading">
            <div className="spinner" />
            <span>Gemini가 사주를 분석하고 있습니다...</span>
          </div>
        )}
        {geminiResult && (
          <div className="result-card gemini-result">
            <div className="result-title">🌙 Gemini 사주 운세</div>
            <div className="result-body">{geminiResult}</div>
          </div>
        )}

        {novaLoading && (
          <div className="result-card loading">
            <div className="spinner" />
            <span>Nova가 별자리 운세를 분석하고 있습니다...</span>
          </div>
        )}
        {novaResult && (
          <div className="result-card nova-result">
            <div className="result-title">⭐ Nova 별자리 운세</div>
            <div className="result-body">{novaResult}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
