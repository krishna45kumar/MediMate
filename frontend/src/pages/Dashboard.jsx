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

function Dashboard() { 

  const [medicines, setMedicines] = useState([]);

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

const todaySchedule = medicines;


  const [takenDoses, setTakenDoses] = useState([true, false, false]);
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
      value: "6",
      subtitle: "Scheduled for today",
      icon: CalendarCheck,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Completed Doses",
     value: `${takenDoses.filter(Boolean).length} / 3`,
      subtitle: "Doses taken today",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <p className="text-sm text-blue-600 font-medium">
          Tuesday, October 13, 2026
        </p>

        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Welcome back! 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Let's keep your health on track today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
        
<div className="space-y-4">
  {todaySchedule.length === 0 ? (
    <p className="text-slate-500">
      No medicines added yet. Add a medicine to see it here.
    </p>
  ) : (
    todaySchedule.map((medicine, index) => (
      <div
        key={medicine.id ?? index}
        className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4"
      >
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800">
            {medicine.name}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {medicine.dosage}
          </p>
        </div>

        <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">
          {medicine.time}
        </span>
      </div>
    ))
  )}
</div>

      </section>
    </div>
  );
}

export default Dashboard;
