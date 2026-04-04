import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Navigation from "./components/Navigation";
import TimelineView from "./components/TimelineView";
import MapSearchView from "./components/MapSearchView";
import AiPlannerView from "./components/AiPlannerView";
import TrashCan from "./components/TrashCan";

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
    setSchedule(schedule.filter((item) => item.id !== id));
  };

  const handleEditStart = (item) => {
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
        handleEditSave={handleEditSave}
        handleEditCancel={handleEditCancel}
        handleDelete={handleDelete}
      />
      <TrashCan />
    </div>
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-full bg-[#fbfbfd] overflow-hidden">
        <Navigation
          activeView={activeView}
          setActiveView={setActiveView}
          isSplitView={isSplitView}
          setIsSplitView={setIsSplitView}
        />

        <div className="flex-1 ml-20 transition-all duration-300 h-full">
          {isSplitView ? (
            <div className="flex w-full h-full divide-x divide-[#e5e5ea]">
              <div className="w-1/2 h-full bg-[#fbfbfd]">
                {renderTimeline()}
              </div>

              <div className="w-1/2 h-full bg-white overflow-auto">
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
            <div className="w-full h-full overflow-auto">
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
