import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import Trash from "./Trash";

export default function App() {
  const [items, setItems] = useState(["1일차", "2일차", "3일차"]);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (over.id === "trash") {
      setItems((items) => items.filter((item) => item !== active.id));
      return;
    }
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddDate = () => {
    const nextDay = items.length + 1;
    setItems([...items, `${nextDay}일차`]);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </SortableContext>

        <Trash />
      </DndContext>

      <button
        onClick={handleAddDate}
        style={{
          backgroundColor: "black",
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
        }}
      >
        날짜 추가
      </button>
    </div>
  );
}
