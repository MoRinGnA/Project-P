import { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import Trash from "./Trash";

export default function App() {
  const [items, setItems] = useState(["1일차", "2일차", "3일차"]);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragOver = (event) =>
    setOverId(event.over ? event.over.id : null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    if (over.id === "trash") {
      setItems((prev) => prev.filter((id) => id !== active.id));
      return;
    }

    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((id) => (
              <SortableItem
                key={id}
                id={id}
                isOverTrash={id === activeId && overId === "trash"}
              />
            ))}
          </div>
        </SortableContext>

        <Trash />

        <DragOverlay>
          {activeId ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                cursor: "grabbing",
              }}
            >
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        onClick={() => setItems((prev) => [...prev, `${prev.length + 1}일차`])}
        style={{
          backgroundColor: "black",
          color: "white",
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
          width: "100%",
          cursor: "pointer",
          border: "none",
        }}
      >
        날짜 추가
      </button>
    </div>
  );
}
