import { useState, useEffect } from "react";
import {
  Pill,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sun,
  Sunset,
  Moon,
  ArrowRight,
} from "lucide-react";

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getDosePeriod(time) {
  if (!time) return "Other";

  const value = String(time).trim().toLowerCase();

  // Agar time Morning, Afternoon ya Night format mein hai
  if (value.includes("morning")) return "Morning";
  if (value.includes("afternoon")) return "Afternoon";
  if (value.includes("night") || value.includes("evening")) {
    return "Night";
  }

  // Agar time 08:00 AM ya 02:00 PM format mein hai
  const match = value.match(
    /^(\d{1,2})(?::\d{2})?\s*(am|pm)?$/
  );

  if (!match) return "Other";

  let hour = Number(match[1]);
  const meridiem = match[2];

  if (meridiem === "am" && hour === 12) hour = 0;
  if (meridiem === "pm" && hour !== 12) hour += 12;

  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 || hour < 5) return "Night";

  return "Other";
}


function WeeklyChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">
        {data.fullDate}
      </p>

      <p className="text-sm text-blue-600">
        Completed: {data.completed}
      </p>

      <p className="text-sm text-slate-500">
        Total Scheduled: {data.total}
      </p>

      <p className="mt-2 font-semibold text-green-600">
        Adherence: {data.percentage}%
      </p>
    </div>
  );
}

function Dashboard() {

  const [medicines, setMedicines] = useState([]);
const [todayDate, setTodayDate] = useState(getTodayDate);


// Search medicine
const [searchTerm, setSearchTerm] = useState("");

// Filter medicine by status
const [statusFilter, setStatusFilter] = useState("All");

// Weekly medicine history
const [weeklyHistory, setWeeklyHistory] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("weeklyMedicineHistory") || "{}"
    );
  } catch (error) {
    return {};
  }
});

const [takenDoses, setTakenDoses] = useState(() => {
  try {
    const savedDate = localStorage.getItem("doseTrackingDate");
    const savedDoses = localStorage.getItem("takenDoses");

    if (savedDate === getTodayDate() && savedDoses) {
      const parsedDoses = JSON.parse(savedDoses);

      return Array.isArray(parsedDoses) ? parsedDoses : [];
    }

    return [];
  } catch (error) {
    console.error("Error loading taken doses:", error);
    return [];
  }
});

const [, setCurrentTime] = useState(new Date());

useEffect(() => {
  const intervalId = setInterval(() => {
    setCurrentTime(new Date());
  }, 10000);

  return () => {
    clearInterval(intervalId);
  };
}, []);

useEffect(() => {
  function checkDate() {
    const currentDate = getTodayDate();

    if (currentDate !== todayDate) {
      setTodayDate(currentDate);
      setTakenDoses([]);
    }
  }

  checkDate();

  const intervalId = setInterval(checkDate, 30000);

  return () => clearInterval(intervalId);
}, [todayDate]);


useEffect(() => {
  function loadMedicines() {
    const savedMedicines = localStorage.getItem("medicines");

    setMedicines(savedMedicines ? JSON.parse(savedMedicines) : []);
  }

  loadMedicines();
  window.addEventListener("focus", loadMedicines);

  return () => {
    window.removeEventListener("focus", loadMedicines);
  };
}, []);  



useEffect(() => {
  let intervalId;
  let isActive = true;

  async function startReminders() {
    if (!("Notification" in window)) {
      console.log("Browser notifications are not supported.");
      return;
    }

    let permission = Notification.permission;

    if (permission === "default") {
      try {
        permission = await Notification.requestPermission();
      } catch (error) {
        console.error("Permission request failed:", error);
        return;
      }
    }

    if (!isActive || permission !== "granted") {
      console.log("Notification permission:", permission);
      return;
    }

    function checkReminders() {
      if (!isActive) return;

      const now = new Date();
      const storageKey = `notifiedReminders-${getTodayDate()}`;

      let savedReminders = {};

      try {
        savedReminders = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );

        // Purane array format ko reset karna
        if (
          !savedReminders ||
          Array.isArray(savedReminders) ||
          typeof savedReminders !== "object"
        ) {
          savedReminders = {};
        }
      } catch (error) {
        savedReminders = {};
      }

      let storageChanged = false;

      medicines.forEach((medicine) => {
        if (!medicine.time || medicine.id == null) return;

        // Check medicine time format (HH:mm)
        const match = String(medicine.time).match(
          /^([01]\d|2[0-3]):([0-5]\d)$/
        );

        if (!match) return;

        const medicineId = String(medicine.id);
        const reminderKey = `${medicineId}-${medicine.time}`;

        // Check whether medicine is already taken
        const alreadyTaken = takenDoses.some(
          (id) => String(id) === medicineId
        );

        if (alreadyTaken) return;

        // Get previous notification details
        const reminderData = savedReminders[reminderKey] || {
          count: 0,
          lastSent: null,
        };

        // Maximum 2 notifications
        if (reminderData.count >= 2) return;

        const [hour, minute] = medicine.time.split(":").map(Number);

        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // Don't notify before scheduled time
        if (now < scheduledTime) return;

        try {
          // First notification
          if (reminderData.count === 0) {
            new Notification("MediMate - Medicine Reminder 💊", {
              body: `Time to take ${medicine.name} (${medicine.dosage})`,
              tag: `${reminderKey}-first`,
            });

            savedReminders[reminderKey] = {
              count: 1,
              lastSent: now.getTime(),
            };

            storageChanged = true;

            console.log("First notification sent:", medicine.name);
          }

          // Second notification after 10 minutes
          else if (
            reminderData.count === 1 &&
            now.getTime() - reminderData.lastSent >= 10 * 60 * 1000
          ) {
            new Notification("MediMate - Second Reminder 💊", {
              body: `Reminder again! Please take ${medicine.name} (${medicine.dosage})`,
              tag: `${reminderKey}-second`,
            });

            savedReminders[reminderKey] = {
              count: 2,
              lastSent: now.getTime(),
            };

            storageChanged = true;

            console.log("Second notification sent:", medicine.name);
          }
        } catch (error) {
          console.error("Notification creation failed:", error);
        }
      });

      // Save notification data
      if (storageChanged) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(savedReminders)
        );
      }
    }

    checkReminders();

    intervalId = setInterval(checkReminders, 10000);
  }

  startReminders();

  return () => {
    isActive = false;

    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [medicines, takenDoses]);



// Sort medicines according to scheduled time
const todaySchedule = [...medicines].sort((a, b) => {
  return String(a.time || "99:99").localeCompare(
    String(b.time || "99:99")
  );
});

  function getMedicineStatus(medicine) {
  const isTaken = takenDoses.some(
    (id) => String(id) === String(medicine.id)
  );

  if (isTaken) {
    return "Taken";
  }

  if (!medicine.time) {
    return "Upcoming";
  }

  const now = new Date();

  const [hour, minute] = medicine.time.split(":").map(Number);

  const medicineTime = new Date();
  medicineTime.setHours(hour, minute, 0, 0);

  if (now > medicineTime) {
    return "Missed";
  }

  return "Upcoming";
}




   const completedDoses = todaySchedule.filter((medicine) =>
  takenDoses.includes(medicine.id)
).length;


const missedMedicines = todaySchedule.filter(
  (medicine) => getMedicineStatus(medicine) === "Missed"
);

const missedDoses = missedMedicines.length;

const upcomingMedicines = todaySchedule.filter(
  (medicine) => getMedicineStatus(medicine) === "Upcoming"
);

// Search and status filter
const visibleMedicines = todaySchedule.filter((medicine) => {
  const matchesSearch = String(medicine.name || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    getMedicineStatus(medicine) === statusFilter;

  return matchesSearch && matchesStatus;
});

const doseGroups = {
  Morning: visibleMedicines.filter(
    (medicine) => getDosePeriod(medicine.time) === "Morning"
  ),

  Afternoon: visibleMedicines.filter(
    (medicine) => getDosePeriod(medicine.time) === "Afternoon"
  ),

  Night: visibleMedicines.filter(
    (medicine) => getDosePeriod(medicine.time) === "Night"
  ),

  Other: visibleMedicines.filter(
    (medicine) => getDosePeriod(medicine.time) === "Other"
  ),
};

const progressPercentage =
  todaySchedule.length === 0
    ? 0
    : Math.round((completedDoses / todaySchedule.length) * 100);



    
// Save daily medicine report
useEffect(() => {
  const updatedHistory = {
    ...weeklyHistory,
    [todayDate]: {
      total: todaySchedule.length,
      completed: completedDoses,
    },
  };

  try {
    localStorage.setItem(
      "weeklyMedicineHistory",
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error("Error saving weekly medicine history:", error);
  }

}, [weeklyHistory, todayDate, todaySchedule.length, completedDoses]);


// Prepare last 7 days report
const weeklyData = [];

for (let i = 6; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);

  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");


const dayData =
  dateKey === todayDate
    ? {
        total: todaySchedule.length,
        completed: completedDoses,
      }
    : weeklyHistory[dateKey] || {
        total: 0,
        completed: 0,
      };


  const percentage =
    dayData.total === 0
      ? 0
      : Math.round(
          (dayData.completed / dayData.total) * 100
        );

 weeklyData.push({
  day: date.toLocaleDateString("en-US", {
    weekday: "short",
  }),

  fullDate: date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),

  total: dayData.total,
  completed: dayData.completed,
  percentage,
});
}


// Find best and lowest adherence days
const daysWithData = weeklyData.filter(
  (day) => day.total > 0
);

const bestDay =
  daysWithData.length > 0
    ? daysWithData.reduce((best, current) =>
        current.percentage > best.percentage
          ? current
          : best
      )
    : null;

const lowestDay =
  daysWithData.length > 0
    ? daysWithData.reduce((lowest, current) =>
        current.percentage < lowest.percentage
          ? current
          : lowest
      )
    : null;

const weeklyTotal = weeklyData.reduce(
  (sum, day) => sum + day.total,
  0
);

const weeklyCompleted = weeklyData.reduce(
  (sum, day) => sum + day.completed,
  0
);

const weeklyPercentage =
  weeklyTotal === 0
    ? 0
    : Math.round((weeklyCompleted / weeklyTotal) * 100);

useEffect(() => {
  try {
    localStorage.setItem("doseTrackingDate", todayDate);
    localStorage.setItem(
      "takenDoses",
      JSON.stringify(takenDoses)
    );

    console.log("Dose status saved successfully:", takenDoses);
  } catch (error) {
    console.error("Error saving dose status:", error);
  }
}, [takenDoses, todayDate]);




  const summaryCards = [
    {
      title: "Total Medicines",
      value: medicines.length,
      subtitle: "Medicines in your list",
      icon: Pill,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Today's Doses",
      value:todaySchedule.length,
      subtitle: "Scheduled for today",
      icon: CalendarCheck,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Completed Doses",
     value:  completedDoses,
      subtitle: "Doses taken today",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
  title: "Missed Doses",
  value: missedDoses,
  subtitle: "Doses missed today",
  icon: Clock,
  color: "bg-red-100 text-red-600",
},
  ];

  
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <p className="text-sm text-blue-600 font-medium">
         {new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
})}
        </p>

        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Welcome back! 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Let's keep your health on track today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-xl ${card.color}`}
                >
                  <Icon size={24} />
                </div>

                <ArrowRight size={18} className="text-slate-400" />
              </div>

              <p className="text-slate-500 text-sm mt-5">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-1">
                {card.value}
              </h2>

              <p className="text-xs text-slate-400 mt-2">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>


      
{/* Today's Progress */}
<div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
  <div className="mb-3 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-slate-800">
        Today's Progress
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {completedDoses} of {todaySchedule.length} doses completed
      </p>
    </div>

    <span className="text-lg font-bold text-blue-600">
      {progressPercentage}%
    </span>
  </div>

  <div
    className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
    role="progressbar"
    aria-valuenow={progressPercentage}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Today's dose completion progress"
  >
    <div
      className="h-full rounded-full bg-blue-600 transition-all duration-300"
      style={{ width: `${progressPercentage}%` }}
    />
  </div>
</div>

{/* Missed Medicine Section */}
{missedDoses > 0 ? (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">

    <div className="flex items-center gap-3 mb-4">
      <div className="rounded-xl bg-red-100 p-3">
        <Clock className="text-red-600" size={24} />
      </div>

      <div>
        <h2 className="font-bold text-red-700">
          Missed Medicines
        </h2>

        <p className="text-sm text-red-600">
          You have missed {missedDoses} dose
          {missedDoses > 1 ? "s" : ""} today.
        </p>
      </div>
    </div>

    <div className="space-y-3">
      {missedMedicines.map((medicine) => (
        <div
          key={medicine.id}
          className="flex flex-col gap-3 rounded-xl border border-red-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >

          <div>
            <h3 className="font-semibold text-slate-800">
              {medicine.name}
            </h3>

            <p className="text-sm text-slate-500">
              {medicine.dosage}
            </p>

            <p className="text-sm text-slate-500">
              Time: {medicine.time}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setTakenDoses((previous) =>
                previous.some(
                  (id) => String(id) === String(medicine.id)
                )
                  ? previous
                  : [...previous, medicine.id]
              );
            }}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            ✓ Mark as Taken
          </button>

        </div>
      ))}
    </div>

  </div>
) : (
  <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
    <div className="flex items-center gap-3">
      <CheckCircle2 className="text-green-600" size={26} />

      <div>
        <h2 className="font-bold text-green-700">
          Great Job!
        </h2>

        <p className="text-sm text-green-600">
          You have no missed medicine doses today.
        </p>
      </div>
    </div>
  </div>
)}


      {/* Upcoming Medicines Section */}
<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

  <div className="mb-5 flex items-center gap-3">
    <div className="rounded-xl bg-blue-100 p-3">
      <Clock className="text-blue-600" size={24} />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-800">
        Upcoming Medicines
      </h2>

      <p className="text-sm text-slate-500">
        {upcomingMedicines.length} medicines remaining today
      </p>
    </div>
  </div>

  {upcomingMedicines.length === 0 ? (
    <p className="text-sm text-slate-500">
      No upcoming medicines for today.
    </p>
  ) : (
    <div className="space-y-3">
      {upcomingMedicines.map((medicine) => (
        <div
          key={medicine.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
        >
          <div>
            <h3 className="font-semibold text-slate-800">
              {medicine.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {medicine.dosage}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Time: {medicine.time}
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Upcoming
          </span>
        </div>
      ))}
    </div>
  )}

</div>

      {/* Today's schedule */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Today's Schedule
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your upcoming medicine reminders
            </p>
          </div>

          <CalendarCheck className="text-blue-600" size={25} />
        </div>
       

       {/* Search and Filter */}
<div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

  {/* Search Input */}
  <input
    type="text"
    placeholder="Search medicine..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />

  {/* Status Filter */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
  >
    <option value="All">All Medicines</option>
    <option value="Upcoming">Upcoming</option>
    <option value="Taken">Taken</option>
    <option value="Missed">Missed</option>
  </select>

</div>

<div className="space-y-6">
 {visibleMedicines.length === 0 ? (
    <p className="text-slate-500">
      {todaySchedule.length === 0
  ? "No medicines added yet. Add a medicine to see it here."
  : "No matching medicines found."}
    </p>
  ) : (
    Object.entries(doseGroups)
      .filter(([period, groupMedicines]) => groupMedicines.length > 0)
      .map(([period, groupMedicines]) => (
        <div key={period}>
          <h3 className="mb-3 text-lg font-semibold text-slate-800">
            {period === "Morning" && "☀️ Morning Doses"}
            {period === "Afternoon" && "🌤️ Afternoon Doses"}
            {period === "Night" && "🌙 Night Doses"}
            {period === "Other" && "💊 Other Doses"}
          </h3>

          <div className="space-y-3">
            {groupMedicines.map((medicine, index) => {
             const status = getMedicineStatus(medicine);
const isTaken = status === "Taken";

              return (
                <div
                  key={medicine.id ?? index}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800">
                      {medicine.name}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {medicine.dosage}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Time: {medicine.time}
                    </p>
                    
<span
  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    status === "Taken"
      ? "bg-green-100 text-green-700"
      : status === "Missed"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700"
  }`}
>
  {status === "Taken"
    ? "✓ Taken"
    : status === "Missed"
    ? "✕ Missed"
    : "● Upcoming"}
</span>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTakenDoses((previous) =>
                        previous.includes(medicine.id)
                          ? previous.filter((id) => id !== medicine.id)
                          : [...previous, medicine.id]
                      );
                    }}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isTaken
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isTaken ? "✓ Dose Taken" : "Mark as Taken"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))
  )}
</div>


      </section>
    </div>
  );
}

export default Dashboard;
