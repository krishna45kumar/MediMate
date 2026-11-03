
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Pill,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDosePeriod(time) {
  const hour = Number(String(time || "00:00").split(":")[0]);

  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Night";
}

function Schedule() {
  const [medicines, setMedicines] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [doseHistory, setDoseHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("medicineDoseHistory") || "{}"
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    function loadMedicines() {
      try {
        const savedMedicines = JSON.parse(
          localStorage.getItem("medicines") || "[]"
        );
        setMedicines(savedMedicines);
      } catch {
        setMedicines([]);
      }
    }

    loadMedicines();
    window.addEventListener("focus", loadMedicines);

    return () => window.removeEventListener("focus", loadMedicines);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const today = getDateString(new Date());
      const oldDate = localStorage.getItem("doseTrackingDate");

      if (oldDate !== today || doseHistory[today]) return;

      try {
        const oldDoses = JSON.parse(
          localStorage.getItem("takenDoses") || "[]"
        );

        if (Array.isArray(oldDoses) && oldDoses.length > 0) {
          const migratedHistory = {
            ...doseHistory,
            [today]: oldDoses.map(String),
          };

          setDoseHistory(migratedHistory);
          localStorage.setItem(
            "medicineDoseHistory",
            JSON.stringify(migratedHistory)
          );
        }
      } catch (error) {
        console.error("History migration failed:", error);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [doseHistory]);

  function changeDate(days) {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + days);
    setSelectedDate(getDateString(date));
  }

  function markAsTaken(medicine) {
    const today = getDateString(new Date());

    // Sirf aaj ki date par status update hoga
    if (selectedDate !== today) return;

    const medicineId = String(medicine.id);
    const todayDoses = doseHistory[today] || [];

    if (todayDoses.includes(medicineId)) return;

    const updatedHistory = {
      ...doseHistory,
      [today]: [...todayDoses, medicineId],
    };

    setDoseHistory(updatedHistory);

    localStorage.setItem(
      "medicineDoseHistory",
      JSON.stringify(updatedHistory)
    );

    // Dashboard ke purane code ke saath compatibility
    localStorage.setItem(
      "takenDoses",
      JSON.stringify(updatedHistory[today])
    );
    localStorage.setItem("doseTrackingDate", today);
  }

  function getMedicineStatus(medicine) {
    const today = getDateString(new Date());
    const medicineId = String(medicine.id);
    const selectedDoses = (doseHistory[selectedDate] || []).map(String);

    if (selectedDoses.includes(medicineId)) {
      return "Taken";
    }

    if (selectedDate < today) {
      return "Missed";
    }

    if (selectedDate > today) {
      return "Upcoming";
    }

    const [hours, minutes] = medicine.time.split(":").map(Number);
    const medicineTime = new Date();
    medicineTime.setHours(hours, minutes, 0, 0);

    return medicineTime < new Date() ? "Missed" : "Upcoming";
  }

  const periods = [
    { name: "Morning", icon: Sun },
    { name: "Afternoon", icon: Sunset },
    { name: "Night", icon: Moon },
  ];

  // Calendar Month Navigation
const changeCalendarMonth = (direction) => {
  setCalendarMonth((prev) => {
    const newMonth = new Date(prev);
    newMonth.setMonth(newMonth.getMonth() + direction);
    return newMonth;
  });
};

// Calendar Date Status
const getCalendarDayStatus = (dateString) => {
  if (medicines.length === 0) {
    return "none";
  }

  const today = getDateString(new Date());

  if (dateString > today) {
    return "none";
  }

  const takenIds = doseHistory[dateString] || [];

  const takenCount = medicines.filter((medicine) =>
    takenIds.some(
      (id) => String(id) === String(medicine.id)
    )
  ).length;

  if (takenCount === medicines.length) {
    return "taken";
  }

  if (takenCount > 0) {
    return "partial";
  }

  if (dateString < today) {
    return "missed";
  }

  return "none";
};

// Calendar Dates
const getCalendarDates = () => {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dates = [];

  for (let i = 0; i < firstDay; i++) {
    dates.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    dates.push(
      getDateString(new Date(year, month, day))
    );
  }

  return dates;
};

const calendarDates = getCalendarDates();

const monthName = calendarMonth.toLocaleDateString("en-IN", {
  month: "long",
  year: "numeric",
});

    // Daily Summary Calculation
  const totalMedicines = medicines.length;

  const takenMedicines = medicines.filter(
    (medicine) => getMedicineStatus(medicine) === "Taken"
  ).length;

  const missedMedicines = medicines.filter(
    (medicine) => getMedicineStatus(medicine) === "Missed"
  ).length;

  const upcomingMedicines = medicines.filter(
    (medicine) => getMedicineStatus(medicine) === "Upcoming"
  ).length;

  const progressPercentage =
    totalMedicines === 0
      ? 0
      : Math.round((takenMedicines / totalMedicines) * 100);

  const summaryCards = [
    {
      title: "Total Medicines",
      value: totalMedicines,
      icon: Pill,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Taken",
      value: takenMedicines,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Missed",
      value: missedMedicines,
      icon: Clock,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Upcoming",
      value: upcomingMedicines,
      icon: CalendarDays,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];


  const dateLabel = new Date(
    selectedDate + "T00:00:00"
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Medicine Schedule
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your daily medicine routine.
        </p>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="text-center">
          <CalendarDays className="mx-auto text-blue-600 mb-2" />
          <p className="font-semibold text-gray-800">{dateLabel}</p>

          {selectedDate === getDateString(new Date()) && (
            <span className="text-sm text-blue-600">Today</span>
          )}
        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={22} />
        </button>
      </div>
     


{/* Calendar View */}
<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

  {/* Calendar Header */}
  <div className="flex items-center justify-between mb-6">

    <div>
      <h2 className="text-lg font-bold text-gray-800">
        Calendar View
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Track your medicine history
      </p>
    </div>

    <div className="flex items-center gap-3">

      <button
        onClick={() => changeCalendarMonth(-1)}
        className="p-2 rounded-lg hover:bg-gray-100"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="font-semibold text-gray-800 min-w-28 text-center">
        {monthName}
      </span>

      <button
        onClick={() => changeCalendarMonth(1)}
        className="p-2 rounded-lg hover:bg-gray-100"
        disabled={
          calendarMonth.getFullYear() === new Date().getFullYear() &&
          calendarMonth.getMonth() === new Date().getMonth()
        }
      >
        <ChevronRight size={20} />
      </button>

    </div>
  </div>

  {/* Week Days */}
  <div className="grid grid-cols-7 gap-2 mb-3">

    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day) => (
        <div
          key={day}
          className="text-center text-xs font-semibold text-gray-500"
        >
          {day}
        </div>
      )
    )}

  </div>

  {/* Calendar Dates */}
  <div className="grid grid-cols-7 gap-2">

    {calendarDates.map((date, index) => {

      if (!date) {
        return <div key={`empty-${index}`} />;
      }

      const dayNumber = Number(date.split("-")[2]);
      const status = getCalendarDayStatus(date);
      const isSelected = date === selectedDate;
      const isToday = date === getDateString(new Date());

      return (
        <button
          key={date}
          onClick={() => setSelectedDate(date)}
          className={`relative min-h-12 sm:min-h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition
            ${
              isSelected
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50 text-gray-700"
            }
            ${
              isToday && !isSelected
                ? "border-2 border-blue-500"
                : ""
            }
          `}
        >

          <span className="text-sm font-semibold">
            {dayNumber}
          </span>

          <span
            className={`w-2 h-2 rounded-full
              ${
                status === "taken"
                  ? "bg-green-500"
                  : status === "partial"
                  ? "bg-yellow-400"
                  : status === "missed"
                  ? "bg-red-500"
                  : "bg-transparent"
              }
            `}
          />

        </button>
      );
    })}

  </div>

  {/* Calendar Legend */}
  <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
      Taken
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
      Partially Taken
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
      Missed
    </div>

  </div>

</div>


           {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </h2>
                </div>

                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">
            Daily Progress
          </h2>

          <span className="font-bold text-blue-600">
            {progressPercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {takenMedicines} out of {totalMedicines} medicines completed
        </p>
      </div>


      {/* Medicine Sections */}
      {periods.map((period) => {
        const Icon = period.icon;

        const periodMedicines = medicines
          .filter(
            (medicine) => getDosePeriod(medicine.time) === period.name
          )
          .sort((a, b) => a.time.localeCompare(b.time));

        return (
          <div
            key={period.name}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="text-blue-600" size={22} />
              </div>

              <h2 className="font-semibold text-lg text-gray-800">
                {period.name}
              </h2>

              <span className="text-sm text-gray-400">
                ({periodMedicines.length} medicines)
              </span>
            </div>

            {periodMedicines.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No medicines scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {periodMedicines.map((medicine) => {
                  const status = getMedicineStatus(medicine);

                  return (
                    <div
                      key={medicine.id}
                      className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <Pill className="text-blue-600" size={22} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {medicine.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {medicine.dosage}
                          </p>

                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Clock size={14} />
                            {medicine.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            status === "Taken"
                              ? "bg-green-100 text-green-700"
                              : status === "Missed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {status}
                        </span>

                        {status !== "Taken" &&
                          selectedDate === getDateString(new Date()) && (
                            <button
                              onClick={() => markAsTaken(medicine)}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                            >
                              Mark as Taken
                            </button>
                          )}

                        {status === "Taken" && (
                          <CheckCircle2
                            className="text-green-600"
                            size={22}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {medicines.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <Pill className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-gray-700">
            No Medicines Found
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Add medicines from the Medicines page to see your schedule.
          </p>
        </div>
      )}
    </div>
  );
}

export default Schedule;
