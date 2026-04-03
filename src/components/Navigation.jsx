import "../styles/Navigation.css";

export default function Navigation({ activeView, setActiveView }) {
  return (
    <nav className="nav-container">
      <div className="group relative">
        <button
          onClick={() => setActiveView("timeline")}
          className={
            activeView === "timeline" ? "nav-btn-active" : "nav-btn-inactive"
          }
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </button>
        <div className="nav-tooltip">일정 관리</div>
      </div>

      <div className="group relative">
        <button
          onClick={() => setActiveView("map")}
          className={
            activeView === "map" ? "nav-btn-active" : "nav-btn-inactive"
          }
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>
        <div className="nav-tooltip">지도 및 장소 검색</div>
      </div>
    </nav>
  );
}
