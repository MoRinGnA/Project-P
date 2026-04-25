import { useState, useEffect } from "react";

export default function CursorOverlay({ socket }) {
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      socket.emit("cursor_move", { x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    socket.on("cursor_update", (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.id]: { x: data.x, y: data.y },
      }));
    });

    socket.on("user_disconnected", (id) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[id];
        return newCursors;
      });
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket.off("cursor_update");
      socket.off("user_disconnected");
    };
  }, [socket]);

  return (
    <>
      {Object.entries(cursors).map(([id, pos]) => (
        <div
          key={id}
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.5 3.21V20.8C5.5 21.45 6.27 21.8 6.76 21.36L11.44 17.15C11.66 16.95 11.95 16.83 12.25 16.83H19.5C20.18 16.83 20.54 16.03 20.1 15.51L5.5 3.21Z"
              fill="#FF5722"
            />
          </svg>
          <span
            style={{
              backgroundColor: "#FF5722",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "12px",
              marginLeft: "8px",
            }}
          >
            Guest
          </span>
        </div>
      ))}
    </>
  );
}
