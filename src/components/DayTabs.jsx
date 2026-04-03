import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function DraggableTab({ day, activeDay, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `day-${day}`,
    data: { day },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 50,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`btn-primary ${activeDay === day ? "btn-active" : "btn-inactive"}`}
    >
      {day}일 차
    </button>
  );
}

export default function DayTabs({ days, activeDay, setActiveDay, onAddDay }) {
  return (
    <div className="tab-container">
      {days.map((day) => (
        <DraggableTab
          key={day}
          day={day}
          activeDay={activeDay}
          onClick={() => setActiveDay(day)}
        />
      ))}
      <button onClick={onAddDay} className="btn-add-day">
        날짜 추가
      </button>
    </div>
  );
}
