import React from "react";

export default function ScheduleForm({ newItem, setNewItem, onAddSchedule }) {
  return (
    <form
      onSubmit={onAddSchedule}
      className="bg-white/80 backdrop-blur-md p-5 rounded-[20px] border border-[#d2d2d7]/30 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-8 flex gap-3 items-center"
    >
      <input
        type="time"
        value={newItem.time}
        onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
        className="bg-[#f5f5f7] border-none rounded-[10px] px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#007aff] transition-all"
        required
      />
      <input
        type="text"
        placeholder="장소"
        value={newItem.title}
        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        className="flex-1 bg-[#f5f5f7] border-none rounded-[10px] px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#007aff] transition-all"
        required
      />
      <input
        type="number"
        placeholder="비용(원)"
        value={newItem.cost}
        onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
        className="w-32 bg-[#f5f5f7] border-none rounded-[10px] px-4 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#007aff] transition-all text-right"
      />
      <button
        type="submit"
        className="bg-[#007aff] text-white px-6 py-2 rounded-[12px] text-[15px] font-bold hover:bg-[#0071e3] transition-colors active:scale-95"
      >
        추가
      </button>
    </form>
  );
}
