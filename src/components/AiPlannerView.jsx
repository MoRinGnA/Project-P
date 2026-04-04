import { useState } from "react";
import "../styles/MapSearchView.css";

export default function AiPlannerView({ onGenerateSchedule }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!destination || !theme) return;

    setIsLoading(true);

    const prompt = `너는 전문 여행 플래너야. ${destination} 여행 일정을 ${days}일치 짜줘. 여행 테마는 ${theme}이야. 반드시 아래의 JSON 배열 형식으로만 응답해. 부가적인 설명이나 마크다운 기호는 절대 넣지 마.\n[\n  {"day": 1, "time": "10:00", "title": "방문 장소 이름", "location": "장소 주소"}\n]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBD-adW9WUsEoM0QEDbfOF55_tf9GkXk2U`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API 통신 거부 (코드: ${response.status})`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0].content) {
        throw new Error("AI가 빈 응답을 보냈습니다.");
      }

      const text = data.candidates[0].content.parts[0].text;
      const cleanJson = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const parsedSchedule = JSON.parse(cleanJson);

      const domesticKeywords = [
        "한국",
        "대한민국",
        "서울",
        "부산",
        "제주",
        "인천",
        "대구",
        "광주",
        "대전",
        "울산",
        "경기",
        "강원",
        "충북",
        "충남",
        "전북",
        "전남",
        "경북",
        "경남",
        "국내",
        "korea",
        "seoul",
        "busan",
        "jeju",
      ];
      const isDomestic = domesticKeywords.some((keyword) =>
        destination.toLowerCase().includes(keyword),
      );
      const recommendedProvider = isDomestic ? "kakao" : "google";

      onGenerateSchedule(parsedSchedule, days, recommendedProvider);
    } catch (error) {
      alert(`오류가 발생했습니다.\n이유: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="map-view-container">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-[#1d1d1f] tracking-tight">
          AI 일정 자동 생성
        </h2>
        <p className="text-[#86868b] mt-1 text-[15px]">
          Gemini AI가 여행 정보에 맞는 최적의 일정을 만들어줍니다.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#f5f5f7] w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              여행지
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예: 일본 오사카, 제주도"
              className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-[12px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
            />
          </div>

          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              여행 기간 (일)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-[12px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
            />
          </div>

          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              여행 테마
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="예: 맛집 탐방, 힐링과 휴식, 랜드마크 방문"
              className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-[12px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full mt-4 py-4 text-white text-[16px] font-semibold rounded-[12px] transition-colors ${
              isLoading
                ? "bg-[#86868b] cursor-not-allowed"
                : "bg-[#007aff] hover:bg-[#005bb5]"
            }`}
          >
            {isLoading ? "AI가 일정을 생성하고 있습니다..." : "일정 생성하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
