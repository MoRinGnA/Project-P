import { useDroppable } from "@dnd-kit/core";

export default function TrashCan() {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash-can",
  });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border transition-all duration-300 z-40 ${
        isOver
          ? "bg-red-500 border-red-500 text-white scale-110 shadow-red-500/30"
          : "bg-white/70 border-gray-200 text-gray-500 scale-100"
      }`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </div>
  );
}
