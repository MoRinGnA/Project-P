import ScheduleCard from "./ScheduleCard";

export default function Timeline({
  schedule,
  editingId,
  editForm,
  setEditForm,
  onEditStart,
  onItemClick,
  onEditSave,
  onEditCancel,
  onDelete,
  onContextMenu,
}) {
  return (
    <div className="w-full mt-6">
      {schedule.map((item) => (
        <ScheduleCard
          key={item.id}
          item={item}
          isEditing={editingId === item.id}
          editForm={editForm}
          setEditForm={setEditForm}
          onEditStart={onEditStart}
          onItemClick={onItemClick}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
          onDelete={onDelete}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}
