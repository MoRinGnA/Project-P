import { useState } from "react";
import "../styles/MapSearchView.css";

export default function AiPlannerView({ onGenerateSchedule }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [theme, setTheme] = useState("");
  const [budget, setBudget] = useState("1000000");
  const [isLoading, setIsLoading] = useState(false);

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBudget(value);
  };

  const handleGenerate = async () => {
    if (!destination || !theme || !budget) return;
    setIsLoading(true);

    const API_URL = import.meta.env.DEV
      ? "http://localhost:3000/api/gemini"
      : "/api/gemini";

    const systemPrompt = `너는 전문 여행 플래너야. 사용자가 입력한 목적지, 기간, 그리고 총 예산을 바탕으로 최적의 여행 일정을 세워줘.
목적지: ${destination}
기간: ${days}일
테마: ${theme}
총 예산: ${Number(budget).toLocaleString()}원

반드시 아래 형식을 엄격히 지켜서 JSON으로만 대답해:
[
  {
    "day": 1,
    "time": "09:00",
    "title": "장소 이름",
    "location": "상세 주소",
    "cost": 15000
  }
]

중요 조건:
1. 모든 일정 항목에는 'cost' 필드가 포함되어야 하며, 단위는 원화(KRW) 정수야.
2. 모든 일정의 'cost' 합계는 사용자가 제시한 총 예산(${budget}원)을 절대로 초과해서는 안 돼.
3. 항공권과 숙박비는 제외하고 현지에서 사용하는 일정 비용 위주로 구성해줘.`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: systemPrompt }),
      });

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const cleanJson = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const rawSchedule = JSON.parse(cleanJson);

      const scheduleWithIds = rawSchedule.map((item, index) => ({
        ...item,
        id: Date.now() + index,
      }));

      onGenerateSchedule(
        scheduleWithIds,
        Number(days),
        "google",
        Number(budget),
      );
    } catch (error) {
      console.error(error);
      alert("일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-12 bg-white">
      <div className="w-full max-w-lg">
        <header className="mb-10 text-center">
          <h2 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight mb-2">
            일정 자동 생성
          </h2>
          <p className="text-[#86868b] text-[17px]">
            Gemini AI가 예산에 맞춘 최적의 여정을 제안합니다.
          </p>
        </header>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#1d1d1f] ml-1">
              여행지
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="어디로 떠나시나요?"
              className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] focus:ring-2 focus:ring-[#007aff] outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-[1] space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] ml-1">
                기간 (일)
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] outline-none"
              />
            </div>
            <div className="flex-[2] space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] ml-1">
                총 예산 (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={budget}
                  onChange={handleBudgetChange}
                  className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] outline-none font-medium pr-16"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] text-[12px] font-medium pointer-events-none">
                  {budget ? `${Number(budget).toLocaleString()}원` : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#1d1d1f] ml-1">
              여행 테마
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="예: 맛집 탐방, 힐링"
              className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full py-4 rounded-[14px] text-white text-[17px] font-semibold transition-all shadow-md ${
              isLoading
                ? "bg-[#d2d2d7] cursor-not-allowed"
                : "bg-[#007aff] hover:bg-[#0071e3] active:scale-[0.98]"
            }`}
          >
            {isLoading ? "일정을 구성하는 중..." : "생성하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
