import { useState } from "react";
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
  const [takenDoses, setTakenDoses] = useState([true, false, false]);
  const summaryCards = [
    {
      title: "Total Medicines",
      value: "4",
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

  const schedule = [
    {
      time: "08:00 AM",
      period: "Morning",
      medicine: "Vitamin D",
      dose: "1 tablet",
      icon: Sun,
      color: "bg-amber-100 text-amber-600",
      status: "Taken",
    },
    {
      time: "01:00 PM",
      period: "Afternoon",
      medicine: "Medicine B",
      dose: "1 tablet",
      icon: Sunset,
      color: "bg-orange-100 text-orange-600",
      status: "Upcoming",
    },
    {
      time: "09:00 PM",
      period: "Night",
      medicine: "Medicine C",
      dose: "1 tablet",
      icon: Moon,
      color: "bg-indigo-100 text-indigo-600",
      status: "Upcoming",
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
         {schedule.map((item, index) => {
  const Icon = item.icon;
  const isTaken = takenDoses[index];

  return (
    <div
      key={item.period}
      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50"
    >
      <div className={`p-3 rounded-xl ${item.color}`}>
        <Icon size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800">
          {item.medicine}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {item.period} · {item.dose} · {item.time}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setTakenDoses((previous) =>
            previous.map((taken, i) =>
              i === index ? !taken : taken
            )
          );
        }}
        className={`text-xs font-semibold px-3 py-2 rounded-full ${
          isTaken
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {isTaken ? "Taken ✓" : "Mark as Taken"}
      </button>
    </div>
  );
})}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
