import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export default function SortableItem({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    padding: "16px",
    margin: "8px 0",
    backgroundColor: "#ffffff",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    cursor: "grab",
    opacity: isDragging ? 0 : 1,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  );
}
