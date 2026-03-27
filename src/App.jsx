import { useState, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableTab({ day, activeDay, onClick }) {
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

function TrashCan() {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash-can",
  });

  return (
    <div
      ref={setNodeRef}
      className={`trash-can-base ${isOver ? "trash-can-active" : "trash-can-inactive"}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </div>
  );
}

function App() {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("project-p-schedule");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        day: 1,
        time: "09:00",
        title: "공항 도착 및 수하물 위탁",
        location: "인천국제공항 제1터미널",
      },
      {
        id: 2,
        day: 1,
        time: "11:30",
        title: "비행기 탑승 및 출발",
        location: "게이트 24번",
      },
      {
        id: 3,
        day: 2,
        time: "10:00",
        title: "유니버셜 스튜디오 재팬",
        location: "오사카",
      },
      {
        id: 4,
        day: 2,
        time: "19:00",
        title: "도톤보리 맛집 투어",
        location: "오사카 난바",
      },
      {
        id: 5,
        day: 3,
        time: "11:00",
        title: "숙소 체크아웃 및 공항 이동",
        location: "오사카 시내 호텔",
      },
    ];
  });

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem("project-p-days");
    if (saved) {
      return JSON.parse(saved);
    }
    return [1, 2, 3];
  });

  const [activeDay, setActiveDay] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    localStorage.setItem("project-p-schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("project-p-days", JSON.stringify(days));
  }, [days]);

  const [newItem, setNewItem] = useState({
    time: "",
    title: "",
    location: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    time: "",
    title: "",
    location: "",
  });

  const handleAddDay = () => {
    const nextDay = days.length > 0 ? Math.max(...days) + 1 : 1;
    setDays([...days, nextDay]);
    setActiveDay(nextDay);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && over.id === "trash-can") {
      const dayToDelete = active.data.current.day;

      const newDays = days
        .filter((d) => d !== dayToDelete)
        .map((d, index) => index + 1);

      const newSchedule = schedule
        .filter((item) => item.day !== dayToDelete)
        .map((item) => {
          if (item.day > dayToDelete) {
            return { ...item, day: item.day - 1 };
          }
          return item;
        });

      setDays(newDays);
      setSchedule(newSchedule);

      if (activeDay === dayToDelete) {
        setActiveDay(1);
      } else if (activeDay > dayToDelete) {
        setActiveDay(activeDay - 1);
      }
    }
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();

    const newId =
      schedule.length > 0
        ? Math.max(...schedule.map((item) => item.id)) + 1
        : 1;

    const newSchedule = [
      ...schedule,
      { id: newId, day: activeDay, ...newItem },
    ];

    newSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));

    setSchedule(newSchedule);
    setNewItem({ time: "", title: "", location: "" });
  };

  const handleDelete = (id) => {
    const filteredSchedule = schedule.filter((item) => item.id !== id);
    setSchedule(filteredSchedule);
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditForm({
      time: item.time,
      title: item.title,
      location: item.location,
    });
  };

  const handleEditSave = (id) => {
    const updatedSchedule = schedule.map((item) => {
      if (item.id === id) {
        return { ...item, ...editForm };
      }
      return item;
    });

    updatedSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));

    setSchedule(updatedSchedule);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const currentDaySchedule = schedule.filter((item) => item.day === activeDay);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-layout">
        <div className="max-w-3xl mx-auto">
          <h1 className="header-title">Project P</h1>

          <div className="tab-container">
            {days.map((day) => (
              <DraggableTab
                key={day}
                day={day}
                activeDay={activeDay}
                onClick={() => setActiveDay(day)}
              />
            ))}
            <button onClick={handleAddDay} className="btn-add-day">
              날짜 추가
            </button>
          </div>

          <form onSubmit={handleAddSchedule} className="form-container">
            <div className="input-group">
              <input
                type="time"
                value={newItem.time}
                onChange={(e) =>
                  setNewItem({ ...newItem, time: e.target.value })
                }
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="일정 제목"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="장소"
                value={newItem.location}
                onChange={(e) =>
                  setNewItem({ ...newItem, location: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              {activeDay}일 차 일정 추가하기
            </button>
          </form>

          <div className="timeline-wrapper">
            {currentDaySchedule.length === 0 ? (
              <div className="empty-schedule">
                등록된 일정이 없습니다. 새 일정을 추가해 보세요.
              </div>
            ) : (
              currentDaySchedule.map((item) => (
                <div key={item.id} className="timeline-item group">
                  <div className="timeline-dot"></div>

                  {editingId === item.id ? (
                    <div className="edit-container">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
                        <input
                          type="time"
                          value={editForm.time}
                          onChange={(e) =>
                            setEditForm({ ...editForm, time: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              location: e.target.value,
                            })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleEditCancel}
                          className="btn-cancel"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleEditSave(item.id)}
                          className="btn-save"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="timeline-content-clickable"
                        onClick={() => handleEditStart(item)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-baseline mb-1">
                          <span className="text-sm font-semibold text-[#86868b] mr-3 w-max">
                            {item.time}
                          </span>
                          <h3 className="text-lg font-semibold text-[#1d1d1f] mt-1 sm:mt-0 tracking-tight">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-[#86868b] text-sm font-medium mt-1">
                          {item.location}
                        </p>
                      </div>

                      <div className="action-group">
                        <button
                          onClick={() => handleEditStart(item)}
                          className="btn-text-blue"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-text-red"
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <TrashCan />
      </div>
    </DndContext>
  );
}

export default App;
