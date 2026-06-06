import { useState, useEffect } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DayTabs from "./DayTabs";
import ScheduleForm from "./ScheduleForm";
import Timeline from "./Timeline";
import BudgetBar from "./BudgetBar";
import { getAppendOrderKey } from "../utils";

export default function TimelineView({
  roomId,
  days,
  setDays,
  activeDay,
  setActiveDay,
  schedule,
  setSchedule,
  socket,
  targetBudget,
  onDeleteDay,
  onItemClick,
}) {
  const [newItem, setNewItem] = useState({
    time: "12:00",
    title: "",
    location: "",
    cost: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    time: "",
    title: "",
    location: "",
    cost: "",
  });
  const [itemMenu, setItemMenu] = useState(null);

  const currentDaySchedule = schedule.filter((item) => item.day === activeDay);
  currentDaySchedule.sort((a, b) => {
    if (a.orderKey && b.orderKey) {
      return a.orderKey.localeCompare(b.orderKey);
    }
    return a.time > b.time ? 1 : -1;
  });

  const totalCost = schedule.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0,
  );
  const dailyCosts = days.map((d) => ({
    day: d,
    cost: schedule
      .filter((item) => item.day === d)
      .reduce((sum, item) => sum + (Number(item.cost) || 0), 0),
  }));

  useEffect(() => {
    const closeMenu = () => setItemMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    setItemMenu({ x: e.pageX, y: e.pageY, item });
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const newOrderKey = getAppendOrderKey(currentDaySchedule);
    const newSchedule = [
      ...schedule,
      { id: Date.now(), day: activeDay, orderKey: newOrderKey, ...newItem },
    ];
    setSchedule(newSchedule);
    socket.emit("schedule_update", { roomId, newSchedule });
    setNewItem({ time: "12:00", title: "", location: "", cost: "" });
  };

  return (
    <div className="relative max-w-3xl mx-auto py-12 px-6 h-full overflow-y-auto scrollbar-hide bg-[#fbfbfd]">
      <header className="mb-8">
        <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight mb-6 text-left">
          나의 여정
        </h1>
        <BudgetBar
          targetBudget={targetBudget}
          currentTotal={totalCost}
          dailyCosts={dailyCosts}
        />
      </header>

      <DayTabs
        days={days}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        onDeleteDay={onDeleteDay}
        onAddDay={() => {
          const next = days.length > 0 ? Math.max(...days) + 1 : 1;
          const newDays = [...days, next];
          setDays(newDays);
          socket.emit("days_update", { roomId, newDays });
          setActiveDay(next);
        }}
      />

      <ScheduleForm
        newItem={newItem}
        setNewItem={setNewItem}
        onAddSchedule={handleAddSchedule}
        activeDay={activeDay}
      />

      <SortableContext
        items={currentDaySchedule.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Timeline
          schedule={currentDaySchedule}
          editingId={editingId}
          editForm={editForm}
          setEditForm={setEditForm}
          onEditStart={(item) => {
            setEditingId(item.id);
            setEditForm({
              time: item.time,
              title: item.title,
              location: item.location,
              cost: item.cost || "",
            });
          }}
          onItemClick={onItemClick}
          onEditSave={(id) => {
            const updated = schedule.map((item) =>
              item.id === id ? { ...item, ...editForm } : item,
            );
            setSchedule(updated);
            socket.emit("schedule_update", { roomId, newSchedule: updated });
            setEditingId(null);
          }}
          onEditCancel={() => setEditingId(null)}
          onDelete={(id) => {
            const updated = schedule.filter((item) => item.id !== id);
            setSchedule(updated);
            socket.emit("schedule_update", { roomId, newSchedule: updated });
          }}
          onContextMenu={handleItemContextMenu}
        />
      </SortableContext>

      {itemMenu && (
        <div
          className="fixed z-[9999] bg-white/80 backdrop-blur-xl border border-[#d2d2d7]/30 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-1 min-w-[140px] animate-in fade-in zoom-in duration-100"
          style={{ top: itemMenu.y, left: itemMenu.x }}
        >
          <button
            onClick={() => {
              setEditingId(itemMenu.item.id);
              setEditForm({
                time: itemMenu.item.time,
                title: itemMenu.item.title,
                location: itemMenu.item.location,
                cost: itemMenu.item.cost || "",
              });
              setItemMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#007aff] hover:text-white rounded-[8px] transition-colors"
          >
            편집
          </button>
          <button
            onClick={() => {
              const updated = schedule.filter(
                (item) => item.id !== itemMenu.item.id,
              );
              setSchedule(updated);
              socket.emit("schedule_update", { roomId, newSchedule: updated });
              setItemMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white rounded-[8px] transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
