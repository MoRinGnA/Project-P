import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useMatch } from "react-router-dom";
import { io } from "socket.io-client";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";

import Navigation from "./components/Navigation";
import TimelineView from "./components/TimelineView";
import MapSearchView from "./components/MapSearchView";
import AiPlannerView from "./components/AiPlannerView";
import CursorOverlay from "./components/CursorOverlay";
import ScheduleCard from "./components/ScheduleCard";

const socket = io("http://localhost:3000");

function App() {
  const navigate = useNavigate();
  const match = useMatch("/planner/:roomId");
  const roomId = match?.params?.roomId;

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("project-p-schedule");
    return saved ? JSON.parse(saved) : [];
  });
  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem("project-p-days");
    return saved ? JSON.parse(saved) : [1, 2, 3];
  });
  const [targetBudget, setTargetBudget] = useState(() => {
    const saved = localStorage.getItem("project-p-budget");
    return saved ? Number(saved) : 1000000;
  });

  const [activeId, setActiveId] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [activeView, setActiveView] = useState("timeline");
  const [isSplitView, setIsSplitView] = useState(false);
  const [mapSearchState, setMapSearchState] = useState({
    query: "",
    timestamp: 0,
    fromClick: false,
  });
  const [mapProvider, setMapProvider] = useState("google");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );

  useEffect(() => {
    if (roomId) {
      socket.emit("join_room", roomId);
    }
  }, [roomId]);

  useEffect(() => {
    socket.on("schedule_updated", (newSchedule) => setSchedule(newSchedule));
    socket.on("days_updated", (newDays) => setDays(newDays));
    return () => {
      socket.off("schedule_updated");
      socket.off("days_updated");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("project-p-schedule", JSON.stringify(schedule));
    localStorage.setItem("project-p-days", JSON.stringify(days));
    localStorage.setItem("project-p-budget", targetBudget.toString());
  }, [schedule, days, targetBudget]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    if (active.id.toString().startsWith("day-tab-")) {
      if (active.id !== over.id) {
        const oldIndex = days.indexOf(active.data.current.day);
        const newIndex = days.indexOf(over.data.current.day);
        const newDays = arrayMove(days, oldIndex, newIndex);
        setDays(newDays);
        socket.emit("days_update", newDays);
      }
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = schedule.findIndex((item) => item.id === active.id);
      const newIndex = schedule.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(schedule, oldIndex, newIndex);
        const currentDay = reordered[newIndex].day;
        const dayItems = reordered.filter((item) => item.day === currentDay);
        const sortedTimes = dayItems.map((item) => item.time).sort();

        const finalSchedule = reordered.map((item) => {
          if (item.day === currentDay) {
            const timeIndex = dayItems.findIndex(
              (dayItem) => dayItem.id === item.id,
            );
            return { ...item, time: sortedTimes[timeIndex] };
          }
          return item;
        });

        setSchedule(finalSchedule);
        socket.emit("schedule_update", finalSchedule);
      }
    }
  };

  const handleAddScheduleFromMap = (fullData) => {
    const newId = Date.now();
    const formattedData = {
      id: newId,
      day: Number(fullData.day || activeDay),
      time: fullData.time || "12:00",
      title: fullData.place_name || fullData.title || "이름 없는 장소",
      location: fullData.address_name || fullData.location || "주소 정보 없음",
      cost: Number(fullData.cost) || 0,
    };

    const newSchedule = [...schedule, formattedData];
    newSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));
    setSchedule(newSchedule);
    socket.emit("schedule_update", newSchedule);
  };

  const activeItem = schedule.find((item) => item.id === activeId);
  const isDayDrag = activeId?.toString().startsWith("day-tab-");

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[
        isDayDrag ? restrictToHorizontalAxis : restrictToVerticalAxis,
      ]}
    >
      <div className="fixed inset-0 w-screen h-screen bg-[#fbfbfd] flex overflow-hidden font-sans text-left">
        {roomId && <CursorOverlay socket={socket} roomId={roomId} />}

        {roomId && (
          <Navigation
            activeView={activeView}
            setActiveView={(view) => {
              if (view === "ai") {
                if (
                  window.confirm(
                    "현재 화면을 벗어나시겠습니까? 기존에 작성하던 내용이 모두 사라집니다!",
                  )
                ) {
                  setActiveView("timeline");
                  navigate("/");
                }
              } else {
                setActiveView(view);
              }
            }}
            isSplitView={isSplitView}
            setIsSplitView={setIsSplitView}
          />
        )}

        <div
          className={`flex-1 ${roomId ? "ml-20" : "ml-0"} h-full relative overflow-hidden`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <div className="w-full h-full bg-white overflow-y-auto">
                  <AiPlannerView
                    onGenerateSchedule={(s, d, type, b) => {
                      const newDaysArray = Array.from(
                        { length: d },
                        (_, i) => i + 1,
                      );
                      setDays(newDaysArray);
                      setTargetBudget(b);
                      setSchedule(s);
                      socket.emit("schedule_update", s);
                      socket.emit("days_update", newDaysArray);
                      setActiveDay(1);
                      setActiveView("timeline");
                    }}
                  />
                </div>
              }
            />

            <Route
              path="/planner/:roomId"
              element={
                <div
                  className={`flex w-full h-full ${
                    isSplitView ? "divide-x divide-[#e5e5ea]" : ""
                  }`}
                >
                  {(activeView === "timeline" || isSplitView) && (
                    <div
                      className={`${
                        isSplitView ? "w-1/2" : "w-full"
                      } h-full overflow-y-auto scrollbar-hide text-left`}
                    >
                      <TimelineView
                        days={days}
                        setDays={setDays}
                        activeDay={activeDay}
                        setActiveDay={setActiveDay}
                        schedule={schedule}
                        setSchedule={setSchedule}
                        socket={socket}
                        targetBudget={targetBudget}
                        onDeleteDay={(d) => {
                          const newDays = days
                            .filter((v) => v !== d)
                            .map((_, i) => i + 1);
                          const newSchedule = schedule
                            .filter((s) => s.day !== d)
                            .map((s) =>
                              s.day > d ? { ...s, day: s.day - 1 } : s,
                            );
                          setDays(newDays);
                          setSchedule(newSchedule);
                          socket.emit("days_update", newDays);
                          socket.emit("schedule_update", newSchedule);
                          if (activeDay === d) setActiveDay(1);
                          else if (activeDay > d) setActiveDay(activeDay - 1);
                        }}
                        onItemClick={(item) => {
                          setMapSearchState({
                            query: item.title,
                            timestamp: Date.now(),
                            fromClick: true,
                          });
                          if (!isSplitView) setActiveView("map");
                        }}
                      />
                    </div>
                  )}

                  {(activeView === "map" || isSplitView) && (
                    <div
                      className={`${
                        isSplitView ? "w-1/2" : "w-full"
                      } h-full bg-white overflow-y-auto`}
                    >
                      <MapSearchView
                        mapSearchState={mapSearchState}
                        mapProvider={mapProvider}
                        setMapProvider={setMapProvider}
                        days={days}
                        activeDay={activeDay}
                        onAddPlace={handleAddScheduleFromMap}
                      />
                    </div>
                  )}
                </div>
              }
            />
          </Routes>
        </div>
      </div>

      <DragOverlay>
        {isDayDrag ? (
          <div className="px-6 py-2 bg-white text-[#1d1d1f] font-semibold rounded-[11px] shadow-lg border border-[#d2d2d7]/30 scale-105 whitespace-nowrap min-w-max flex items-center justify-center">
            {activeId.replace("day-tab-", "")}일차
          </div>
        ) : activeItem ? (
          <ScheduleCard item={activeItem} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
