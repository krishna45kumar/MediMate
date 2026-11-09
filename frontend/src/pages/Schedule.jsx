
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
  const [calendarFilter, setCalendarFilter] = useState("All");
const [medicineFilter, setMedicineFilter] = useState("All");
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

  if (selectedDate !== today) return;

  const medicineId = String(medicine.id);

  let latestHistory = {};

  try {
    latestHistory = JSON.parse(
      localStorage.getItem("medicineDoseHistory") || "{}"
    );
  } catch {
    latestHistory = {};
  }

  const todayDoses = (latestHistory[today] || []).map(String);

  const updatedTodayDoses = todayDoses.includes(medicineId)
    ? todayDoses.filter((id) => id !== medicineId)
    : [...todayDoses, medicineId];

  const updatedHistory = {
    ...latestHistory,
    [today]: updatedTodayDoses,
  };

  setDoseHistory(updatedHistory);

  localStorage.setItem(
    "medicineDoseHistory",
    JSON.stringify(updatedHistory)
  );

  localStorage.setItem(
    "takenDoses",
    JSON.stringify(updatedTodayDoses)
  );

  localStorage.setItem("doseTrackingDate", today);

  window.dispatchEvent(new Event("doseHistoryUpdated"));
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
    const newMonth = new Date(
      prev.getFullYear(),
      prev.getMonth() + direction,
      1
    );

    return newMonth;
  });
};

const goToToday = () => {
  const today = new Date();

  setSelectedDate(getDateString(today));
  setCalendarMonth(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  setCalendarFilter("All");
  setMedicineFilter("All");
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

// Calendar Filtered Dates
const filteredCalendarDates = calendarDates.map((date) => {
  if (!date || calendarFilter === "All") {
    return date;
  }

  const status = getCalendarDayStatus(date);

  if (calendarFilter === "Taken" && status !== "taken") {
    return null;
  }

  if (
    calendarFilter === "Partially Taken" &&
    status !== "partial"
  ) {
    return null;
  }

  if (calendarFilter === "Missed" && status !== "missed") {
    return null;
  }

  return date;
});

// Monthly Statistics
const currentYear = calendarMonth.getFullYear();
const currentMonth = String(
  calendarMonth.getMonth() + 1
).padStart(2, "0");

const monthPrefix = `${currentYear}-${currentMonth}`;

const todayString = getDateString(new Date());

const isCurrentMonth =
  calendarMonth.getFullYear() === new Date().getFullYear() &&
  calendarMonth.getMonth() === new Date().getMonth();

const daysToCount = isCurrentMonth
  ? new Date().getDate()
  : monthPrefix < todayString.slice(0, 7)
  ? new Date(currentYear, calendarMonth.getMonth() + 1, 0).getDate()
  : 0;

const monthlyExpectedDoses = medicines.length * daysToCount;

const monthlyTakenDoses = Object.entries(doseHistory)
  .filter(([date]) => date.startsWith(monthPrefix) && date <= todayString)
  .reduce((total, [date, ids]) => {
    const validIds = (ids || []).map(String);

    const validTakenCount = medicines.filter((medicine) =>
      validIds.includes(String(medicine.id))
    ).length;

    return total + validTakenCount;
  }, 0);

const todayUpcomingCount = isCurrentMonth
  ? medicines.filter(
      (medicine) => getMedicineStatus(medicine) === "Upcoming"
    ).length
  : 0;

const monthlyMissedDoses = Math.max(
  0,
  monthlyExpectedDoses - monthlyTakenDoses - todayUpcomingCount
);

const monthlyProgress =
  monthlyExpectedDoses === 0
    ? 0
    : Math.min(
        100,
        Math.round(
          (monthlyTakenDoses / monthlyExpectedDoses) * 100
        )
      );

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
  onClick={goToToday}
  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
>
  Today
</button>

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
   {/* Calendar Filters */}
<div className="flex flex-wrap gap-2 mb-5">

  {["All", "Taken", "Partially Taken", "Missed"].map(
    (filter) => (
      <button
        key={filter}
        onClick={() => setCalendarFilter(filter)}
        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
          calendarFilter === filter
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {filter}
      </button>
    )
  )}

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

   {filteredCalendarDates.map((date, index) => {

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
   

   {/* Monthly Statistics */}
<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-lg font-bold text-gray-800">
        Monthly Statistics
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        {monthName} medicine report
      </p>
    </div>

    <CalendarDays className="text-blue-600" size={25} />
  </div>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

    <div className="bg-blue-50 rounded-xl p-4">
      <p className="text-xs text-blue-600">Total Doses</p>
      <h3 className="text-2xl font-bold text-blue-700 mt-2">
        {monthlyExpectedDoses}
      </h3>
    </div>

    <div className="bg-green-50 rounded-xl p-4">
      <p className="text-xs text-green-600">Taken Doses</p>
      <h3 className="text-2xl font-bold text-green-700 mt-2">
        {monthlyTakenDoses}
      </h3>
    </div>

    <div className="bg-red-50 rounded-xl p-4">
      <p className="text-xs text-red-600">Missed Doses</p>
      <h3 className="text-2xl font-bold text-red-700 mt-2">
        {monthlyMissedDoses}
      </h3>
    </div>

    <div className="bg-purple-50 rounded-xl p-4">
      <p className="text-xs text-purple-600">Completion</p>
      <h3 className="text-2xl font-bold text-purple-700 mt-2">
        {monthlyProgress}%
      </h3>
    </div>

  </div>

  <div className="mt-5">
    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-500">Monthly Progress</span>
      <span className="font-semibold text-blue-600">
        {monthlyProgress}%
      </span>
    </div>

    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-3 bg-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${monthlyProgress}%` }}
      />
    </div>
  </div>

</div>


{/* Daily Summary Dashboard */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

  {/* Today's Progress */}
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">

    <h2 className="font-semibold text-gray-800 mb-4">
      Today's Progress
    </h2>

    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="#E5E7EB"
          strokeWidth="10"
          fill="none"
        />

        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="#2563EB"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={
            2 * Math.PI * 45 -
            (progressPercentage / 100) * (2 * Math.PI * 45)
          }
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-blue-600">
          {progressPercentage}%
        </span>
      </div>
    </div>

    <p className="text-sm text-gray-500 mt-4">
      {takenMedicines} of {totalMedicines} taken
    </p>

    <p className="text-xs text-gray-400 mt-1">
      Keep your health on track!
    </p>
  </div>

  {/* Four Summary Cards */}
  {summaryCards.map((card) => {
    const Icon = card.icon;

    return (
      <div
        key={card.title}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-xl ${card.color}`}>
            <Icon size={25} />
          </div>

          <ChevronRight className="text-gray-400" size={22} />
        </div>

        <p className="text-sm text-gray-500">
          {card.title}
        </p>

        <h2 className="text-3xl font-bold text-gray-800 mt-2">
          {card.value}
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          {card.title === "Total Medicines"
            ? "Medicines in your list"
            : card.title === "Taken"
            ? "Medicines taken"
            : card.title === "Missed"
            ? "Medicines missed"
            : "Medicines yet to be taken"}
        </p>
      </div>
    );
  })}

</div>



{/* Medicine Sections */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
  {periods.map((period) => {
    const Icon = period.icon;

    const periodMedicines = medicines
      .filter((medicine) => {
        const matchesPeriod =
          getDosePeriod(medicine.time) === period.name;

        const status = getMedicineStatus(medicine);

        const matchesStatus =
          medicineFilter === "All" ||
          status === medicineFilter;

        return matchesPeriod && matchesStatus;
      })
      .sort((a, b) =>
        (a.time || "").localeCompare(b.time || "")
      );

    const headerStyle =
      period.name === "Morning"
        ? "bg-amber-50"
        : period.name === "Afternoon"
        ? "bg-orange-50"
        : "bg-purple-50";

    return (
      <div
        key={period.name}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* Period Header */}
        <div className={`px-5 py-5 ${headerStyle}`}>
          <div className="flex items-center gap-3">
            <Icon
              className="text-blue-600 shrink-0"
              size={26}
            />

            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                {period.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {period.name === "Morning"
                  ? "5:00 AM - 12:00 PM"
                  : period.name === "Afternoon"
                  ? "12:00 PM - 5:00 PM"
                  : "5:00 PM - 5:00 AM"}
              </p>
            </div>

            <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
              {periodMedicines.length} medicines
            </span>
          </div>
        </div>

        {/* Medicine List */}
        <div className="px-5 py-2">
          {periodMedicines.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No medicines scheduled.
            </p>
          ) : (
            <div>
              {periodMedicines.map((medicine) => {
                const status = getMedicineStatus(medicine);

                return (
                  <div
                    key={medicine.id}
                    className="py-5 border-b border-gray-100 last:border-0"
                  >
                    {/* Medicine Name and Edit */}
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {medicine.name}
                      </h3>

                      <Pill
                        className="text-blue-500 shrink-0"
                        size={22}
                      />
                    </div>

                    {/* Dosage */}
                    <p className="text-sm text-gray-500 mt-1">
                      {medicine.dosage}
                    </p>

                    {/* Time */}
                    <p className="text-sm text-gray-400 mt-2">
                      Time: {medicine.time}
                    </p>

                    {/* Status and Action Button */}
                    <div className="flex items-center justify-between gap-2 mt-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
                          status === "Taken"
                            ? "bg-green-100 text-green-700"
                            : status === "Missed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {status === "Taken"
                          ? "✓ Taken"
                          : status === "Upcoming"
                          ? "● Upcoming"
                          : status}
                      </span>

                      
{selectedDate === getDateString(new Date()) && (
  <button
    type="button"
    onClick={() => markAsTaken(medicine)}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
      status === "Taken"
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
  >
    {status === "Taken" ? "↩ Undo" : "Mark as Taken"}
  </button>
)}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>




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