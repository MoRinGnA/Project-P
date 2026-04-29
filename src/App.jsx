import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import Navigation from "./components/Navigation";
import TimelineView from "./components/TimelineView";
import MapSearchView from "./components/MapSearchView";
import AiPlannerView from "./components/AiPlannerView";
import TrashCan from "./components/TrashCan";
import CursorOverlay from "./components/CursorOverlay";

const socket = io("http://localhost:3000");

function App() {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("project-p-schedule");
    return saved ? JSON.parse(saved) : [];
  });

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem("project-p-days");
    return saved ? JSON.parse(saved) : [1, 2, 3];
  });

  const [activeDay, setActiveDay] = useState(1);
  const [activeView, setActiveView] = useState("ai");
  const [isSplitView, setIsSplitView] = useState(false);
  const [mapSearchState, setMapSearchState] = useState({
    query: "",
    timestamp: 0,
    fromClick: false,
  });
  const [mapProvider, setMapProvider] = useState("google");

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    socket.on("connect_error", (err) => {});

    socket.on("schedule_updated", (newSchedule) => {
      setSchedule(newSchedule);
    });

    socket.on("days_updated", (newDays) => {
      setDays(newDays);
    });

    return () => {
      socket.off("connect_error");
      socket.off("schedule_updated");
      socket.off("days_updated");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("project-p-schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("project-p-days", JSON.stringify(days));
  }, [days]);

  const handleAddDay = () => {
    const nextDay = days.length > 0 ? Math.max(...days) + 1 : 1;
    const newDays = [...days, nextDay];
    setDays(newDays);
    socket.emit("days_update", newDays);
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
      socket.emit("schedule_update", newSchedule);
      socket.emit("days_update", newDays);

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
    socket.emit("schedule_update", newSchedule);
    setNewItem({ time: "", title: "", location: "" });
  };

  const handleDelete = (id) => {
    const newSchedule = schedule.filter((item) => item.id !== id);
    setSchedule(newSchedule);
    socket.emit("schedule_update", newSchedule);
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditForm({
      time: item.time,
      title: item.title,
      location: item.location,
    });
  };

  const handleItemClick = (item) => {
    setMapSearchState({
      query: item.title,
      timestamp: Date.now(),
      fromClick: true,
    });

    if (!isSplitView) {
      setActiveView("map");
    }
  };

  const handleEditSave = (id) => {
    const updatedSchedule = schedule.map((item) => {
      if (item.id === id) return { ...item, ...editForm };
      return item;
    });
    updatedSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));
    setSchedule(updatedSchedule);
    socket.emit("schedule_update", updatedSchedule);
    setEditingId(null);
  };

  const handleEditCancel = () => setEditingId(null);

  const handleAddFromMap = (place) => {
    const newId =
      schedule.length > 0
        ? Math.max(...schedule.map((item) => item.id)) + 1
        : 1;
    const newSchedule = [
      ...schedule,
      {
        id: newId,
        day: activeDay,
        time: "12:00",
        title: place.place_name,
        location: place.address_name,
      },
    ];
    newSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));
    setSchedule(newSchedule);
    socket.emit("schedule_update", newSchedule);

    if (!isSplitView) {
      setActiveView("timeline");
    }
  };

  const handleGenerateFromAI = (
    generatedSchedule,
    totalDays,
    recommendedProvider,
  ) => {
    const newDaysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    setDays(newDaysArray);
    socket.emit("days_update", newDaysArray);
    setMapProvider(recommendedProvider);

    let currentMaxId =
      schedule.length > 0 ? Math.max(...schedule.map((item) => item.id)) : 0;

    const newScheduleWithIds = generatedSchedule.map((item) => {
      currentMaxId += 1;
      return {
        id: currentMaxId,
        day: item.day,
        time: item.time,
        title: item.title,
        location: item.location,
      };
    });

    setSchedule(newScheduleWithIds);
    socket.emit("schedule_update", newScheduleWithIds);
    setActiveDay(1);

    if (!isSplitView) {
      setActiveView("timeline");
    }
  };

  const currentDaySchedule = schedule.filter((item) => item.day === activeDay);

  const renderTimeline = () => (
    <div className="relative w-full h-full overflow-hidden">
      <TimelineView
        days={days}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        handleAddDay={handleAddDay}
        newItem={newItem}
        setNewItem={setNewItem}
        handleAddSchedule={handleAddSchedule}
        currentDaySchedule={currentDaySchedule}
        editingId={editingId}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditStart={handleEditStart}
        handleItemClick={handleItemClick}
        handleEditSave={handleEditSave}
        handleEditCancel={handleEditCancel}
        handleDelete={handleDelete}
      />
      <TrashCan />
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      autoScroll={false}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="fixed inset-0 w-screen h-screen bg-[#fbfbfd] flex overflow-hidden">
        <CursorOverlay socket={socket} />

        <Navigation
          activeView={activeView}
          setActiveView={setActiveView}
          isSplitView={isSplitView}
          setIsSplitView={setIsSplitView}
        />

        <div className="flex-1 ml-20 transition-all duration-300 h-full overflow-hidden relative">
          {isSplitView ? (
            <div className="flex w-full h-full divide-x divide-[#e5e5ea] overflow-hidden">
              <div className="w-1/2 h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                {renderTimeline()}
              </div>

              <div className="w-1/2 h-full bg-white overflow-y-auto overflow-x-hidden">
                {activeView === "ai" || activeView === "timeline" ? (
                  <AiPlannerView onGenerateSchedule={handleGenerateFromAI} />
                ) : (
                  <MapSearchView
                    onAddPlace={handleAddFromMap}
                    mapSearchState={mapSearchState}
                    mapProvider={mapProvider}
                    setMapProvider={setMapProvider}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
              {activeView === "timeline" ? (
                renderTimeline()
              ) : activeView === "ai" ? (
                <AiPlannerView onGenerateSchedule={handleGenerateFromAI} />
              ) : (
                <MapSearchView
                  onAddPlace={handleAddFromMap}
                  mapSearchState={mapSearchState}
                  mapProvider={mapProvider}
                  setMapProvider={setMapProvider}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default App;
