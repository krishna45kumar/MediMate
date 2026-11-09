import { useState, useEffect } from "react";
import {
  Pill,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime12Hour(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
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


function Dashboard() {

  const [medicines, setMedicines] = useState([]);
const [todayDate, setTodayDate] = useState(getTodayDate);


// Search medicine
const [searchTerm, setSearchTerm] = useState("");

// Filter medicine by status
const [statusFilter, setStatusFilter] = useState("All");

// Weekly medicine history
const [weeklyHistory] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("weeklyMedicineHistory") || "{}"
    );
  } catch {
    return {};
  }
});

const [takenDoses, setTakenDoses] = useState(() => {
  try {
    const history = JSON.parse(
      localStorage.getItem("medicineDoseHistory") || "{}"
    );

    const today = getTodayDate();

    if (history[today]) {
      return history[today].map(String);
    }

    // Purane saved data ko support karo
    const savedDate = localStorage.getItem("doseTrackingDate");

    if (savedDate === today) {
      return JSON.parse(
        localStorage.getItem("takenDoses") || "[]"
      ).map(String);
    }

    return [];
  } catch {
    return [];
  }
});

const [currentTime, setCurrentTime] = useState(new Date());
useEffect(() => {
  const intervalId = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => {
    clearInterval(intervalId);
  };
}, []);

useEffect(() => {
  function checkDate() {
    const currentDate = getTodayDate();

  if (currentDate !== todayDate) {
  setTodayDate(currentDate);

  try {
    const history = JSON.parse(
      localStorage.getItem("medicineDoseHistory") || "{}"
    );

    setTakenDoses(
      (history[currentDate] || []).map(String)
    );
  } catch {
    setTakenDoses([]);
  }
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

    // Check Notification Setting
    const notificationsEnabled =
      localStorage.getItem("medicineNotificationsEnabled") !== "false";

    if (!notificationsEnabled) {
      console.log("Medicine notifications are disabled in Settings.");
      return;
    }

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
      } catch {
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
  takenDoses.some(
    (id) => String(id) === String(medicine.id)
  )
).length;

const missedMedicines = todaySchedule.filter(
  (medicine) => getMedicineStatus(medicine) === "Missed"
);

const missedDoses = missedMedicines.length;

const upcomingMedicines = todaySchedule.filter(
  (medicine) => getMedicineStatus(medicine) === "Upcoming"
);

// Find the next upcoming medicine
const nextUpcomingMedicine = upcomingMedicines
  .map((medicine) => {
    if (!medicine.time) return null;

    const match = String(medicine.time).match(
      /^([01]\d|2[0-3]):([0-5]\d)$/
    );

    if (!match) return null;

    const [, hour, minute] = match;

    const medicineDate = new Date();
    medicineDate.setHours(Number(hour), Number(minute), 0, 0);

    return {
      ...medicine,
      scheduledDate: medicineDate,
    };
  })
  .filter(
    (medicine) =>
      medicine && medicine.scheduledDate > currentTime
  )
  .sort(
    (a, b) =>
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
  )[0] || null;

// Calculate remaining time
let countdownText = "";

if (nextUpcomingMedicine) {
  const difference =
    nextUpcomingMedicine.scheduledDate.getTime() -
    currentTime.getTime();

  const hours = Math.floor(difference / (1000 * 60 * 60));

  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) / (1000 * 60)
  );

  const seconds = Math.floor(
    (difference % (1000 * 60)) / 1000
  );

  if (hours > 0) {
    countdownText = `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    countdownText = `${minutes}m ${seconds}s remaining`;
  } else {
    countdownText = `${seconds}s remaining`;
  }
}

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


useEffect(() => {
  try {
    const history = JSON.parse(
      localStorage.getItem("medicineDoseHistory") || "{}"
    );

    history[todayDate] = takenDoses.map(String);

    localStorage.setItem(
      "medicineDoseHistory",
      JSON.stringify(history)
    );

    // Existing features ke saath compatibility
    localStorage.setItem("doseTrackingDate", todayDate);
    localStorage.setItem(
      "takenDoses",
      JSON.stringify(takenDoses)
    );
  } catch (error) {
    console.error("Error saving dose history:", error);
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

      
{/* Progress + Summary Cards */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

  {/* Today's Progress Circular Card */}
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col items-center justify-center">

    <h2 className="text-sm font-bold text-slate-700 mb-3">
      Today's Progress
    </h2>

    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: "100px",
        height: "100px",
        background: `conic-gradient(#2563eb ${progressPercentage * 3.6}deg, #e2e8f0 0deg)`
      }}
    >
      <div className="w-[82px] h-[82px] rounded-full bg-white flex items-center justify-center">
        <span className="text-xl font-bold text-blue-600">
          {progressPercentage}%
        </span>
      </div>
    </div>

    <p className="text-xs text-slate-500 mt-3 text-center">
      {completedDoses} of {todaySchedule.length} taken
    </p>

    <p className="text-xs text-slate-400 mt-1 text-center">
      Keep your health on track!
    </p>

  </div>

  {/* Existing 4 Summary Cards */}
  {summaryCards.map((card) => {
    const Icon = card.icon;

    return (
      <div
        key={card.title}
        className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">

          <div className={`p-3 rounded-xl ${card.color}`}>
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
           Time: {formatTime12Hour(medicine.time)}
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
      : [...previous, String(medicine.id)]
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


{/* Next Upcoming Medicine Section */}
<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

  <div className="mb-5 flex items-center gap-3">
    <div className="rounded-xl bg-blue-100 p-3">
      <Clock className="text-blue-600" size={24} />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-800">
        Upcoming Medicine
      </h2>

      <p className="text-sm text-slate-500">
        Your next medicine reminder
      </p>
    </div>
  </div>

  {nextUpcomingMedicine ? (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {nextUpcomingMedicine.name}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Dosage: {nextUpcomingMedicine.dosage}
          </p>

          <p className="mt-1 text-sm text-slate-600">
           Scheduled Time: {formatTime12Hour(nextUpcomingMedicine.time)}
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Next Dose
        </span>

      </div>

      <div className="mt-5 border-t border-blue-200 pt-4">

        <p className="text-sm text-slate-500">
          Time Remaining
        </p>

        <h2 className="mt-1 text-2xl font-bold text-blue-600">
          {countdownText}
        </h2>

      </div>

    </div>
  ) : (
    <div className="rounded-xl border border-green-100 bg-green-50 p-5">

      <div className="flex items-center gap-3">
        <CheckCircle2 className="text-green-600" size={28} />

        <div>
          <h3 className="font-bold text-green-700">
            All Done for Today!
          </h3>

          <p className="mt-1 text-sm text-green-600">
            No upcoming medicines remaining today.
          </p>
        </div>
      </div>

    </div>
  )}

</div>

   
      {/* Today's Schedule */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        {/* Header */}
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
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Search medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

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

        {/* Three Schedule Cards */}
        {visibleMedicines.length === 0 ? (
          <p className="text-slate-500 py-4">
            {todaySchedule.length === 0
              ? "No medicines added yet. Add a medicine to see it here."
              : "No matching medicines found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              {
                name: "Morning",
                emoji: "🌅",
                timing: "5:00 AM - 12:00 PM",
                medicines: doseGroups.Morning,
                color: "bg-amber-50",
              },
              {
                name: "Afternoon",
                emoji: "☀️",
                timing: "12:00 PM - 5:00 PM",
                medicines: doseGroups.Afternoon,
                color: "bg-orange-50",
              },
              {
                name: "Night",
                emoji: "🌙",
                timing: "5:00 PM - 5:00 AM",
                medicines: doseGroups.Night,
                color: "bg-purple-50",
              },
            ].map((period) => (
              <div
                key={period.name}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className={`${period.color} p-4`}>
                  <h3 className="font-bold text-slate-800">
                    {period.name} {period.emoji}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {period.timing}
                  </p>
                </div>

                {/* Medicine List */}
                <div className="p-4">
                  {period.medicines.length === 0 ? (
                    <p className="text-sm text-slate-400 py-3">
                      No medicines scheduled.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {period.medicines.map((medicine) => {
                        const status = getMedicineStatus(medicine);
                        const isTaken = status === "Taken";

                        return (
                          <div
                            key={medicine.id}
                            className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-sm text-slate-800">
                                  {medicine.name}
                                </h4>

                                <p className="text-xs text-slate-500 mt-1">
                                  {medicine.dosage}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  Time: {medicine.time}
                                </p>
                              </div>

                              <Pill
                                size={18}
                                className="text-blue-500 shrink-0"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

                              <button
                                type="button"
                                onClick={() => {
  setTakenDoses((previous) =>
    isTaken
      ? previous.filter(
          (id) => String(id) !== String(medicine.id)
        )
      : [...previous, String(medicine.id)]
  );
}}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                  isTaken
                                    ? "bg-green-100 text-green-700 cursor-default"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {isTaken ? "✓ Dose Taken" : "Mark as Taken"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other Medicines - if any */}
        {doseGroups.Other.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-3">
              💊 Other Medicines
            </h3>

            <div className="space-y-3">
              {doseGroups.Other.map((medicine) => {
                const status = getMedicineStatus(medicine);

                return (
                  <div
                    key={medicine.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {medicine.name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {medicine.dosage} • {medicine.time}
                      </p>
                    </div>

                    <button
                      type="button"
                    onClick={() => {
  setTakenDoses((previous) =>
    status === "Taken"
      ? previous.filter(
          (id) => String(id) !== String(medicine.id)
        )
      : [...previous, String(medicine.id)]
  );
}}
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        status === "Taken"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {status === "Taken" ? "✓ Dose Taken" : "Mark as Taken"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <CheckCircle2 className="text-blue-600" size={25} />
          </div>

          <div>
            <h3 className="font-semibold text-blue-700">
              Small steps every day make a big difference!
            </h3>
            <p className="text-sm text-blue-500 mt-1">
              You're doing great. Keep it up!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
