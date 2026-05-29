export default function ShareModal({ isOpen, onClose, currentUrl }) {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert("초대 링크가 복사되었습니다.");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-sm p-6 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[19px] font-bold text-[#1d1d1f] tracking-tight">
            일정 함께 짜기
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#f5f5f7] rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e5e5ea] transition-colors text-[18px]"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={handleCopy}
            className="w-full flex flex-col items-center justify-center p-6 bg-[#f5f5f7] rounded-[18px] hover:bg-[#e5e5ea] transition-all duration-200 active:scale-[0.98]"
          >
            <div className="w-14 h-14 mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#e5e5ea]">
              <span className="text-[24px]">🔗</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">
              링크 복사하여 초대하기
            </span>
          </button>
        </div>

        <div className="p-3 bg-[#f5f5f7] rounded-[14px] flex items-center gap-3">
          <input
            type="text"
            value={currentUrl}
            readOnly
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#86868b] truncate ml-1 font-medium"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white rounded-[10px] text-[13px] font-bold text-[#007aff] hover:bg-[#f0f7ff] transition-colors whitespace-nowrap shadow-sm"
          >
            복사
          </button>
        </div>
      </div>
    </div>
  );
}
