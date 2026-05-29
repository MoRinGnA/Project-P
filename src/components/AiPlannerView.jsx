import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function AiPlannerView({ onGenerateSchedule }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [theme, setTheme] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  const navigate = useNavigate();

  const loadingMessages = [
    "일정을 구성하는 중...",
    "여행 취향 분석 중...",
    "최적 동선 계산 중...",
    "맛집 탐방 준비 중...",
    "거의 다 완성되었어요!",
  ];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setMsgIndex((prev) =>
          prev < loadingMessages.length - 1 ? prev + 1 : prev,
        );
      }, 2500);
    } else {
      setMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBudget(value);
  };

  const handleGenerate = async () => {
    if (!destination || !theme) return;
    setIsLoading(true);

    const API_URL = import.meta.env.DEV
      ? `http://${window.location.hostname}:3000/api/gemini`
      : "/api/gemini";

    const budgetPrompt = budget
      ? `2. 모든 일정의 'cost' 합계는 총 예산(${budget}원)의 70% 이상 80% 이하가 되도록 구성해.`
      : `2. 현지 물가를 반영하여 각 장소나 활동에 필요한 현실적인 예상 비용을 'cost'에 산출해줘.`;

    const budgetText = budget
      ? `총 예산: ${Number(budget).toLocaleString()}원`
      : "총 예산: 제한 없음";

    const systemPrompt = `너는 전문 여행 플래너야. 사용자가 입력한 목적지, 기간을 바탕으로 최적의 여행 일정을 세워줘.
목적지: ${destination}
기간: ${days}일
테마: ${theme}
${budgetText}

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
${budgetPrompt}
3. 항공권과 숙박비는 절대 포함하지 마.`;

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

      const newRoomId = uuidv4();

      onGenerateSchedule(
        scheduleWithIds,
        Number(days),
        "google",
        Number(budget) || 0,
      );

      navigate(`/planner/${newRoomId}`);
    } catch (error) {
      console.error(error);
      alert("일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmptyStart = () => {
    if (!days) return;
    const newRoomId = uuidv4();
    onGenerateSchedule([], Number(days), "empty", Number(budget) || 0);
    navigate(`/planner/${newRoomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-12 bg-white">
      <div className="w-full max-w-lg">
        <header className="mb-10 text-center">
          <h2 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight mb-2">
            여행 일정 만들기
          </h2>
          <p className="text-[#86868b] text-[17px]">
            어떤 방식으로 여행을 준비할까요?
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
              className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] focus:bg-white focus:ring-2 focus:ring-[#007aff] focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15)] outline-none transition-all duration-300"
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
                className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] focus:bg-white focus:ring-2 focus:ring-[#007aff] focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15)] outline-none transition-all duration-300"
              />
            </div>
            <div className="flex-[2] space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] ml-1">
                총 예산 (선택)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={budget}
                  onChange={handleBudgetChange}
                  placeholder="예: 500000"
                  className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] focus:bg-white focus:ring-2 focus:ring-[#007aff] focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15)] outline-none font-medium pr-16 transition-all duration-300"
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
              className="w-full px-5 py-4 bg-[#f5f5f7] border-none rounded-[14px] text-[17px] focus:bg-white focus:ring-2 focus:ring-[#007aff] focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15)] outline-none transition-all duration-300"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`relative w-full rounded-[14px] text-[17px] font-semibold transition-all duration-300 overflow-hidden ${
              isLoading
                ? "cursor-not-allowed shadow-md"
                : "bg-[#007aff] text-white hover:bg-[#0071e3] shadow-[0_4px_14px_rgba(0,122,255,0.3)] active:scale-[0.98]"
            }`}
          >
            {isLoading && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square">
                  <div
                    className="w-full h-full animate-spin bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_75%,#5ac8fa_90%,#007aff_100%)]"
                    style={{ animationDuration: "2.5s" }}
                  />
                </div>
                <div className="absolute inset-[2.5px] bg-[#f5f5f7] rounded-[11.5px] z-10" />
              </>
            )}
            <div
              className={`relative z-20 w-full py-4 flex items-center justify-center ${
                isLoading
                  ? "text-[#007aff] font-bold animate-pulse"
                  : "text-white"
              }`}
            >
              {isLoading
                ? loadingMessages[msgIndex]
                : "AI 자동 생성으로 시작하기"}
            </div>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-b border-[#e5e5ea]"></div>
            <span className="px-4 text-[13px] font-semibold text-[#86868b]">
              또는
            </span>
            <div className="flex-1 border-b border-[#e5e5ea]"></div>
          </div>

          <button
            onClick={handleEmptyStart}
            className="w-full py-4 rounded-[14px] text-[16px] font-semibold bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea] transition-all duration-200 active:scale-[0.98]"
          >
            혼자서 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
