export default function ScheduleForm({
  newItem,
  setNewItem,
  onAddSchedule,
  activeDay,
}) {
  return (
    <form onSubmit={onAddSchedule} className="form-container">
      <div className="input-group">
        <input
          type="time"
          value={newItem.time}
          onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="일정 제목"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="장소"
          value={newItem.location}
          onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <button type="submit" className="btn-submit">
        {activeDay}일 차 일정 추가하기
      </button>
    </form>
  );
}
