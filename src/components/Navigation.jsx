import { useState } from "react";
import ShareModal from "./ShareModal";

export default function Navigation({
  activeView,
  setActiveView,
  isSplitView,
  setIsSplitView,
}) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const currentUrl = window.location.href;

  return (
    <>
      <nav className="fixed left-0 top-0 h-full w-20 bg-white/90 backdrop-blur-md border-r border-[#e5e5ea] flex flex-col items-center py-8 z-40 justify-between">
        <div className="flex flex-col items-center w-full">
          <div
            onClick={() => setActiveView("ai")}
            className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeView === "ai" && !isSplitView
                ? "bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]"
                : activeView === "ai" && isSplitView
                  ? "bg-[#f0f7ff] text-[#007aff]"
                  : "text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            } active:scale-[0.95]`}
            title="AI 자동 일정"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>

          <div
            onClick={() => setActiveView("timeline")}
            className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeView === "timeline" && !isSplitView
                ? "bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]"
                : "text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            } active:scale-[0.95]`}
            title="전체 타임라인"
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>

          <div
            onClick={() => setActiveView("map")}
            className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
              activeView === "map" && !isSplitView
                ? "bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]"
                : activeView === "map" && isSplitView
                  ? "bg-[#f0f7ff] text-[#007aff]"
                  : "text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            } active:scale-[0.95]`}
            title="지도 및 검색"
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
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <div
            onClick={() => setIsShareModalOpen(true)}
            className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center cursor-pointer transition-all duration-200 text-[#007aff] bg-[#f0f7ff] hover:bg-[#e1f0ff] active:scale-[0.95]"
            title="일정 초대하기"
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <div className="w-8 h-px bg-[#e5e5ea] mb-5"></div>

          <div
            onClick={() => setIsSplitView(!isSplitView)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isSplitView
                ? "bg-[#1d1d1f] text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                : "text-[#86868b] bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            } active:scale-[0.95]`}
            title="화면 분할 모드"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
        </div>
      </nav>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentUrl={currentUrl}
      />
    </>
  );
}
