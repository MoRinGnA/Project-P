import React from "react";

export default function BudgetBar({ targetBudget, currentTotal, dailyCosts }) {
  const percentage =
    targetBudget > 0 ? Math.min((currentTotal / targetBudget) * 100, 100) : 0;
  const isOverBudget = currentTotal > targetBudget;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[22px] border border-[#d2d2d7]/30 shadow-[0_8px_32px_rgba(0,0,0,0.04)] mb-8">
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[#86868b] mb-1">
            총 지출액
          </span>
          <span
            className={`text-[28px] font-bold tracking-tight ${isOverBudget ? "text-[#ff3b30]" : "text-[#007aff]"}`}
          >
            {currentTotal.toLocaleString()}원
          </span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[13px] font-semibold text-[#86868b] mb-1">
            목표 예산
          </span>
          <span className="text-[17px] font-bold text-[#1d1d1f]">
            {targetBudget.toLocaleString()}원
          </span>
        </div>
      </div>

      <div className="w-full h-[6px] bg-[#f5f5f7] rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-700 ease-in-out ${isOverBudget ? "bg-[#ff3b30]" : "bg-[#007aff]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {dailyCosts.map((data) => (
          <div
            key={data.day}
            className="flex flex-col min-w-[100px] bg-[#f5f5f7] p-3 rounded-[14px]"
          >
            <span className="text-[11px] font-bold text-[#86868b] mb-1">
              {data.day}일차
            </span>
            <span className="text-[14px] font-bold text-[#1d1d1f]">
              {data.cost.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
