import DayTabs from "./DayTabs";
import ScheduleForm from "./ScheduleForm";
import Timeline from "./Timeline";

export default function TimelineView({
  days,
  activeDay,
  setActiveDay,
  handleAddDay,
  newItem,
  setNewItem,
  handleAddSchedule,
  currentDaySchedule,
  editingId,
  editForm,
  setEditForm,
  handleEditStart,
  handleItemClick,
  handleEditSave,
  handleEditCancel,
  handleDelete,
}) {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
      <h1 className="header-title">Project P</h1>

      <DayTabs
        days={days}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        onAddDay={handleAddDay}
      />

      <ScheduleForm
        newItem={newItem}
        setNewItem={setNewItem}
        onAddSchedule={handleAddSchedule}
        activeDay={activeDay}
      />

      <Timeline
        schedule={currentDaySchedule}
        editingId={editingId}
        editForm={editForm}
        setEditForm={setEditForm}
        onEditStart={handleEditStart}
        onItemClick={handleItemClick}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        onDelete={handleDelete}
      />
    </div>
  );
}
