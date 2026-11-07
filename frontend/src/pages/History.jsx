
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  History as HistoryIcon,
  Pill,
  CheckCircle2,
  Clock,
  Search,
  CalendarDays,
  Download,
} from "lucide-react";

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime12Hour(time) {
  if (!time || time === "-") return "-";

  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function History() {
  const [medicines, setMedicines] = useState([]);
  const [doseHistory, setDoseHistory] = useState({});
  const [selectedDate, setSelectedDate] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    function loadHistory() {
      try {
        setMedicines(
          JSON.parse(localStorage.getItem("medicines") || "[]")
        );

        setDoseHistory(
          JSON.parse(
            localStorage.getItem("medicineDoseHistory") || "{}"
          )
        );
      } catch (error) {
        console.error("History loading failed:", error);
        setMedicines([]);
        setDoseHistory({});
      }
    }

    loadHistory();

    window.addEventListener("focus", loadHistory);

    return () => {
      window.removeEventListener("focus", loadHistory);
    };
  }, []);

  const today = getDateString(new Date());

  // Generate last 30 days history
  const historyData = useMemo(() => {
    const days = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = getDateString(date);
      const takenIds = (doseHistory[dateKey] || []).map(String);

      const dayMedicines = medicines.map((medicine) => {
        const isTaken = takenIds.includes(String(medicine.id));

        let status = "Missed";

        if (isTaken) {
          status = "Taken";
        } else if (dateKey === today) {
          const [hours, minutes] = (medicine.time || "00:00")
            .split(":")
            .map(Number);

          const medicineTime = new Date();
          medicineTime.setHours(hours, minutes, 0, 0);

          status =
            medicineTime < new Date() ? "Missed" : "Upcoming";
        }

        return {
          ...medicine,
          status,
        };
      });

      days.push({
        date: dateKey,
        formattedDate: date.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        medicines: dayMedicines,
      });
    }

    return days;
  }, [medicines, doseHistory, today]);

  // Filter history
  const filteredHistory = historyData
    .filter((day) => {
      return selectedDate === "All" || day.date === selectedDate;
    })
    .map((day) => {
      const filteredMedicines = day.medicines.filter((medicine) => {
        const matchesSearch = (
          medicine.name || ""
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "All" ||
          medicine.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

      return {
        ...day,
        medicines: filteredMedicines,
      };
    })
    .filter((day) => day.medicines.length > 0);

  // Summary for selected filters
  const allVisibleMedicines = filteredHistory.flatMap(
    (day) => day.medicines
  );

  const totalCount = allVisibleMedicines.length;

  const takenCount = allVisibleMedicines.filter(
    (medicine) => medicine.status === "Taken"
  ).length;

  const missedCount = allVisibleMedicines.filter(
    (medicine) => medicine.status === "Missed"
  ).length;

  const upcomingCount = allVisibleMedicines.filter(
    (medicine) => medicine.status === "Upcoming"
  ).length;

  // Medicine-wise Report
const medicineStats = medicines.map((medicine) => {
  const records = historyData.flatMap((day) =>
    day.medicines.filter(
      (item) => String(item.id) === String(medicine.id)
    )
  );

  const taken = records.filter(
    (item) => item.status === "Taken"
  ).length;

  const missed = records.filter(
    (item) => item.status === "Missed"
  ).length;

  const total = taken + missed;

  const adherence =
    total === 0
      ? 0
      : Math.round((taken / total) * 100);

  return {
    ...medicine,
    taken,
    missed,
    total,
    adherence,
  };
});

// PDF Export
const downloadHistoryPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("MediMate - Medicine History Report", 14, 20);

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-IN")}`,
    14,
    28
  );

  doc.text(
    `Total Records: ${totalCount} | Taken: ${takenCount} | Missed: ${missedCount}`,
    14,
    36
  );

  autoTable(doc, {
    startY: 44,
    head: [["Date", "Medicine", "Dosage", "Time", "Status"]],
    body: filteredHistory.flatMap((day) =>
      day.medicines.map((medicine) => [
        day.date,
        medicine.name || "-",
        medicine.dosage || "-",
       formatTime12Hour(medicine.time),
        medicine.status,
      ])
    ),
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  doc.save("MediMate-History-Report.pdf");
};

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Medicine Records
        </p>

        <h1 className="text-3xl font-bold text-gray-800 mt-2">
          Medicine History
        </h1>

        <p className="text-gray-500 mt-2">
          View your medicine-taking history for the last 30 days.
        </p>
        <button
  onClick={downloadHistoryPDF}
  className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition"
>
  <Download size={18} />
  Download PDF
</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Records</p>
            <Pill className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mt-3">
            {totalCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Taken</p>
            <CheckCircle2 className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mt-3">
            {takenCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Missed</p>
            <Clock className="text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-red-600 mt-3">
            {missedCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Upcoming</p>
            <CalendarDays className="text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-yellow-600 mt-3">
            {upcomingCount}
          </h2>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              placeholder="Search medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">Last 30 Days</option>

            {historyData.map((day) => (
              <option key={day.date} value={day.date}>
                {day.formattedDate}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>
            <option value="Taken">Taken</option>
            <option value="Missed">Missed</option>
            <option value="Upcoming">Upcoming</option>
          </select>

        </div>

      </div>


{/* Medicine-wise Report */}
<div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">

  <div className="mb-5">
    <h2 className="text-lg font-bold text-gray-800">
      Medicine-wise Report
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Medicine completion over the last 30 days
    </p>
  </div>

  {medicineStats.length === 0 ? (
    <p className="text-sm text-gray-400">
      No medicines available.
    </p>
  ) : (
    <div className="space-y-5">

      {medicineStats.map((medicine) => (
        <div
          key={medicine.id}
          className="border border-gray-100 rounded-xl p-4"
        >

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Pill className="text-blue-600" size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  {medicine.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {medicine.dosage}
                </p>
              </div>
            </div>

            <span className="text-lg font-bold text-blue-600">
              {medicine.adherence}%
            </span>

          </div>

          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{
                width: `${medicine.adherence}%`,
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <span className="text-green-600">
              Taken: {medicine.taken}
            </span>

            <span className="text-red-600">
              Missed: {medicine.missed}
            </span>

            <span className="text-gray-500">
              Total: {medicine.total}
            </span>
          </div>

        </div>
      ))}

    </div>
  )}

</div>

      {/* History List */}
      <div className="space-y-5">

        <div className="flex items-center gap-2">
          <HistoryIcon className="text-blue-600" size={22} />
          <h2 className="text-xl font-bold text-gray-800">
            History Records
          </h2>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <HistoryIcon
              className="mx-auto text-gray-300 mb-3"
              size={42}
            />

            <h3 className="font-semibold text-gray-700">
              No History Found
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          filteredHistory.map((day) => (
            <div
              key={day.date}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >

              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">
                    {day.formattedDate}
                  </h3>

                  {day.date === today && (
                    <span className="text-xs text-blue-600 font-medium">
                      Today
                    </span>
                  )}
                </div>

                <span className="text-sm text-gray-500">
                  {day.medicines.length} records
                </span>
              </div>

              <div className="space-y-3">

                {day.medicines.map((medicine) => (
                  <div
                    key={`${day.date}-${medicine.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 rounded-xl p-4"
                  >

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Pill className="text-blue-600" size={22} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {medicine.name}
                        </h4>

                        <p className="text-sm text-gray-500">
                          {medicine.dosage}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                         Time: {formatTime12Hour(medicine.time)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.status === "Taken"
                          ? "bg-green-100 text-green-700"
                          : medicine.status === "Missed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {medicine.status}
                    </span>

                  </div>
                ))}

              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default History;
