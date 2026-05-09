import { useDroppable } from "@dnd-kit/core";

export default function Trash() {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash",
  });

  const style = {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "200px",
    padding: "15px",
    backgroundColor: isOver ? "red" : "gray",
    color: "white",
    textAlign: "center",
    borderRadius: "8px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isOver ? "놓아서 삭제하기" : "쓰레기통"}
    </div>
  );
}
