import { useState, useEffect } from "react";
import { Pill, Plus, Search, X, Trash2, Pencil } from "lucide-react";

function Medicines() {
const [medicines, setMedicines] = useState(() => {
  const savedMedicines = localStorage.getItem("medicines");

  return savedMedicines ? JSON.parse(savedMedicines) : [];
});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    time: "",
  });

  const [timeParts, setTimeParts] = useState({
  hour: "",
  minute: "",
  period: "AM",
});
  useEffect(() => {
  localStorage.setItem("medicines", JSON.stringify(medicines));
}, [medicines]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


function handleSubmit(e) {
  e.preventDefault();

 const hour = Number(timeParts.hour);
const minute = Number(timeParts.minute);

if (!timeParts.hour || !timeParts.minute) {
  alert("Please select reminder time.");
  return;
}

let hour24 = hour;

if (timeParts.period === "PM" && hour !== 12) {
  hour24 = hour + 12;
}

if (timeParts.period === "AM" && hour === 12) {
  hour24 = 0;
}

const formattedTime =
  `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

const medicineData = {
  name: formData.name.trim(),
  dosage: formData.dosage.trim(),
  time: formattedTime,
};


  if (editingId !== null) {
    // Existing medicine update hogi
    setMedicines((previous) =>
      previous.map((medicine) =>
        medicine.id === editingId
          ? { ...medicine, ...medicineData }
          : medicine
      )
    );
  } else {
    // Nayi medicine add hogi
    const newMedicine = {
      id: Date.now(),
      ...medicineData,
    };

    setMedicines((previous) => [...previous, newMedicine]);
  }

  // Form reset
  setFormData({
    name: "",
    dosage: "",
    time: "",
  });

  setTimeParts({
  hour: "",
  minute: "",
  period: "AM",
});

  setEditingId(null);
  setShowForm(false);
}



function handleDelete(id) {
  const confirmDelete = window.confirm(
    "Delete this medicine?"
  );

  if (confirmDelete) {
    setMedicines((previous) =>
      previous.filter((medicine) => medicine.id !== id)
    );
  }
}

function handleEdit(medicine) {
  const [hours, minutes] = medicine.time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  setFormData({
    name: medicine.name,
    dosage: medicine.dosage,
    time: medicine.time,
  });

  setTimeParts({
    hour: String(hour12),
    minute: String(minutes).padStart(2, "0"),
    period: period,
  });

  setEditingId(medicine.id);
  setShowForm(true);
}


  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Medicines</h1>
          <p className="text-slate-500 mt-2">
            Manage your medicines and daily schedule.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Medicine
        </button>
      </div>

      {/* Add Medicine Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Add New Medicine
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-slate-800"
              aria-label="Close form"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Medicine Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter medicine name"
                required
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dosage
              </label>
              <input
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g. 1 tablet (as prescribed)"
                required
                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500"
              />
            </div>

           <div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Reminder Time
  </label>

  <div className="grid grid-cols-3 gap-3">

    {/* Hour */}
    <select
      value={timeParts.hour}
      onChange={(e) =>
        setTimeParts((prev) => ({
          ...prev,
          hour: e.target.value,
        }))
      }
      required
      className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-white"
    >
      <option value="">Hour</option>

      {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
        <option key={hour} value={String(hour)}>
          {String(hour).padStart(2, "0")}
        </option>
      ))}
    </select>

    {/* Minutes */}
    <select
      value={timeParts.minute}
      onChange={(e) =>
        setTimeParts((prev) => ({
          ...prev,
          minute: e.target.value,
        }))
      }
      required
      className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-white"
    >
      <option value="">Minute</option>

      {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
        <option
          key={minute}
          value={String(minute).padStart(2, "0")}
        >
          {String(minute).padStart(2, "0")}
        </option>
      ))}
    </select>

    {/* AM / PM */}
    <select
      value={timeParts.period}
      onChange={(e) =>
        setTimeParts((prev) => ({
          ...prev,
          period: e.target.value,
        }))
      }
      className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-white"
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>

  </div>
</div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
              >
             {editingId !== null ? "Update Medicine" : "Save Medicine"}         
                  </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-200 text-slate-600 px-5 py-3 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..."
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />
      </div>

      {/* Total Count */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">Total Medicines</p>
        <h2 className="text-3xl font-bold text-slate-800 mt-2">
          {medicines.length}
        </h2>
      </div>

      {/* Medicine List */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
          <div className="mx-auto bg-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center">
            <Pill size={32} />
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mt-5">
            {search ? "No matching medicines" : "No medicines added yet"}
          </h2>

          <p className="text-slate-500 mt-2">
            Add your first medicine to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <Pill size={24} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    {medicine.name}
                  </h3>
                  <p className="text-sm text-slate-500">{medicine.dosage}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                Reminder: {medicine.time}
              </p>


              {/* Delete button */}
              
<div className="flex justify-end gap-2 mt-4">
  <button
    type="button"
    onClick={() => handleEdit(medicine)}
    className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
  >
    <Pencil size={16} />
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleDelete(medicine.id)}
    className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
  >
    <Trash2 size={16} />
    Delete
  </button>
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Medicines;
