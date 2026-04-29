import { useState, useEffect } from "react";

export default function AddScheduleModal({
  place,
  days,
  activeDay,
  onClose,
  onAdd,
}) {
  const [selectedDay, setSelectedDay] = useState(activeDay);
  const [selectedTime, setSelectedTime] = useState("12:00");

  useEffect(() => {
    setSelectedDay(activeDay);
  }, [activeDay]);

  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300">
      <div
        className="
          w-[360px] p-8 rounded-[28px] bg-white 
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          transform transition-all duration-300 scale-100 opacity-100
        "
      >
        <h3 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight mb-2">
          일정 추가
        </h3>

        <p className="text-[15px] text-[#86868b] mb-8 line-clamp-1 border-b border-[#f5f5f7] pb-4">
          {place.place_name}
        </p>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2.5">
            방문 일차
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="w-full bg-[#f5f5f7] border-none rounded-xl py-3.5 px-4 text-[16px] text-[#1d1d1f] focus:ring-2 focus:ring-[#007aff] transition-all outline-none"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}일차
              </option>
            ))}
          </select>
        </div>

        <div className="mb-10">
          <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2.5">
            방문 시간
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-[#f5f5f7] border-none rounded-xl py-3.5 px-4 text-[16px] text-[#1d1d1f] focus:ring-2 focus:ring-[#007aff] transition-all outline-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-[#f5f5f7] text-[#1d1d1f] text-[16px] font-semibold rounded-2xl hover:bg-[#e8e8ed] transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onAdd({
                ...place,
                day: selectedDay,
                time: selectedTime,
              });
              onClose();
            }}
            className="flex-[1.5] py-4 bg-[#007aff] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#006bd6] transition-colors shadow-lg shadow-[#007aff]/20"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
