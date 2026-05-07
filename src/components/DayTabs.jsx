import React, { useState, useEffect } from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function DayTabs({
  days,
  activeDay,
  setActiveDay,
  onAddDay,
  onDeleteDay,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, day) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, day: day });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-hide py-2 relative">
      <div className="flex bg-[#eeeeef] p-1 rounded-[14px]">
        <SortableContext
          items={days.map((d) => `day-tab-${d}`)}
          strategy={horizontalListSortingStrategy}
        >
          {days.map((day) => (
            <SortableDayTab
              key={day}
              day={day}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              onContextMenu={(e) => handleContextMenu(e, day)}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={onAddDay}
        className="flex items-center justify-center min-w-[36px] h-9 bg-[#f5f5f7] text-[#86868b] rounded-full hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition-all active:scale-95"
      >
        <span className="text-xl font-light">+</span>
      </button>

      {contextMenu && (
        <div
          className="fixed z-[9999] bg-white/80 backdrop-blur-xl border border-[#d2d2d7]/30 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-1 min-w-[120px] animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              if (days.length > 1) onDeleteDay(contextMenu.day);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white rounded-[8px] transition-colors"
          >
            일차 삭제
          </button>
        </div>
      )}
    </div>
  );
}

function SortableDayTab({ day, activeDay, setActiveDay, onContextMenu }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `day-tab-${day}`,
    data: { day },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={onContextMenu}
      onClick={() => setActiveDay(day)}
      className={`px-6 py-2 rounded-[11px] transition-all duration-200 cursor-pointer select-none whitespace-nowrap min-w-max ${
        activeDay === day ? "bg-white shadow-sm" : "hover:bg-white/50"
      }`}
    >
      <span
        className={`text-[14px] font-semibold ${
          activeDay === day ? "text-[#1d1d1f]" : "text-[#86868b]"
        }`}
      >
        {day}일차
      </span>
    </div>
  );
}
