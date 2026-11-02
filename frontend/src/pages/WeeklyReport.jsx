import { useMemo } from "react";
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function WeeklyChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">{data.fullDate}</p>
      <p className="text-sm text-blue-600">Completed: {data.completed}</p>
      <p className="text-sm text-slate-500">Total Scheduled: {data.total}</p>
      <p className="mt-2 font-semibold text-green-600">
        Adherence: {data.percentage}%
      </p>
    </div>
  );
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function WeeklyReport() {
  const todayDate = getTodayDate();

  // Load medicine-wise weekly history
const doseHistory = useMemo(() => {
  try {
    return JSON.parse(
      localStorage.getItem("weeklyMedicineHistory") || "{}"
    );
  } catch (error) {
    console.error("Unable to load dose history:", error);
    return {};
  }
}, [todayDate]);

  const weeklyData = useMemo(() => {
    let history = {};
    let medicines = [];
    let takenDoses = [];

    try {
      history = JSON.parse(localStorage.getItem("weeklyMedicineHistory") || "{}");
      medicines = JSON.parse(localStorage.getItem("medicines") || "[]");

      const savedDate = localStorage.getItem("doseTrackingDate");
      const savedDoses = JSON.parse(localStorage.getItem("takenDoses") || "[]");

      if (savedDate === todayDate && Array.isArray(savedDoses)) {
        takenDoses = savedDoses;
      }
    } catch (error) {
      console.error("Unable to load weekly report data:", error);
    }

    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      let dayData = history[dateKey] || { total: 0, completed: 0 };

      // Aaj ka data current medicines aur taken doses se calculate hoga.
      if (dateKey === todayDate) {
        dayData = {
          total: medicines.length,
          completed: takenDoses.length,
        };
      }

      const total = Number(dayData.total) || 0;
      const completed = Math.min(Number(dayData.completed) || 0, total);
      const percentage =
        total === 0 ? 0 : Math.round((completed / total) * 100);

      days.push({
        dateKey,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        total,
        completed,
        percentage,
      });
    }

    return days;
  }, [todayDate]);

  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.total, 0);
  const weeklyCompleted = weeklyData.reduce(
    (sum, day) => sum + day.completed,
    0
  );
  const weeklyPercentage =
    weeklyTotal === 0
      ? 0
      : Math.round((weeklyCompleted / weeklyTotal) * 100);

  const daysWithData = weeklyData.filter((day) => day.total > 0);

  const bestDay =
    daysWithData.length > 0
      ? daysWithData.reduce((best, current) =>
          current.percentage > best.percentage ? current : best
        )
      : null;

  const lowestDay =
    daysWithData.length > 0
      ? daysWithData.reduce((lowest, current) =>
          current.percentage < lowest.percentage ? current : lowest
        )
      : null;

      // Download Weekly Report PDF
const handleDownloadWeeklyReport = () => {
  const doc = new jsPDF();

  // Title
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("MediMate", 20, 17);

  doc.setFontSize(13);
  doc.text("Weekly Medicine Report", 20, 28);

  // Generated date
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-IN")}`,
    20,
    48
  );

  // Weekly Summary
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Weekly Summary", 20, 62);

  doc.setFontSize(11);
  doc.text(`Weekly Adherence: ${weeklyPercentage}%`, 20, 74);
  doc.text(`Completed Doses: ${weeklyCompleted}`, 20, 84);
  doc.text(`Total Scheduled: ${weeklyTotal}`, 20, 94);

  // Best and Lowest Day
  doc.setFontSize(14);
  doc.text("Adherence Highlights", 20, 112);

  doc.setFontSize(11);

  doc.text(
    `Best Day: ${
      bestDay
        ? `${bestDay.day} (${bestDay.percentage}%)`
        : "No data"
    }`,
    20,
    124
  );

  doc.text(
    `Lowest Day: ${
      lowestDay
        ? `${lowestDay.day} (${lowestDay.percentage}%)`
        : "No data"
    }`,
    20,
    134
  );

  // Daily Report
  doc.setFontSize(14);
  doc.text("Last 7 Days Report", 20, 154);

  let y = 168;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.text("Date", 20, y);
  doc.text("Completed", 85, y);
  doc.text("Total", 130, y);
  doc.text("Adherence", 165, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  weeklyData.forEach((day) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.text(day.fullDate, 20, y);
    doc.text(String(day.completed), 90, y);
    doc.text(String(day.total), 135, y);
    doc.text(`${day.percentage}%`, 165, y);

    y += 10;
  });


  // Weekly Adherence Chart
doc.addPage();

doc.setFontSize(16);
doc.setTextColor(30, 41, 59);
doc.text("Weekly Adherence Chart", 20, 30);

doc.setFontSize(10);
doc.setTextColor(100, 116, 139);
doc.text("Daily medicine adherence percentage", 20, 40);

// Chart background and baseline
doc.setDrawColor(203, 213, 225);
doc.line(20, 190, 190, 190);

// Y-axis labels
doc.setFontSize(9);

[0, 25, 50, 75, 100].forEach((value) => {
  const labelY = 190 - value * 0.9;

  doc.text(`${value}%`, 10, labelY + 2);
  doc.setDrawColor(226, 232, 240);
  doc.line(20, labelY, 190, labelY);
});

// Draw bars
weeklyData.forEach((day, index) => {
  const x = 27 + index * 23;
  const barHeight = day.percentage * 0.9;
  const barY = 190 - barHeight;

  doc.setFillColor(37, 99, 235);

  doc.rect(
    x,
    barY,
    12,
    barHeight,
    "F"
  );

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text(
    `${day.percentage}%`,
    x + 6,
    barY - 5,
    { align: "center" }
  );

  doc.text(
    day.day,
    x + 6,
    200,
    { align: "center" }
  );
});


  // Medicine Details Section
const medicines = JSON.parse(
  localStorage.getItem("medicines") || "[]"
);

doc.addPage();

doc.setFontSize(16);
doc.setTextColor(30, 41, 59);
doc.text("Medicine Details", 20, 20);

doc.setFontSize(10);
doc.setFont("helvetica", "bold");

doc.text("Medicine Name", 20, 35);
doc.text("Dosage", 95, 35);
doc.text("Reminder Time", 150, 35);

doc.setFont("helvetica", "normal");

let medicineY = 45;

if (medicines.length === 0) {
  doc.text("No medicines found.", 20, medicineY);
} else {
  medicines.forEach((medicine) => {
    if (medicineY > 275) {
      doc.addPage();
      medicineY = 20;
    }

    const nameLines = doc.splitTextToSize(
      medicine.name || "N/A",
      65
    );

    const dosageLines = doc.splitTextToSize(
      medicine.dosage || "N/A",
      45
    );

    const timeLines = doc.splitTextToSize(
      medicine.time || "N/A",
      35
    );

    doc.text(nameLines, 20, medicineY);
    doc.text(dosageLines, 95, medicineY);
    doc.text(timeLines, 150, medicineY);

    const maxLines = Math.max(
      nameLines.length,
      dosageLines.length,
      timeLines.length
    );

    medicineY += maxLines * 6 + 8;
  });
}

// Add professional header and footer to every page
const totalPages = doc.internal.getNumberOfPages();

for (let page = 1; page <= totalPages; page++) {
  doc.setPage(page);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);

  doc.text("MEDIMATE", 20, 20);

  
doc.setFont("helvetica", "normal");


doc.setFont("helvetica", "normal");

// Weekly Medicine Report ko dark color
doc.setTextColor(30, 41, 59);

doc.text("Weekly Medicine Report", 190, 8, {
  align: "right",
});

// White line ko MediMate ke upar rakho
doc.setDrawColor(255, 255, 255);
doc.line(20, 9, 190, 9);



  // Footer
  doc.line(20, 285, 190, 285);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    20,
    292
  );

  doc.text(
    `Page ${page} of ${totalPages}`,
    190,
    292,
    { align: "right" }
  );
}


// Dose-wise Medicine History
doc.addPage();

doc.setFontSize(16);
doc.setTextColor(30, 41, 59);
doc.text("Dose-wise Medicine History", 20, 25);

let historyY = 40;

weeklyData.forEach((day) => {
  const dayHistory = doseHistory[day.dateKey];

  // Add another page if space is insufficient
  if (historyY > 255) {
    doc.addPage();
    historyY = 25;
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(day.fullDate, 20, historyY);

  historyY += 9;

  if (!dayHistory || !dayHistory.doseDetails) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Individual medicine history not available for this date.",
      20,
      historyY
    );
    historyY += 12;
    return;
  }

  dayHistory.doseDetails.forEach((medicine) => {
    if (historyY > 270) {
      doc.addPage();
      historyY = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    doc.text(
      `${medicine.name || "Medicine"} - ${medicine.dosage || "N/A"}`,
      20,
      historyY
    );

    historyY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      `Time: ${medicine.time || "N/A"}`,
      25,
      historyY
    );

    const status = medicine.status || "Unknown";

    if (status === "Taken") {
      doc.setTextColor(22, 163, 74);
    } else if (status === "Missed") {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(217, 119, 6);
    }

    doc.text(`Status: ${status}`, 100, historyY);

    historyY += 10;
    doc.setTextColor(30, 41, 59);
  });

  historyY += 5;
});
  // Save PDF
  doc.save("MediMate-Weekly-Report.pdf");
};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">
          Weekly Medicine Report
        </h1>
        <button
  onClick={handleDownloadWeeklyReport}
  className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
>
  Download Weekly Report PDF
</button>
        <p className="mt-2 text-slate-500">
          Your medicine adherence over the last 7 days
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-slate-500">Weekly Adherence</p>
            <h2 className="mt-1 text-2xl font-bold text-blue-600">
              {weeklyPercentage}%
            </h2>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-slate-500">Completed Doses</p>
            <h2 className="mt-1 text-2xl font-bold text-green-600">
              {weeklyCompleted}
            </h2>
          </div>
          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-sm text-slate-500">Total Scheduled</p>
            <h2 className="mt-1 text-2xl font-bold text-purple-600">
              {weeklyTotal}
            </h2>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-700">
            Best Adherence Day
          </p>
          {bestDay ? (
            <>
              <h2 className="mt-2 text-xl font-bold text-green-800">
                {bestDay.day}
              </h2>
              <p className="mt-1 text-sm text-green-700">
                {bestDay.completed}/{bestDay.total} doses completed
              </p>
              <p className="mt-2 text-2xl font-bold text-green-800">
                {bestDay.percentage}%
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-green-700">No data available yet</p>
          )}
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-700">
            Lowest Adherence Day
          </p>
          {lowestDay ? (
            <>
              <h2 className="mt-2 text-xl font-bold text-orange-800">
                {lowestDay.day}
              </h2>
              <p className="mt-1 text-sm text-orange-700">
                {lowestDay.completed}/{lowestDay.total} doses completed
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-800">
                {lowestDay.percentage}%
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-orange-700">No data available yet</p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-800">
          Weekly Dose Overview
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<WeeklyChartTooltip />} />
              <Bar
                dataKey="completed"
                name="Completed Doses"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="total"
                name="Total Scheduled"
                fill="#cbd5e1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-800">
          Daily Report
        </h2>
        <div className="space-y-5">
          {weeklyData.map((day) => (
            <div key={day.fullDate}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-medium text-slate-700">{day.day}</span>
                <span className="text-sm text-slate-500">
                  {day.completed}/{day.total} doses · {day.percentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${day.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default WeeklyReport;
