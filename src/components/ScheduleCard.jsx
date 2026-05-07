import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ScheduleCard({
  item,
  isEditing,
  editForm,
  setEditForm,
  onEditStart,
  onItemClick,
  onEditSave,
  onEditCancel,
  onDelete,
  onContextMenu,
  isOverlay,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const overlayStyle = {
    zIndex: 9999,
    cursor: "grabbing",
    transform: "scale(1.02)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  };

  const combinedStyle = isOverlay ? { ...overlayStyle } : style;

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      onContextMenu={(e) => onContextMenu(e, item)}
      className={`group flex items-center justify-between p-5 mb-4 bg-white/90 backdrop-blur-md border border-[#d2d2d7]/30 rounded-[18px] transition-shadow ${
        isOverlay
          ? ""
          : "hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
      }`}
    >
      {isEditing ? (
        <div className="flex-1 flex gap-3 items-center">
          <input
            type="time"
            value={editForm.time}
            onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
            className="bg-[#f5f5f7] border-none rounded-[8px] p-2 text-[14px] outline-none"
          />
          <input
            type="text"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            className="flex-1 bg-[#f5f5f7] border-none rounded-[8px] p-2 text-[14px] outline-none"
          />
          <input
            type="number"
            value={editForm.cost}
            onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
            className="w-24 bg-[#f5f5f7] border-none rounded-[8px] p-2 text-[14px] outline-none text-right"
          />
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onEditSave(item.id)}
              className="text-[#007aff] font-semibold text-[14px] px-2"
            >
              저장
            </button>
            <button
              onClick={onEditCancel}
              className="text-[#86868b] text-[14px] px-2"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onClick={() => !isOverlay && onItemClick(item)}
            className="flex-1 cursor-pointer flex items-center justify-between mr-4"
          >
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[17px] font-bold text-[#1d1d1f]">
                  {item.title}
                </span>
                <span className="text-[13px] font-medium text-[#007aff] bg-[#007aff]/10 px-2 py-0.5 rounded-full">
                  {item.time}
                </span>
              </div>
              <span className="text-[13px] text-[#86868b] font-medium">
                {item.location}
              </span>
            </div>
            <div className="text-[16px] font-semibold text-[#1d1d1f] min-w-[80px] text-right">
              {Number(item.cost || 0).toLocaleString()}원
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-[#d2d2d7]/50 pl-4">
            <button
              {...attributes}
              {...listeners}
              className={`text-[#d2d2d7] hover:text-[#86868b] text-xl outline-none touch-none ${isOverlay ? "cursor-grabbing" : "cursor-grab"}`}
            >
              ☰
            </button>
          </div>
        </>
      )}
    </div>
  );
}
