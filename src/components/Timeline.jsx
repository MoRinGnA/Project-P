export default function Timeline({
  schedule,
  editingId,
  editForm,
  setEditForm,
  onEditStart,
  onItemClick,
  onEditSave,
  onEditCancel,
  onDelete,
}) {
  if (schedule.length === 0) {
    return (
      <div className="timeline-wrapper">
        <div className="empty-schedule">
          등록된 일정이 없습니다. 새 일정을 추가해 보세요.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-wrapper">
      {schedule.map((item) => (
        <div key={item.id} className="timeline-item group">
          <div className="timeline-dot"></div>

          {editingId === item.id ? (
            <div className="edit-container">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) =>
                    setEditForm({ ...editForm, time: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={onEditCancel} className="btn-cancel">
                  취소
                </button>
                <button
                  onClick={() => onEditSave(item.id)}
                  className="btn-save"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="timeline-content-clickable"
                onClick={() => onItemClick(item)}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline mb-1">
                  <span className="text-sm font-semibold text-[#86868b] mr-3 w-max">
                    {item.time}
                  </span>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] mt-1 sm:mt-0 tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[#86868b] text-sm font-medium mt-1">
                  {item.location}
                </p>
              </div>

              <div className="action-group">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditStart(item);
                  }}
                  className="btn-text-blue"
                >
                  수정
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="btn-text-red"
                >
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
