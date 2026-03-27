import { useState } from "react";

function App() {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      time: "09:00",
      title: "공항 도착 및 수하물 위탁",
      location: "인천국제공항 제1터미널",
    },
    {
      id: 2,
      time: "11:30",
      title: "비행기 탑승 및 출발",
      location: "게이트 24번",
    },
    {
      id: 3,
      time: "15:00",
      title: "현지 공항 도착",
      location: "간사이 국제공항",
    },
    {
      id: 4,
      time: "17:00",
      title: "숙소 체크인",
      location: "오사카 시내 호텔",
    },
  ]);

  const [newItem, setNewItem] = useState({
    time: "",
    title: "",
    location: "",
  });

  const handleAddSchedule = (e) => {
    e.preventDefault();

    const newId =
      schedule.length > 0
        ? Math.max(...schedule.map((item) => item.id)) + 1
        : 1;

    const newSchedule = [...schedule, { id: newId, ...newItem }];

    newSchedule.sort((a, b) => (a.time > b.time ? 1 : -1));

    setSchedule(newSchedule);
    setNewItem({ time: "", title: "", location: "" });
  };

  const handleDelete = (id) => {
    const filteredSchedule = schedule.filter((item) => item.id !== id);
    setSchedule(filteredSchedule);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-10">
          여행 일정 타임라인
        </h1>

        <form
          onSubmit={handleAddSchedule}
          className="mb-10 bg-white p-6 rounded-lg shadow-md"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="time"
              value={newItem.time}
              onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
              className="border border-gray-300 rounded-md p-2"
            />
            <input
              type="text"
              placeholder="일정 제목"
              value={newItem.title}
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
              className="border border-gray-300 rounded-md p-2"
            />
            <input
              type="text"
              placeholder="장소"
              value={newItem.location}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            일정 추가하기
          </button>
        </form>

        <div className="relative border-l-4 border-blue-500 ml-4 md:ml-6">
          {schedule.map((item) => (
            <div
              key={item.id}
              className="mb-10 pl-8 relative flex justify-between items-start"
            >
              <div>
                <div className="absolute w-6 h-6 bg-blue-500 rounded-full -left-[15px] top-1 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:items-center mb-1">
                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mr-3 w-max">
                    {item.time}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 sm:mt-0">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 mt-2 font-medium">
                  {item.location}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 mt-1 sm:mt-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
