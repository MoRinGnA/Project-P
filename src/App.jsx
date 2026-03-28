import { useState } from "react";

function App() {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      day: 1,
      time: "09:00",
      title: "공항 도착 및 수하물 위탁",
      location: "인천국제공항 제1터미널",
    },
    {
      id: 2,
      day: 1,
      time: "11:30",
      title: "비행기 탑승 및 출발",
      location: "게이트 24번",
    },
    {
      id: 3,
      day: 2,
      time: "10:00",
      title: "유니버셜 스튜디오 재팬",
      location: "오사카",
    },
    {
      id: 4,
      day: 2,
      time: "19:00",
      title: "도톤보리 맛집 투어",
      location: "오사카 난바",
    },
    {
      id: 5,
      day: 3,
      time: "11:00",
      title: "숙소 체크아웃 및 공항 이동",
      location: "오사카 시내 호텔",
    },
  ]);

  const [days, setDays] = useState([1, 2, 3]);
  const [activeDay, setActiveDay] = useState(1);

  const [newItem, setNewItem] = useState({
    time: "",
    title: "",
    location: "",
  });

  const handleAddDay = () => {
    const nextDay = days.length + 1;
    setDays([...days, nextDay]);
    setActiveDay(nextDay);
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();

    const newId =
      schedule.length > 0
        ? Math.max(...schedule.map((item) => item.id)) + 1
        : 1;

    const newSchedule = [
      ...schedule,
      { id: newId, day: activeDay, ...newItem },
    ];

    newSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));

    setSchedule(newSchedule);
    setNewItem({ time: "", title: "", location: "" });
  };

  const handleDelete = (id) => {
    const filteredSchedule = schedule.filter((item) => item.id !== id);
    setSchedule(filteredSchedule);
  };

  const currentDaySchedule = schedule.filter((item) => item.day === activeDay);

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1d1d1f] text-center mb-12 tracking-tight">
          Project P
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`btn-primary ${activeDay === day ? "btn-active" : "btn-inactive"}`}
            >
              {day}일 차
            </button>
          ))}
          <button onClick={handleAddDay} className="btn-add-day">
            + 일차 추가
          </button>
        </div>

        <form onSubmit={handleAddSchedule} className="form-container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
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
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="장소"
              value={newItem.location}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            {activeDay}일 차 일정 추가하기
          </button>
        </form>

        <div className="relative border-l border-gray-300 ml-4 md:ml-6">
          {currentDaySchedule.length === 0 ? (
            <div className="pl-10 py-4 text-[#86868b] text-sm font-medium">
              등록된 일정이 없습니다. 새 일정을 추가해 보세요.
            </div>
          ) : (
            currentDaySchedule.map((item) => (
              <div key={item.id} className="timeline-item group">
                <div className="timeline-dot"></div>

                <div className="flex-1">
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

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-[#0071e3] hover:text-[#0077ed] text-sm font-medium px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
