import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import {
  getNewOrderKey,
  getAppendOrderKey,
  assignInitialOrderKeys,
} from "./utils";

const socket = io("http://localhost:3000");

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const roomId = pathParts[1] === "planner" ? pathParts[2] : null;

  const [isConnected, setIsConnected] = useState(socket.connected);
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
    const onConnect = () => {
      setIsConnected(true);
      if (roomId) {
        socket.emit("join_room", roomId);
      }
    };

    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected && roomId) {
      socket.emit("join_room", roomId);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [roomId]);

  useEffect(() => {
    const handleRequestSync = (targetSocketId) => {
      if (schedule.length > 0 || days.length > 3 || targetBudget !== 1000000) {
        socket.emit("send_sync_data", {
          targetSocketId,
          schedule,
          days,
          targetBudget,
        });
      }
    };

    socket.on("request_sync", handleRequestSync);

    return () => {
      socket.off("request_sync", handleRequestSync);
    };
  }, [schedule, days, targetBudget]);

  useEffect(() => {
    socket.on("schedule_updated", (newSchedule) => setSchedule(newSchedule));
    socket.on("days_updated", (newDays) => setDays(newDays));
    socket.on("budget_updated", (newBudget) => setTargetBudget(newBudget));

    socket.on("sync_data", (data) => {
      if (data.schedule) setSchedule(data.schedule);
      if (data.days) setDays(data.days);
      if (data.targetBudget) setTargetBudget(data.targetBudget);
    });

    return () => {
      socket.off("schedule_updated");
      socket.off("days_updated");
      socket.off("budget_updated");
      socket.off("sync_data");
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
        socket.emit("days_update", { roomId, newDays });
      }
      return;
    }

    if (active.id !== over.id) {
      const currentDaySchedule = schedule.filter(
        (item) => item.day === activeDay,
      );
      currentDaySchedule.sort((a, b) => {
        if (a.orderKey && b.orderKey) {
          return a.orderKey.localeCompare(b.orderKey);
        }
        return a.time > b.time ? 1 : -1;
      });

      const activeIndex = currentDaySchedule.findIndex(
        (item) => item.id === active.id,
      );
      const overIndex = currentDaySchedule.findIndex(
        (item) => item.id === over.id,
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrderKey = getNewOrderKey(
          currentDaySchedule,
          activeIndex,
          overIndex,
        );

        const updatedSchedule = schedule.map((item) =>
          item.id === active.id ? { ...item, orderKey: newOrderKey } : item,
        );

        setSchedule(updatedSchedule);
        socket.emit("schedule_update", {
          roomId,
          newSchedule: updatedSchedule,
        });
      }
    }
  };

  const handleAddScheduleFromMap = (fullData) => {
    const dayItems = schedule.filter((item) => item.day === activeDay);
    dayItems.sort((a, b) => {
      if (a.orderKey && b.orderKey) {
        return a.orderKey.localeCompare(b.orderKey);
      }
      return a.time > b.time ? 1 : -1;
    });

    const newOrderKey = getAppendOrderKey(dayItems);
    const newId = Date.now();

    const formattedData = {
      id: newId,
      day: Number(fullData.day || activeDay),
      time: fullData.time || "12:00",
      title: fullData.place_name || fullData.title || "이름 없는 장소",
      location: fullData.address_name || fullData.location || "주소 정보 없음",
      cost: Number(fullData.cost) || 0,
      orderKey: newOrderKey,
    };

    const newSchedule = [...schedule, formattedData];
    setSchedule(newSchedule);
    socket.emit("schedule_update", { roomId, newSchedule });
  };

  const activeItem = schedule.find((item) => item.id === activeId);
  const isDayDrag = activeId?.toString().startsWith("day-tab-");

  const handlePointerMove = (e) => {
    if (roomId && isConnected) {
      socket.emit("cursor_move", {
        roomId,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[
        isDayDrag ? restrictToHorizontalAxis : restrictToVerticalAxis,
      ]}
    >
      <div
        className="fixed inset-0 w-screen h-screen bg-[#fbfbfd] flex overflow-hidden font-sans text-left"
        onPointerMove={handlePointerMove}
      >
        {roomId && isConnected && (
          <CursorOverlay socket={socket} roomId={roomId} />
        )}

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
                      const scheduleWithKeys = assignInitialOrderKeys(s);

                      setDays(newDaysArray);
                      setTargetBudget(b);
                      setSchedule(scheduleWithKeys);

                      socket.emit("schedule_update", {
                        roomId,
                        newSchedule: scheduleWithKeys,
                      });
                      socket.emit("days_update", {
                        roomId,
                        newDays: newDaysArray,
                      });
                      socket.emit("budget_update", { roomId, newBudget: b });

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
                        roomId={roomId}
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

                          socket.emit("days_update", { roomId, newDays });
                          socket.emit("schedule_update", {
                            roomId,
                            newSchedule,
                          });

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
